"""app/api/health.py — Health check route"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/health", summary="Health Check")
async def health_check():
    return {"status": "ok", "service": "SME Business Health Platform"}
