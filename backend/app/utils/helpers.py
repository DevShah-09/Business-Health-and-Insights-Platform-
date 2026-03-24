"""app/utils/helpers.py — Shared utility helpers"""
from datetime import datetime, timezone


def utcnow() -> datetime:
    """Return current UTC datetime (timezone-aware)."""
    return datetime.now(timezone.utc)


def round_currency(value: float, decimals: int = 2) -> float:
    return round(value, decimals)


def pct_change(old: float, new: float) -> float:
    """Percentage change from old to new. Returns 0 if old is 0."""
    if old == 0:
        return 0.0
    return round(((new - old) / old) * 100, 2)
