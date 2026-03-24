# Sample Test Files and cURL Commands

## Sample CSV Data

### transactions.csv
```csv
transaction_date,type,amount,category,description
2024-03-20,expense,5000,,Team lunch at restaurant
2024-03-20,expense,1200,,Uber ride to office
2024-03-20,income,50000,,Client payment for project
2024-03-19,expense,800,utilities,Internet bill payment
2024-03-19,expense,15000,professional_services,Accounting consultation
2024-03-18,expense,2500,,Office supplies purchase
2024-03-18,income,10000,,Freelance project payment
2024-03-17,expense,500,food,Coffee and snacks for team
2024-03-17,expense,3000,transportation,Fuel purchase
2024-03-16,expense,1500,,Marketing campaign design
```

### banking_transactions.csv
```csv
Date,Type,Amount,Category,Notes
2024-03-20,expense,7500,food,Restaurant bill
2024-03-20,income,75000,salary,Monthly salary deposit
2024-03-19,expense,2000,healthcare,Doctor consultation
2024-03-19,expense,500,entertainment,Netflix subscription
2024-03-18,expense,1000,utilities,Electricity bill
2024-03-18,expense,3500,professional_services,Legal consultation
```

---

## Sample SMS Log File

### sms_logs.txt
```
2024-03-20 HDFC Bank: Debited Rs. 5000 from Ac **1234 for UPI transaction to John
2024-03-20 Axis Bank: Credited Rs. 50000 to Ac **5678 Salary Credit - March 2024
2024-03-19 ICICI: Debited Rs. 1200 for ATM withdrawal at downtown branch
2024-03-19 SBI: Credited Rs. 10000 from vendor ABC payment
2024-03-18 HDFC Bank: Debited Rs. 800 for NEFT transfer to utilities provider
2024-03-18 Axis Bank: Debited Rs. 2500 for IMPS to Jane Doe
2024-03-17 ICICI: Credited Rs. 5000 from freelance project payment
2024-03-17 SBI: Debited Rs. 500 for vendor service payment
2024-03-16 HDFC Bank: Debited Rs. 15000 for consulting fee payment
2024-03-16 Axis Bank: Credited Rs. 25000 dividend income credit
```

---

## Sample UPI Log File

### upi_logs.txt
```
09:30 Paid Rs. 500 to John via UPI for lunch
10:15 Received Rs. 2000 from Jane for freelance work
11:45 Paid Rs. 150 to Starbucks cafe for coffee
14:20 Received Rs. 5000 from client ABC for project completion
16:10 Paid Rs. 800 to landlord for rent via UPI
17:45 Paid Rs. 1000 to electrician for repair work
18:30 Received Rs. 3000 from freelance client payment
09:00 Paid Rs. 2500 for office supplies to vendor XYZ
10:30 Received Rs. 7500 from investor as capital infusion
15:15 Paid Rs. 500 to Zomato for team lunch delivery
```

---

## cURL Testing Commands

### 1. Create a Manual Transaction
```bash
curl -X POST "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/transactions" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "expense",
    "amount": 5000.00,
    "category": "food",
    "description": "Team lunch at restaurant",
    "transaction_date": "2024-03-20"
  }'
```

### 2. List All Transactions
```bash
curl -X GET "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/transactions"
```

### 3. List with Filters
```bash
curl -X GET "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/transactions?tx_type=expense&category=food&limit=10"
```

### 4. Get Specific Transaction
```bash
curl -X GET "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/transactions/TRANSACTION_ID"
```

### 5. Delete Transaction
```bash
curl -X DELETE "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/transactions/TRANSACTION_ID"
```

### 6. Upload CSV File
```bash
curl -X POST "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/transactions/upload/file" \
  -F "file=@transactions.csv"
```

### 7. Upload Invoice PDF
```bash
curl -X POST "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/transactions/upload/invoice" \
  -F "file=@invoice.pdf" \
  -G -d "auto_insert=true"
```

### 8. Upload SMS Logs
```bash
curl -X POST "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/transactions/upload/sms" \
  -F "file=@sms_logs.txt"
```

### 9. Upload UPI Logs
```bash
curl -X POST "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/transactions/upload/upi" \
  -F "file=@upi_logs.txt"
```

### 10. Auto-Categorize Transactions
```bash
curl -X POST "http://localhost:8000/api/v1/businesses/YOUR_BUSINESS_ID/transactions/categorize"
```

### 11. Get Available Categories
```bash
curl -X GET "http://localhost:8000/api/v1/transactions/categories"
```

---

## Python Testing Script

```python
import requests
import json
from pathlib import Path

BASE_URL = "http://localhost:8000/api/v1"
BUSINESS_ID = "YOUR_BUSINESS_ID"  # Replace with actual business ID

class TransactionAPI:
    def __init__(self, base_url, business_id):
        self.base_url = base_url
        self.business_id = business_id
    
    def create_transaction(self, tx_type, amount, category, description, date):
        """Create a single transaction"""
        url = f"{self.base_url}/businesses/{self.business_id}/transactions"
        payload = {
            "type": tx_type,
            "amount": amount,
            "category": category,
            "description": description,
            "transaction_date": date
        }
        response = requests.post(url, json=payload)
        return response.json()
    
    def list_transactions(self, skip=0, limit=50, tx_type=None, category=None):
        """List transactions with optional filters"""
        url = f"{self.base_url}/businesses/{self.business_id}/transactions"
        params = {
            "skip": skip,
            "limit": limit
        }
        if tx_type:
            params["tx_type"] = tx_type
        if category:
            params["category"] = category
        response = requests.get(url, params=params)
        return response.json()
    
    def upload_csv(self, file_path):
        """Upload CSV/Excel/JSON file"""
        url = f"{self.base_url}/businesses/{self.business_id}/transactions/upload/file"
        with open(file_path, "rb") as f:
            files = {"file": f}
            response = requests.post(url, files=files)
        return response.json()
    
    def upload_invoice(self, file_path, auto_insert=True):
        """Upload and extract invoice PDF"""
        url = f"{self.base_url}/businesses/{self.business_id}/transactions/upload/invoice"
        with open(file_path, "rb") as f:
            files = {"file": f}
            params = {"auto_insert": auto_insert}
            response = requests.post(url, files=files, params=params)
        return response.json()
    
    def upload_sms_logs(self, file_path):
        """Upload SMS transaction logs"""
        url = f"{self.base_url}/businesses/{self.business_id}/transactions/upload/sms"
        with open(file_path, "rb") as f:
            files = {"file": f}
            response = requests.post(url, files=files)
        return response.json()
    
    def upload_upi_logs(self, file_path):
        """Upload UPI transaction logs"""
        url = f"{self.base_url}/businesses/{self.business_id}/transactions/upload/upi"
        with open(file_path, "rb") as f:
            files = {"file": f}
            response = requests.post(url, files=files)
        return response.json()
    
    def auto_categorize(self):
        """Auto-categorize all transactions"""
        url = f"{self.base_url}/businesses/{self.business_id}/transactions/categorize"
        response = requests.post(url)
        return response.json()
    
    def get_categories(self):
        """Get available categories"""
        url = f"{self.base_url}/transactions/categories"
        response = requests.get(url)
        return response.json()

# Usage Example
if __name__ == "__main__":
    api = TransactionAPI(BASE_URL, BUSINESS_ID)
    
    # Test: Create a transaction
    print("Creating transaction...")
    result = api.create_transaction(
        tx_type="expense",
        amount=5000.00,
        category="food",
        description="Team lunch at restaurant",
        date="2024-03-20"
    )
    print(json.dumps(result, indent=2))
    
    # Test: List transactions
    print("\nListing transactions...")
    result = api.list_transactions(limit=5)
    print(json.dumps(result, indent=2))
    
    # Test: Upload CSV
    print("\nUploading CSV file...")
    result = api.upload_csv("transactions.csv")
    print(json.dumps(result, indent=2))
    
    # Test: Upload SMS logs
    print("\nUploading SMS logs...")
    result = api.upload_sms_logs("sms_logs.txt")
    print(json.dumps(result, indent=2))
    
    # Test: Upload UPI logs
    print("\nUploading UPI logs...")
    result = api.upload_upi_logs("upi_logs.txt")
    print(json.dumps(result, indent=2))
    
    # Test: Get categories
    print("\nGetting available categories...")
    result = api.get_categories()
    print(json.dumps(result, indent=2))
    
    # Test: Auto-categorize
    print("\nAuto-categorizing transactions...")
    result = api.auto_categorize()
    print(json.dumps(result, indent=2))
```

---

## Expected Results

After running the tests with sample data, you should see:

### CSV Upload Result
```json
{
  "inserted": 10,
  "skipped": 0,
  "errors": null,
  "source": "csv_excel_json",
  "summary": "Successfully imported 10 transactions"
}
```

### SMS Upload Result
```json
{
  "total_processed": 10,
  "successful": 10,
  "failed": 0,
  "errors": null
}
```

### UPI Upload Result
```json
{
  "total_processed": 11,
  "successful": 11,
  "failed": 0,
  "errors": null
}
```

### Auto-Categorization Result
```json
{
  "total_transactions": 31,
  "updated": 18,
  "message": "Categorized 18 transactions"
}
```

---

## Notes

- Replace `YOUR_BUSINESS_ID` with an actual business ID from your database
- Ensure the server is running: `uvicorn app.main:app --reload`
- All dates should be in ISO format: `YYYY-MM-DD`
- Amounts should be positive decimal numbers
- Transaction types are case-insensitive: "income", "INCOME", "Income" are all valid
