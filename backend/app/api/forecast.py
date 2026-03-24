"""app/api/forecast.py — Revenue/expense forecasting route"""
import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.database import get_db
from app.models.transaction import Transaction
from app.schemas.schemas import ForecastPoint
from app.services.forecasting import forecast_next_n_months

router = APIRouter()

@router.get("/businesses/{business_id}/forecast", response_model=list[ForecastPoint])
async def forecast(
    business_id: uuid.UUID,
    months: int = Query(default=6, ge=1, le=24, description="Number of months to forecast"),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    return forecast_next_n_months(result.scalars().all(), n=months)
