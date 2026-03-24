"""app/api/alerts.py — Real-time alert detection endpoints"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.database import get_db
from app.models.transaction import Transaction
from app.models.business import Business
from app.services.alert_engine import detect_all_alerts

router = APIRouter()


@router.get("/businesses/{business_id}/alerts", summary="Get Active Business Alerts")
async def get_alerts(
    business_id: uuid.UUID,
    limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    """
    Detect and return active alerts for a business.
    Detects: expense spikes, revenue drops, negative cash flow, high expense ratios.
    """
    biz = await db.get(Business, business_id)
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")

    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    transactions = result.scalars().all()

    if not transactions:
        return {
            "business_id": str(business_id),
            "alerts": [],
            "count": 0,
            "message": "No transactions recorded yet"
        }

    # Detect alerts
    alerts = detect_all_alerts(transactions)
    
    # Limit results
    alerts = alerts[:limit]

    return {
        "business_id": str(business_id),
        "alerts": [alert.to_dict() for alert in alerts],
        "count": len(alerts)
    }


@router.get("/businesses/{business_id}/alerts/critical", summary="Get Critical Alerts Only")
async def get_critical_alerts(
    business_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get only critical severity alerts."""
    biz = await db.get(Business, business_id)
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")

    result = await db.execute(select(Transaction).where(Transaction.business_id == business_id))
    transactions = result.scalars().all()

    if not transactions:
        return {"business_id": str(business_id), "critical_alerts": []}

    alerts = detect_all_alerts(transactions)
    critical = [a for a in alerts if a.severity.value == "critical"]

    return {
        "business_id": str(business_id),
        "critical_alerts": [alert.to_dict() for alert in critical],
        "count": len(critical)
    }
