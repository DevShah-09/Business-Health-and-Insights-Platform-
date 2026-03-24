"""
main.py — FastAPI application entry point (minimal working version)
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import transactions, businesses, financials, health, forecast, ai_insights

app = FastAPI(
    title="SME Business Health Platform",
    version="1.0.0",
    description="AI-Powered SME Business Health & Insights Platform",
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


@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "service": "SME Business Health Platform"}
