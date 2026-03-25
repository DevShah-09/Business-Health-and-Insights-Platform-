# Data Input & Management Layer - API Documentation

## Overview

This document describes the complete Transaction Management API with support for:
- ✅ Manual transaction creation
- ✅ CSV/Excel/JSON bulk import with auto-cleaning
- ✅ PDF/Invoice OCR extraction
- ✅ Bank SMS log parsing
- ✅ UPI/WhatsApp transaction log parsing
- ✅ Intelligent auto-categorization

---

## Base URL
```
http://localhost:8000/api/v1
```

---

## 1. Manual Transaction Management

### Create a Single Transaction
**POST** `/businesses/{business_id}/transactions`

**Request Body:**
```json
{
  "type": "expense",
  "amount": 5000.00,
  "category": "food",
  "description": "Team lunch at restaurant",
  "transaction_date": "2024-03-20"
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "business_id": "550e8400-e29b-41d4-a716-446655440001",
  "type": "expense",
  "amount": 5000.00,
  "category": "food",
  "description": "Team lunch at restaurant",
  "transaction_date": "2024-03-20",
  "source": "manual",
  "created_at": "2024-03-20T10:30:00+00:00"
}
```

---

### List Transactions (with filters)
**GET** `/businesses/{business_id}/transactions`

**Query Parameters:**
- `skip`: Pagination offset (default: 0)
- `limit`: Results per page (default: 50, max: 500)
- `tx_type`: Filter by "income" or "expense" (optional)
- `category`: Filter by category (optional)

**Example:**
```
GET /businesses/{business_id}/transactions?tx_type=expense&category=food&limit=10
```

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "business_id": "550e8400-e29b-41d4-a716-446655440001",
    "type": "expense",
    "amount": 5000.00,
    "category": "food",
    "description": "Team lunch",
    "transaction_date": "2024-03-20",
    "source": "manual",
    "created_at": "2024-03-20T10:30:00+00:00"
  }
]
```

---

### Get Single Transaction
**GET** `/businesses/{business_id}/transactions/{transaction_id}`

**Response (200 OK):** Same as above

---

### Delete Transaction
**DELETE** `/businesses/{business_id}/transactions/{transaction_id}`

**Response (204 No Content):** Empty response on success

---

## 2. Bulk Ingestion: CSV/Excel/JSON Upload

### Upload File
**POST** `/businesses/{business_id}/transactions/upload/file`

**Request:**
- **Content-Type:** `multipart/form-data`
- **File formats:** `.csv`, `.xlsx`, `.xls`, `.json`
- **Required columns:** `transaction_date`, `type`, `amount`, `category`
- **Optional columns:** `description`, `notes`

**Auto-Cleaning Features:**
- Removes empty rows and columns
- Strips whitespace from all fields
- Normalizes column names
- Auto-categorizes if category is empty

**Sample CSV File:**
```csv
transaction_date,type,amount,category,description
2024-03-20,expense,5000,food,Team lunch at restaurant
2024-03-19,expense,1200,,Uber ride to office
2024-03-18,income,50000,,Client payment
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/businesses/550e8400-e29b-41d4-a716-446655440001/transactions/upload/file" \
  -F "file=@transactions.csv"
```

**Python Example:**
```python
import requests

business_id = "550e8400-e29b-41d4-a716-446655440001"
with open("transactions.csv", "rb") as f:
    files = {"file": f}
    response = requests.post(
        f"http://localhost:8000/api/v1/businesses/{business_id}/transactions/upload/file",
        files=files
    )
    print(response.json())
```

**Response (201 Created):**
```json
{
  "inserted": 47,
  "skipped": 0,
  "errors": null,
  "source": "csv_excel_json",
  "summary": "Successfully imported 47 transactions"
}
```

---

## 3. PDF/Invoice Upload & OCR Extraction

### Upload Invoice PDF
**POST** `/businesses/{business_id}/transactions/upload/invoice`

**Request:**
- **Content-Type:** `multipart/form-data`
- **File format:** `.pdf` only
- **Query Parameter:** `auto_insert` (default: true) - Auto-insert as transaction

**Features:**
- Extracts vendor name
- Extracts invoice amount
- Extracts invoice date
- Extracts invoice number
- Auto-categorizes to "Services"
- Optionally creates transaction record

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/businesses/550e8400-e29b-41d4-a716-446655440001/transactions/upload/invoice" \
  -F "file=@invoice.pdf" \
  -F "auto_insert=true"
```

**Python Example:**
```python
import requests

business_id = "550e8400-e29b-41d4-a716-446655440001"
with open("invoice.pdf", "rb") as f:
    files = {"file": f}
    response = requests.post(
        f"http://localhost:8000/api/v1/businesses/{business_id}/transactions/upload/invoice",
        files=files,
        params={"auto_insert": True}
    )
    print(response.json())
```

**Response (201 Created):**
```json
{
  "vendor": "ABC Consulting Services",
  "amount": 25000.00,
  "invoice_date": "2024-03-15",
  "invoice_number": "INV-2024-001",
  "description": "Invoice for Q1 consulting...",
  "extracted_text": "ABC Consulting Services Invoice...[truncated]"
}
```

---

## 4. Bank SMS Log Upload

### Upload SMS Transaction Logs
**POST** `/businesses/{business_id}/transactions/upload/sms`

**Request:**
- **Content-Type:** `multipart/form-data`
- **File format:** `.txt` (plain text)

**Expected Format:**
```
[DATE] [BANK] Debited/Credited Rs. [AMOUNT] [DETAILS]
```

**Sample SMS Log File:**
```
2024-03-20 HDFC Bank: Debited Rs. 5000 from Ac **1234 for UPI transaction
2024-03-20 Axis Bank: Credited Rs. 50000 to Ac **5678 Salary Credit
2024-03-19 ICICI: Debited Rs. 1200 for ATM withdrawal
2024-03-19 SBI: Credited Rs. 10000 from vendor payment
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/businesses/550e8400-e29b-41d4-a716-446655440001/transactions/upload/sms" \
  -F "file=@sms_logs.txt"
```

**Response (201 Created):**
```json
{
  "total_processed": 15,
  "successful": 14,
  "failed": 1,
  "errors": ["Transaction 8: invalid amount"]
}
```

---

## 5. UPI/WhatsApp Transaction Log Upload

### Upload UPI Logs
**POST** `/businesses/{business_id}/transactions/upload/upi`

**Request:**
- **Content-Type:** `multipart/form-data`
- **File format:** `.txt` (plain text)

**Expected Format:**
```
[HH:MM] Paid Rs. [AMOUNT] to [PERSON/BUSINESS] via UPI
[HH:MM] Received Rs. [AMOUNT] from [PERSON/BUSINESS]
```

**Sample UPI Log File:**
```
09:30 Paid Rs. 500 to John via UPI
10:15 Received Rs. 2000 from Jane for freelance work
11:45 Paid Rs. 150 to Starbucks cafe for coffee
14:20 Received Rs. 5000 from client ABC for project completion
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/businesses/550e8400-e29b-41d4-a716-446655440001/transactions/upload/upi" \
  -F "file=@upi_logs.txt"
```

**Response (201 Created):**
```json
{
  "total_processed": 12,
  "successful": 12,
  "failed": 0,
  "errors": null
}
```

---

## 6. Auto-Categorization

### Auto-Categorize All Transactions
**POST** `/businesses/{business_id}/transactions/categorize`

**Purpose:** Automatically categorize all transactions with empty or "other" categories using smart keyword matching.

**Response (200 OK):**
```json
{
  "total_transactions": 45,
  "updated": 23,
  "message": "Categorized 23 transactions"
}
```

---

### Get Available Categories
**GET** `/transactions/categories`

**Response (200 OK):**
```json
{
  "categories": [
    {
      "name": "entertainment",
      "keywords": "movie, cinema, netflix, spotify, gaming, concert, ticket"
    },
    {
      "name": "food",
      "keywords": "restaurant, cafe, pizza, burger, grocery, supermarket, walmart, costco"
    },
    {
      "name": "healthcare",
      "keywords": "doctor, hospital, clinic, pharmacy, medical, health"
    },
    {
      "name": "investment",
      "keywords": "dividend, interest, investment, roi"
    },
    {
      "name": "marketing",
      "keywords": "advertising, ads, social media, marketing, campaign"
    },
    {
      "name": "Services",
      "keywords": "consulting, accounting, legal, lawyer, audit"
    },
    {
      "name": "salary",
      "keywords": "salary, wage, paycheck, salary payment"
    },
    {
      "name": "transportation",
      "keywords": "fuel, gas, uber, lyft, taxi, parking, bus, metro, auto"
    },
    {
      "name": "utilities",
      "keywords": "electricity, water, gas, internet, wifi, phone bill, utilities"
    }
  ]
}
```

---

## Error Handling

### Common Error Responses

**400 Bad Request** - Unsupported file format:
```json
{
  "detail": "Unsupported file format. Use CSV, Excel, JSON, PDF, or SMS logs."
}
```

**422 Unprocessable Entity** - Missing required columns:
```json
{
  "detail": "Missing required columns: transaction_date, type. Found: date, description"
}
```

**422 Unprocessable Entity** - Data validation errors:
```json
{
  "detail": {
    "message": "Some rows failed validation",
    "errors": [
      "Row 2: unknown type 'transfer' (must be 'income' or 'expense')",
      "Row 5: amount must be > 0"
    ]
  }
}
```

**404 Not Found** - Transaction not found:
```json
{
  "detail": "Transaction not found"
}
```

---

## Best Practices

1. **File Uploads:**
   - Keep files under 10 MB for optimal processing
   - Use UTF-8 encoding for text files
   - Validate data format before uploading

2. **Categorization:**
   - Run auto-categorization after bulk imports
   - Customize category keywords in `CATEGORY_KEYWORDS` as needed
   - Review automatically categorized items for accuracy

3. **SMS/UPI Logs:**
   - One transaction per line
   - Include clear dates and amounts
   - Standard formats (Rs., INR, etc.) are supported

4. **Invoice Processing:**
   - Use clear, high-quality PDFs
   - Enable auto_insert for automatic record creation
   - Verify extracted data before relying on it

---

## Implementation Summary

| Feature | Endpoint | Status |
|---------|----------|--------|
| Manual transactions | POST /transactions | ✅ Implemented |
| List transactions | GET /transactions | ✅ Implemented |
| CSV/Excel/JSON upload | POST /transactions/upload/file | ✅ Implemented |
| PDF invoice OCR | POST /transactions/upload/invoice | ✅ Implemented |
| SMS log parsing | POST /transactions/upload/sms | ✅ Implemented |
| UPI log parsing | POST /transactions/upload/upi | ✅ Implemented |
| Auto-categorization | POST /transactions/categorize | ✅ Implemented |
| Category listing | GET /transactions/categories | ✅ Implemented |

---

## Dependencies

New packages added to `requirements.txt`:
```
pytesseract>=0.3.10        # OCR text extraction
pdf2image>=1.16.3          # PDF to image conversion
Pillow>=10.0.0             # Image processing
pdfplumber>=0.10.0         # PDF text extraction
```

---

## Testing

All endpoints have been implemented and tested. Run the following to verify:

```bash
# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload

# Test endpoints using provided cURL examples or Python examples
```
