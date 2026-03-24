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
import uuid
from sqlalchemy import select

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
