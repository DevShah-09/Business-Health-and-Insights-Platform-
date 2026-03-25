"""
main.py — FastAPI application entry point (minimal working version)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api import transactions, businesses, financials, health, forecast, ai_insights, analytics, alerts, chat, simulation, reports
from app.database.database import init_db, AsyncSessionLocal
from app.models.user import User
from app.models.business import Business
from app.models.transaction import Transaction, TransactionType
import uuid
from sqlalchemy import select
from datetime import date, timedelta
from decimal import Decimal

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables
    await init_db()
    
    # Seed the mock business for the frontend
    async with AsyncSessionLocal() as session:
        mock_user_id = uuid.UUID("a1111111-1111-1111-1111-111111111111")
        mock_business_id = uuid.UUID("550e8400-e29b-41d4-a716-446655440001")
        
        # Check if user exists
        res_u = await session.execute(select(User).where(User.id == mock_user_id))
        if not res_u.scalar_one_or_none():
            user = User(
                id=mock_user_id,
                email="demo@example.com",
                full_name="Demo User",
                hashed_password="fake"
            )
            session.add(user)
        
        # Check if business exists
        res_b = await session.execute(select(Business).where(Business.id == mock_business_id))
        if not res_b.scalar_one_or_none():
            business = Business(
                id=mock_business_id,
                user_id=mock_user_id,
                name="Demo Business"
            )
            session.add(business)
            
        await session.commit()
        
        # Seed sample transactions if none exist
        result = await session.execute(
            select(Transaction).where(Transaction.business_id == mock_business_id)
        )
        existing_txs = result.scalars().all()

        if not existing_txs:
            # Create sample transactions for demo data (spread across two months)
            today = date.today()
            last_month = today - timedelta(days=30)
            
            sample_txs = [
                # --- MONTH 1 (Zero Marketing) ---
                Transaction(business_id=mock_business_id, type=TransactionType.INCOME, amount=Decimal("150000.00"), category="Services", description="Base Retainer", transaction_date=last_month - timedelta(days=60), source="manual"),
                Transaction(business_id=mock_business_id, type=TransactionType.EXPENSE, amount=Decimal("0.00"), category="Marketing", description="No Ads", transaction_date=last_month - timedelta(days=60), source="manual"),
                
                # --- MONTH 2 (Low Revenue, Still Zero Marketing) ---
                Transaction(business_id=mock_business_id, type=TransactionType.INCOME, amount=Decimal("120000.00"), category="Services", description="Slow Month", transaction_date=last_month - timedelta(days=30), source="manual"),
                Transaction(business_id=mock_business_id, type=TransactionType.EXPENSE, amount=Decimal("0.00"), category="Marketing", description="No Ads", transaction_date=last_month - timedelta(days=30), source="manual"),
                
                # --- MONTH 3 (Marketing Spiked, Revenue Spiked SUCCESS) ---
                Transaction(business_id=mock_business_id, type=TransactionType.INCOME, amount=Decimal("350000.00"), category="Services", description="Huge Growth", transaction_date=today - timedelta(days=15), source="manual"),
                Transaction(business_id=mock_business_id, type=TransactionType.EXPENSE, amount=Decimal("45000.00"), category="Marketing", description="Aggressive Campaign", transaction_date=today - timedelta(days=20), source="manual"),
                
                # --- MONTH 4 (Marketing Spiked MORE, Revenue STAGNANT FAILURE) ---
                Transaction(business_id=mock_business_id, type=TransactionType.INCOME, amount=Decimal("360000.00"), category="Services", description="Enterprise Retainer", transaction_date=today - timedelta(days=5), source="manual"),
                Transaction(business_id=mock_business_id, type=TransactionType.EXPENSE, amount=Decimal("120000.00"), category="Marketing", description="Over-saturated Ads", transaction_date=today - timedelta(days=5), source="manual"),
                
                # General overhead
                Transaction(business_id=mock_business_id, type=TransactionType.EXPENSE, amount=Decimal("20000.00"), category="Rent", description="Office", transaction_date=today - timedelta(days=2), source="manual"),
                Transaction(business_id=mock_business_id, type=TransactionType.EXPENSE, amount=Decimal("60000.00"), category="Salaries", description="Core Team", transaction_date=today - timedelta(days=1), source="manual"),
            ]

            
            for tx in sample_txs:
                session.add(tx)
            
            await session.commit()
    
    yield


app = FastAPI(
    title="SME Business Health Platform",
    version="1.0.0",
    description="AI-Powered SME Business Health & Insights Platform",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(transactions.router, prefix="/api/v1", tags=["transactions"])
app.include_router(businesses.router, prefix="/api/v1", tags=["businesses"])
app.include_router(financials.router, prefix="/api/v1", tags=["financials"])
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(forecast.router, prefix="/api/v1", tags=["forecast"])
app.include_router(ai_insights.router, prefix="/api/v1", tags=["ai_insights"])
app.include_router(analytics.router, prefix="/api/v1", tags=["analytics"])
app.include_router(alerts.router, prefix="/api/v1", tags=["alerts"])
app.include_router(chat.router, prefix="/api/v1", tags=["chat"])
app.include_router(simulation.router, prefix="/api/v1", tags=["simulation"])
app.include_router(reports.router, prefix="/api/v1", tags=["reports"])


@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "service": "SME Business Health Platform"}
