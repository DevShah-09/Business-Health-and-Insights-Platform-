"""
anomaly_detection.py
Detects anomalous transactions using z-score statistical analysis.
"""
import pandas as pd
import numpy as np
from typing import Any
from app.schemas.schemas import AnomalyRecord


def detect_anomalies(transactions: list[Any], z_threshold: float = 2.5) -> list[AnomalyRecord]:
    """
    Flag transactions whose amount is more than `z_threshold` standard deviations
    from the mean for their category+type group.
    """
    if not transactions:
        return []

    records = [
        {
            "id": str(t.id),
            "type": t.type.value,
            "amount": float(t.amount),
            "category": t.category,
            "transaction_date": t.transaction_date,
        }
        for t in transactions
    ]
    df = pd.DataFrame(records)

    anomalies = []
    for (tx_type, category), group in df.groupby(["type", "category"]):
        if len(group) < 3:
            continue  # Need at least 3 data points for meaningful z-score

        mean = group["amount"].mean()
        std  = group["amount"].std()
        if std == 0:
            continue

        group = group.copy()
        group["z_score"] = (group["amount"] - mean) / std
        flagged = group[group["z_score"].abs() > z_threshold]

        for _, row in flagged.iterrows():
            # Find matching transaction object
            tx = next((t for t in transactions if str(t.id) == row["id"]), None)
            if tx is None:
                continue
            anomalies.append(AnomalyRecord(
                transaction_id=tx.id,
                transaction_date=tx.transaction_date,
                amount=float(tx.amount),
                category=tx.category,
                type=tx.type.value,
                z_score=round(float(row["z_score"]), 2),
                reason=(
                    f"Amount ${float(tx.amount):,.2f} is "
                    f"{abs(round(float(row['z_score']), 1))}σ from the "
                    f"mean (${mean:,.2f}) for {category} {tx_type}s"
                ),
            ))

    return sorted(anomalies, key=lambda x: abs(x.z_score), reverse=True)
