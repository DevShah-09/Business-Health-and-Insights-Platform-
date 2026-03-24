"""app/api/businesses.py — Business CRUD routes"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.database import get_db
from app.models.business import Business
from app.schemas.schemas import BusinessCreate, BusinessRead

router = APIRouter()

@router.post("/", response_model=BusinessRead, status_code=201)
async def create_business(payload: BusinessCreate, db: AsyncSession = Depends(get_db)):
    # TODO: replace hardcoded user_id with current authenticated user
    biz = Business(**payload.model_dump(), user_id=uuid.uuid4())
    db.add(biz)
    await db.flush()
    await db.refresh(biz)
    return biz

@router.get("/", response_model=list[BusinessRead])
async def list_businesses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Business))
    return result.scalars().all()

@router.get("/{business_id}", response_model=BusinessRead)
async def get_business(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    biz = await db.get(Business, business_id)
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")
    return biz

@router.delete("/{business_id}", status_code=204)
async def delete_business(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    biz = await db.get(Business, business_id)
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")
    await db.delete(biz)
