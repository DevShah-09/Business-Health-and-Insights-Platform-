"""
forecasting.py — Linear regression forecasting with confidence bounds
"""
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from typing import Any
from app.schemas.schemas import ForecastPoint


def _monthly_series(transactions: list[Any], tx_type: str) -> pd.Series:
    df = pd.DataFrame([
        {"amount": float(t.amount), "type": t.type.value, "date": pd.to_datetime(t.transaction_date)}
        for t in transactions
    ])
    df = df[df["type"] == tx_type]
    if df.empty:
        return pd.Series(dtype=float)
    return df.groupby(df["date"].dt.to_period("M"))["amount"].sum().sort_index()


def forecast_next_n_months(transactions: list[Any], n: int = 6) -> list[ForecastPoint]:
    inc_s = _monthly_series(transactions, "income")
    exp_s = _monthly_series(transactions, "expense")

    def _predict(series: pd.Series, n_future: int):
        if len(series) < 2:
            return [0.0] * n_future, [0.0] * n_future, [0.0] * n_future
        X = np.arange(len(series)).reshape(-1, 1)
        y = series.values.astype(float)
        model = LinearRegression().fit(X, y)
        std = float(np.std(y - model.predict(X)))
        preds = np.maximum(model.predict(np.arange(len(series), len(series) + n_future).reshape(-1, 1)), 0)
        return preds.tolist(), np.maximum(preds - std, 0).tolist(), (preds + std).tolist()

    all_periods = sorted(set(list(inc_s.index) + list(exp_s.index)))
    last = all_periods[-1] if all_periods else pd.Period("2024-01", "M")
    future = [last + i for i in range(1, n + 1)]

    ip, ilo, ihi = _predict(inc_s, n)
    ep, elo, ehi = _predict(exp_s, n)

    return [
        ForecastPoint(
            date=str(future[i]),
            predicted_income=round(ip[i], 2),
            predicted_expenses=round(ep[i], 2),
            confidence_lower=round(min(ilo[i], elo[i]), 2),
            confidence_upper=round(max(ihi[i], ehi[i]), 2),
        )
        for i in range(n)
    ]
