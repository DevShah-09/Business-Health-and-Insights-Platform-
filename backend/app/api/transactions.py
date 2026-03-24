"""app/api/transactions.py — Transaction CRUD + Multi-source ingestion (CSV, PDF, SMS, UPI)"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, update

from app.database.database import get_db
from app.models.transaction import Transaction, TransactionType
from app.schemas.schemas import (
    TransactionCreate, TransactionRead, UploadResponse, 
    InvoiceExtractionResponse, BulkIngestionResponse
)
from app.services.ingestion import (
    parse_upload_file, df_to_transaction_dicts, auto_categorize,
    extract_text_from_pdf, extract_invoice_data,
    parse_sms_logs, parse_upi_logs, 
    parsed_transactions_to_dicts
)

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# Manual Transaction Management
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/businesses/{business_id}/transactions", response_model=TransactionRead, status_code=201)
async def create_transaction(
    business_id: uuid.UUID,
    payload: TransactionCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a single transaction manually."""
    # Auto-categorize if not provided
    category = payload.category
    if not category and payload.description:
        category = auto_categorize(payload.description)
    
    tx = Transaction(
        business_id=business_id,
        type=TransactionType(payload.type.lower()),
        amount=payload.amount,
        category=category,
        description=payload.description,
        transaction_date=payload.transaction_date,
        source="manual"
    )
    db.add(tx)
    await db.flush()
    await db.refresh(tx)
    return tx


@router.get("/businesses/{business_id}/transactions", response_model=list[TransactionRead])
async def list_transactions(
    business_id: uuid.UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    tx_type: str = Query(None, description="Filter by 'income' or 'expense'"),
    category: str = Query(None, description="Filter by category"),
    db: AsyncSession = Depends(get_db),
):
    """List transactions with optional filters."""
    query = select(Transaction).where(Transaction.business_id == business_id)
    
    if tx_type:
        query = query.where(Transaction.type == TransactionType(tx_type.lower()))
    if category:
        query = query.where(Transaction.category == category)
    
    query = query.order_by(Transaction.transaction_date.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/businesses/{business_id}/transactions/{transaction_id}", response_model=TransactionRead)
async def get_transaction(
    business_id: uuid.UUID,
    transaction_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a single transaction by ID."""
    result = await db.execute(
        select(Transaction).where(
            (Transaction.id == transaction_id) & 
            (Transaction.business_id == business_id)
        )
    )
    tx = result.scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


@router.put("/businesses/{business_id}/transactions/{transaction_id}", response_model=TransactionRead)
async def update_transaction(
    business_id: uuid.UUID,
    transaction_id: uuid.UUID,
    payload: TransactionCreate,
    db: AsyncSession = Depends(get_db),
):
    """Update a single transaction manually."""
    result = await db.execute(
        select(Transaction).where(
            (Transaction.id == transaction_id) & 
            (Transaction.business_id == business_id)
        )
    )
    tx = result.scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    category = payload.category
    if not category and payload.description:
        category = auto_categorize(payload.description)
        
    tx.type = TransactionType(payload.type.lower())
    tx.amount = payload.amount
    tx.category = category
    tx.description = payload.description
    tx.transaction_date = payload.transaction_date
    
    await db.commit()
    await db.refresh(tx)
    return tx


@router.delete("/businesses/{business_id}/transactions/{transaction_id}", status_code=204)
async def delete_transaction(
    business_id: uuid.UUID,
    transaction_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Delete a transaction."""
    result = await db.execute(
        select(Transaction).where(
            (Transaction.id == transaction_id) & 
            (Transaction.business_id == business_id)
        )
    )
    tx = result.scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    await db.delete(tx)
    await db.commit()


# ─────────────────────────────────────────────────────────────────────────────
# Bulk Ingestion: CSV / Excel / JSON Upload
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/businesses/{business_id}/transactions/upload/file", response_model=UploadResponse, status_code=201)
async def upload_transactions(
    business_id: uuid.UUID,
    file: UploadFile = File(..., description="CSV, Excel (.xlsx), or JSON file"),
    db: AsyncSession = Depends(get_db),
):
    """
    Bulk-import transactions from CSV / Excel / JSON.
    
    Required columns: transaction_date, type (income/expense), amount, category
    Optional columns: description
    
    Auto-cleans and normalizes data.
    """
    df = await parse_upload_file(file)
    rows = df_to_transaction_dicts(df, business_id)
    
    await db.execute(insert(Transaction), rows)
    await db.commit()
    
    return UploadResponse(
        inserted=len(rows),
        skipped=0,
        source="csv_excel_json",
        summary=f"Successfully imported {len(rows)} transactions"
    )


# ─────────────────────────────────────────────────────────────────────────────
# PDF/Invoice Upload & OCR Extraction
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/businesses/{business_id}/transactions/upload/invoice", 
             response_model=InvoiceExtractionResponse, status_code=201)
async def upload_invoice(
    business_id: uuid.UUID,
    file: UploadFile = File(..., description="PDF invoice file"),
    auto_insert: bool = Query(True, description="Automatically insert as transaction"),
    db: AsyncSession = Depends(get_db),
):
    """
    Extract transaction data from PDF invoice.
    Uses OCR and text parsing to extract vendor, amount, date, invoice number.
    Optionally auto-inserts as a transaction record.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files accepted")
    
    content = await file.read()
    pdf_text = await extract_text_from_pdf(content)
    invoice_data = await extract_invoice_data(pdf_text)
    
    # Auto-insert if requested
    if auto_insert and invoice_data.get("amount"):
        tx = Transaction(
            business_id=business_id,
            type=TransactionType.EXPENSE,  # Invoices are typically expenses
            amount=invoice_data["amount"],
            category=auto_categorize(invoice_data.get("vendor", ""), "professional_services"),
            description=f"Invoice: {invoice_data.get('invoice_number', 'N/A')} from {invoice_data.get('vendor', 'Unknown')}",
            transaction_date=invoice_data.get("invoice_date") or __import__('datetime').date.today(),
            source="pdf_invoice"
        )
        db.add(tx)
        await db.commit()
    
    return InvoiceExtractionResponse(**invoice_data, extracted_text=pdf_text[:500])


# ─────────────────────────────────────────────────────────────────────────────
# SMS/Bank Statement Log Upload
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/businesses/{business_id}/transactions/upload/sms", 
             response_model=BulkIngestionResponse, status_code=201)
async def upload_sms_logs(
    business_id: uuid.UUID,
    file: UploadFile = File(..., description="Text file with SMS transaction logs"),
    db: AsyncSession = Depends(get_db),
):
    """
    Parse bank SMS/transaction alerts from text file.
    
    Expected format (one transaction per line):
    [DATE] [BANK] Debited/Credited Rs. [AMOUNT] [DETAILS]
    
    Example:
    2024-03-15 HDFC Bank: Debited Rs. 5000 from Ac **1234 for UPI transaction
    2024-03-14 Axis Bank: Credited Rs. 50000 to Ac **5678 Salary Credit
    """
    content = await file.read()
    transactions = await parse_sms_logs(content)
    rows = parsed_transactions_to_dicts(transactions, business_id, source="sms")
    
    await db.execute(insert(Transaction), rows)
    await db.commit()
    
    return BulkIngestionResponse(
        total_processed=len(transactions),
        successful=len(rows),
        failed=len(transactions) - len(rows),
    )


# ─────────────────────────────────────────────────────────────────────────────
# UPI/WhatsApp Logs Upload
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/businesses/{business_id}/transactions/upload/upi", 
             response_model=BulkIngestionResponse, status_code=201)
async def upload_upi_logs(
    business_id: uuid.UUID,
    file: UploadFile = File(..., description="Text file with UPI/WhatsApp transaction logs"),
    db: AsyncSession = Depends(get_db),
):
    """
    Parse UPI/WhatsApp transaction logs from text file.
    
    Expected format (one transaction per line):
    [HH:MM] Paid Rs. 500 to John via UPI
    [HH:MM] Received Rs. 1000 from Jane
    
    Automatically categorizes transactions based on description.
    """
    content = await file.read()
    transactions = await parse_upi_logs(content)
    rows = parsed_transactions_to_dicts(transactions, business_id, source="upi")
    
    await db.execute(insert(Transaction), rows)
    await db.commit()
    
    return BulkIngestionResponse(
        total_processed=len(transactions),
        successful=len(rows),
        failed=len(transactions) - len(rows),
    )


# ─────────────────────────────────────────────────────────────────────────────
# Auto-Categorization
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/businesses/{business_id}/transactions/categorize", status_code=200)
async def auto_categorize_transactions(
    business_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Auto-categorize all transactions with empty or 'other' categories.
    Uses description and smart keyword matching.
    """
    result = await db.execute(
        select(Transaction).where(
            (Transaction.business_id == business_id) &
            ((Transaction.category == "other") | (Transaction.category.is_(None)))
        )
    )
    transactions = result.scalars().all()
    
    updated_count = 0
    for tx in transactions:
        if tx.description:
            new_category = auto_categorize(tx.description)
            if new_category != tx.category:
                tx.category = new_category
                updated_count += 1
    
    await db.commit()
    
    return {
        "total_transactions": len(transactions),
        "updated": updated_count,
        "message": f"Categorized {updated_count} transactions"
    }


@router.get("/transactions/categories", status_code=200)
async def get_available_categories():
    """Get list of all available transaction categories."""
    from app.services.ingestion import CATEGORY_KEYWORDS
    
    categories = [
        {
            "name": cat,
            "keywords": ", ".join(keywords) if keywords else "custom"
        }
        for cat, keywords in CATEGORY_KEYWORDS.items()
    ]
    
    return {"categories": sorted(categories, key=lambda x: x["name"])}
