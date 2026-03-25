import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.financial_engine import get_expense_breakdown, _to_df
from app.models.transaction import Transaction, TransactionType
import uuid
from decimal import Decimal
from datetime import date

def test():
    business_id = uuid.uuid4()
    # Create mock transactions
    txs = [
        Transaction(business_id=business_id, type=TransactionType.EXPENSE, amount=Decimal("100.00"), category="Food", transaction_date=date(2026, 3, 1)),
        Transaction(business_id=business_id, type=TransactionType.EXPENSE, amount=Decimal("50.00"), category="Food", transaction_date=date(2026, 2, 1)),
    ]
    try:
        print("Running get_expense_breakdown...")
        result = get_expense_breakdown(txs)
        print("Result:", result)
    except Exception as e:
        print("Error:", e)
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test()
