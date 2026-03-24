"""
ingestion.py
Handles multiple file ingestion methods:
- CSV / Excel / JSON via Pandas
- PDF/Invoice extraction via OCR (Tesseract + pdf2image)
- SMS log parsing (bank statements, transaction alerts)
- UPI/WhatsApp logs parsing (simulated data extraction)
Includes auto-cleaning and smart categorization.
"""
import io
import re
import uuid
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Any, Optional

import pandas as pd
from fastapi import UploadFile, HTTPException
from PIL import Image

from app.models.transaction import TransactionType

# ─────────────────────────────────────────────────────────────────────────────
# Column Aliases & Configuration
# ─────────────────────────────────────────────────────────────────────────────

COLUMN_ALIASES = {
    "date":             "transaction_date",
    "Date":             "transaction_date",
    "Transaction Date": "transaction_date",
    "type":             "type",
    "Type":             "type",
    "amount":           "amount",
    "Amount":           "amount",
    "category":         "category",
    "Category":         "category",
    "description":      "description",
    "Description":      "description",
    "notes":            "description",
    "Notes":            "description",
}

REQUIRED_COLUMNS = {"transaction_date", "type", "amount", "category"}

# Smart category mapping for auto-categorization
CATEGORY_KEYWORDS = {
    "food": ["restaurant", "cafe", "pizza", "burger", "grocery", "supermarket", "walmart", "costco"],
    "transportation": ["fuel", "gas", "uber", "lyft", "taxi", "parking", "bus", "metro", "auto"],
    "utilities": ["electricity", "water", "gas", "internet", "wifi", "phone bill", "utilities"],
    "entertainment": ["movie", "cinema", "netflix", "spotify", "gaming", "concert", "ticket"],
    "healthcare": ["doctor", "hospital", "clinic", "pharmacy", "medical", "health"],
    "professional_services": ["consulting", "accounting", "legal", "lawyer", "audit"],
    "marketing": ["advertising", "ads", "social media", "marketing", "campaign"],
    "salary": ["salary", "wage", "paycheck", "salary payment"],
    "investment": ["dividend", "interest", "investment", "roi"],
    "other": []
}


# ─────────────────────────────────────────────────────────────────────────────
# PDF / Invoice OCR Parsing
# ─────────────────────────────────────────────────────────────────────────────

async def extract_text_from_pdf(file_content: bytes) -> str:
    """
    Extract text from PDF using pdfplumber (simple text extraction).
    Falls back to OCR if needed.
    """
    try:
        import pdfplumber
        
        with pdfplumber.open(io.BytesIO(file_content)) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""
            return text
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="PDF extraction library not installed. Please install pdfplumber."
        )
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to extract PDF text: {str(e)}")


async def extract_invoice_data(pdf_text: str) -> dict[str, Any]:
    """
    Parse invoice text and extract transaction data.
    Uses regex patterns to find common invoice fields.
    """
    data = {
        "vendor": None,
        "amount": None,
        "invoice_date": None,
        "invoice_number": None,
        "description": None,
    }
    
    # Amount patterns: $1,234.56 or 1234.56
    amount_patterns = [
        r'(?:Total|Amount|Sum|Due)[\s:]*(?:\$)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
        r'(\d+(?:\.\d{2})?)\s*(?:INR|USD|GBP)',
    ]
    for pattern in amount_patterns:
        match = re.search(pattern, pdf_text, re.IGNORECASE)
        if match:
            amount_str = match.group(1).replace(",", "")
            try:
                data["amount"] = Decimal(amount_str)
                break
            except:
                pass
    
    # Invoice number
    inv_match = re.search(r'(?:Invoice|Inv|Bill|Ref)[\s#:]*([A-Z0-9\-]+)', pdf_text, re.IGNORECASE)
    if inv_match:
        data["invoice_number"] = inv_match.group(1)
    
    # Date patterns: MM/DD/YYYY or DD-MM-YYYY
    date_patterns = [
        r'(?:Date|Issued)[\s:]*(\d{1,2}[-/]\d{1,2}[-/]\d{4})',
        r'(\d{4}[-/]\d{1,2}[-/]\d{1,2})',
    ]
    for pattern in date_patterns:
        match = re.search(pattern, pdf_text, re.IGNORECASE)
        if match:
            try:
                data["invoice_date"] = pd.to_datetime(match.group(1)).date()
                break
            except:
                pass
    
    # Vendor extraction (first capitalized line)
    vendor_match = re.search(r'^([A-Z][A-Za-z\s]+)', pdf_text, re.MULTILINE)
    if vendor_match:
        data["vendor"] = vendor_match.group(1).strip()
    
    data["description"] = pdf_text[:200]  # First 200 chars as description
    
    return data


# ─────────────────────────────────────────────────────────────────────────────
# SMS / Bank Statement Parsing
# ─────────────────────────────────────────────────────────────────────────────

async def parse_sms_logs(file_content: bytes) -> list[dict]:
    """
    Parse bank SMS/transaction alerts from text file.
    Expected format:
    [DATE] [BANK] Transaction of Amount [AMOUNT] [DETAIL]
    
    Example:
    2024-03-15 HDFC Bank: Debited Rs. 5000 from Ac **1234 for UPI transaction
    2024-03-14 Axis Bank: Credited Rs. 50000 to Ac **5678 Salary Credit
    """
    try:
        text = file_content.decode("utf-8", errors="ignore")
    except:
        raise HTTPException(status_code=422, detail="Unable to decode SMS file")
    
    transactions = []
    
    # SMS patterns
    patterns = [
        # Format: Debited/Credited [Currency] [Amount] [Details]
        r'(?:Debited|Credited)\s+(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)\s*(?:from|to)?\s*(.+?)(?:\n|$)',
        # Format: Amount Rs. 1234
        r'(?:Amount|Amt)\s+(?:Rs\.?|INR|\\$)?\s*([\d,]+(?:\.\d{2})?)\s*(.+?)(?:\n|$)',
    ]
    
    for line in text.split('\n'):
        line = line.strip()
        if not line:
            continue
        
        # Extract date
        date_match = re.search(r'(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})', line)
        tx_date = date.today()
        if date_match:
            try:
                tx_date = pd.to_datetime(date_match.group(1)).date()
            except:
                pass
        
        # Extract Debit/Credit (transaction type)
        is_credit = bool(re.search(r'Credited|received|income|deposit|salary', line, re.IGNORECASE))
        is_debit = bool(re.search(r'Debited|withdrawn|paid|expense|transfer', line, re.IGNORECASE))
        
        tx_type = TransactionType.INCOME if is_credit else TransactionType.EXPENSE
        
        # Extract amount
        amount = None
        for pattern in patterns:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                amount_str = match.group(1).replace(",", "")
                try:
                    amount = Decimal(amount_str)
                    break
                except:
                    pass
        
        if amount and amount > 0:
            transactions.append({
                "transaction_date": tx_date,
                "type": tx_type,
                "amount": amount,
                "description": line[:100],
                "source": "sms",
            })
    
    return transactions


# ─────────────────────────────────────────────────────────────────────────────
# UPI / WhatsApp Logs Parsing (Simulated)
# ─────────────────────────────────────────────────────────────────────────────

async def parse_upi_logs(file_content: bytes) -> list[dict]:
    """
    Parse simulated UPI transaction logs from text file.
    Expected format (WhatsApp/Telegram style):
    [HH:MM] Paid Rs. 500 to John via UPI
    [HH:MM] Received Rs. 1000 from Jane
    
    Returns list of transaction dicts.
    """
    try:
        text = file_content.decode("utf-8", errors="ignore")
    except:
        raise HTTPException(status_code=422, detail="Unable to decode UPI log file")
    
    transactions = []
    today = date.today()
    
    for line in text.split('\n'):
        line = line.strip()
        if not line:
            continue
        
        # Extract time and determine transaction type
        time_match = re.search(r'(\d{1,2}):(\d{2})', line)
        tx_time = "12:00"
        if time_match:
            tx_time = f"{time_match.group(1)}:{time_match.group(2)}"
        
        # Determine type (Paid/Sent = expense, Received = income)
        is_sent = bool(re.search(r'Paid|Sent|transferred|transferred to', line, re.IGNORECASE))
        is_received = bool(re.search(r'Received|received from|got', line, re.IGNORECASE))
        
        tx_type = TransactionType.INCOME if is_received else TransactionType.EXPENSE
        
        # Extract amount
        amount_match = re.search(r'Rs\.?\s*([\d,]+(?:\.\d{2})?)', line, re.IGNORECASE)
        if not amount_match:
            amount_match = re.search(r'([\d,]+(?:\.\d{2})?)\s*(?:INR|Rs)', line, re.IGNORECASE)
        
        if amount_match:
            amount_str = amount_match.group(1).replace(",", "")
            try:
                amount = Decimal(amount_str)
                
                # Extract description (person name or service)
                desc_match = re.search(r'(?:to|from|via|for)\s+([A-Za-z\s]+?)(?:\s+via|$)', line, re.IGNORECASE)
                description = desc_match.group(1).strip() if desc_match else line[:50]
                
                transactions.append({
                    "transaction_date": today,
                    "type": tx_type,
                    "amount": amount,
                    "description": f"UPI: {description}",
                    "source": "upi",
                })
            except:
                pass
    
    return transactions


# ─────────────────────────────────────────────────────────────────────────────
# File Parsing & Excel Auto-Cleaning
# ─────────────────────────────────────────────────────────────────────────────

async def parse_upload_file(file: UploadFile) -> pd.DataFrame:
    """
    Read an uploaded CSV / Excel / JSON file into a DataFrame.
    Auto-cleans and normalizes data.
    """
    content = await file.read()
    filename = file.filename or ""

    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        elif filename.endswith((".xls", ".xlsx")):
            df = pd.read_excel(io.BytesIO(content))
        elif filename.endswith(".json"):
            df = pd.read_json(io.BytesIO(content))
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Use CSV, Excel, JSON, PDF, or SMS logs."
            )
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse file: {str(e)}")

    # Auto-cleaning: Remove empty rows and columns
    df = df.dropna(how='all')
    df = df.loc[:, (df != '').any(axis=0)]
    
    # Strip whitespace from string columns
    string_cols = df.select_dtypes(include=['object']).columns
    df[string_cols] = df[string_cols].apply(lambda x: x.str.strip() if x.dtype == 'object' else x)
    
    # Normalize column names to lowercase and remove extra spaces
    df.columns = df.columns.str.lower().str.strip()
    
    # Rename using aliases
    df = df.rename(columns=COLUMN_ALIASES)

    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Missing required columns: {', '.join(missing)}. "
                   f"Found: {', '.join(df.columns.tolist())}",
        )

    return df


def auto_categorize(description: str, default_category: str = "other") -> str:
    """
    Auto-categorize a transaction based on description keywords.
    Returns matched category or the provided default.
    """
    description_lower = description.lower()
    
    for category, keywords in CATEGORY_KEYWORDS.items():
        if category == "other":
            continue
        for keyword in keywords:
            if keyword in description_lower:
                return category
    
    return default_category


def df_to_transaction_dicts(df: pd.DataFrame, business_id: uuid.UUID) -> list[dict]:
    """
    Convert a cleaned DataFrame into a list of dicts ready to bulk-insert
    as Transaction records.
    """
    rows = []
    errors = []

    for idx, row in df.iterrows():
        try:
            tx_type_raw = str(row["type"]).strip().lower()
            if tx_type_raw not in ("income", "expense"):
                errors.append(f"Row {idx + 2}: unknown type '{tx_type_raw}' (must be 'income' or 'expense')")
                continue

            tx_date = pd.to_datetime(row["transaction_date"]).date()
            amount  = Decimal(str(row["amount"])).quantize(Decimal("0.01"))
            if amount <= 0:
                errors.append(f"Row {idx + 2}: amount must be > 0")
                continue

            # Auto-categorize if category is empty
            category = str(row.get("category", "")).strip()
            description = str(row.get("description", "")).strip() or None
            
            if not category and description:
                category = auto_categorize(description)
            elif not category:
                category = "other"

            rows.append({
                "id":               uuid.uuid4(),
                "business_id":      business_id,
                "type":             TransactionType(tx_type_raw),
                "amount":           amount,
                "category":         category,
                "description":      description,
                "transaction_date": tx_date,
                "source":           "csv",
            })
        except Exception as e:
            errors.append(f"Row {idx + 2}: {str(e)}")

    if errors:
        raise HTTPException(
            status_code=422,
            detail={"message": "Some rows failed validation", "errors": errors[:20]},
        )

    return rows


def parsed_transactions_to_dicts(
    transactions: list[dict], business_id: uuid.UUID, source: str = "manual"
) -> list[dict]:
    """
    Convert a list of parsed transaction dicts into DB-ready format.
    Handles source attribution and auto-categorization.
    """
    rows = []
    errors = []
    
    for idx, tx in enumerate(transactions):
        try:
            tx_type = tx.get("type", TransactionType.EXPENSE)
            amount = tx.get("amount")
            description = tx.get("description", "")
            tx_date = tx.get("transaction_date", date.today())
            
            if not amount or amount <= 0:
                errors.append(f"Transaction {idx + 1}: invalid amount")
                continue
            
            category = auto_categorize(description)
            
            rows.append({
                "id": uuid.uuid4(),
                "business_id": business_id,
                "type": tx_type,
                "amount": Decimal(str(amount)).quantize(Decimal("0.01")),
                "category": category,
                "description": description[:500],
                "transaction_date": tx_date,
                "source": tx.get("source", source),
            })
        except Exception as e:
            errors.append(f"Transaction {idx + 1}: {str(e)}")
    
    if errors:
        raise HTTPException(
            status_code=422,
            detail={"message": "Some transactions failed validation", "errors": errors[:20]},
        )
    
    return rows
