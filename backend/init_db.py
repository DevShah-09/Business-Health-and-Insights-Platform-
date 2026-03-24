"""
Initialize database with default business and user for development/testing.
Run this script once to seed the database.
"""
import asyncio
import uuid
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import engine, AsyncSessionLocal, Base
from app.models.business import Business
from app.models.user import User
from app.models.transaction import Transaction, TransactionType
from datetime import datetime, date, timedelta
from decimal import Decimal


DEFAULT_USER_ID = uuid.UUID('550e8400-e29b-41d4-a716-446655440000')
DEFAULT_BUSINESS_ID = uuid.UUID('550e8400-e29b-41d4-a716-446655440001')


async def init_db():
    """Create all tables and seed with default data."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("✓ Database tables created")

    async with AsyncSessionLocal() as session:
        # Check if default user already exists
        from sqlalchemy import select
        result = await session.execute(
            select(User).where(User.id == DEFAULT_USER_ID)
        )
        user = result.scalar_one_or_none()

        if not user:
            # Create default user
            user = User(
                id=DEFAULT_USER_ID,
                email="admin@sme-platform.local",
                username="admin",
                hashed_password="$2b$12$hashed_password_placeholder",  # Placeholder
            )
            session.add(user)
            print("✓ Default user created")

        # Check if default business already exists
        result = await session.execute(
            select(Business).where(Business.id == DEFAULT_BUSINESS_ID)
        )
        business = result.scalar_one_or_none()

        if not business:
            # Create default business
            business = Business(
                id=DEFAULT_BUSINESS_ID,
                user_id=DEFAULT_USER_ID,
                name="Demo Company",
                industry="Technology",
                description="Default demo business for testing",
                currency="USD",
            )
            session.add(business)
            print("✓ Default business created")

        await session.commit()

        # Seed sample transactions if none exist
        result = await session.execute(
            select(Transaction).where(Transaction.business_id == DEFAULT_BUSINESS_ID)
        )
        existing_txs = result.scalars().all()

        if not existing_txs:
            # Create sample transactions
            today = date.today()
            sample_txs = [
                Transaction(
                    business_id=DEFAULT_BUSINESS_ID,
                    type=TransactionType.INCOME,
                    amount=Decimal("18500.00"),
                    category="Services",
                    description="Consulting Project - Alpha Corp",
                    transaction_date=today - timedelta(days=7),
                    source="manual",
                ),
                Transaction(
                    business_id=DEFAULT_BUSINESS_ID,
                    type=TransactionType.EXPENSE,
                    amount=Decimal("28000.00"),
                    category="Salaries",
                    description="Monthly Payroll",
                    transaction_date=today - timedelta(days=6),
                    source="manual",
                ),
                Transaction(
                    business_id=DEFAULT_BUSINESS_ID,
                    type=TransactionType.INCOME,
                    amount=Decimal("12400.00"),
                    category="Products",
                    description="Product Sales - Batch #47",
                    transaction_date=today - timedelta(days=5),
                    source="manual",
                ),
            ]
            for tx in sample_txs:
                session.add(tx)
            await session.commit()
            print(f"✓ {len(sample_txs)} sample transactions created")

        print(f"\n✓ Database initialized successfully!")
        print(f"  - Default User ID: {DEFAULT_USER_ID}")
        print(f"  - Default Business ID: {DEFAULT_BUSINESS_ID}")
        print(f"  - Database: test.db (SQLite)")


if __name__ == "__main__":
    asyncio.run(init_db())
