from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.database import Receipt, Item, SpendingInsight, Budget
from app.models.schemas import SpendingAnalytics
from datetime import datetime, timedelta
from typing import Dict, List
from collections import defaultdict

class AnalyticsService:

    @staticmethod
    def calculate_spending_analytics(db: Session, user_id: int) -> SpendingAnalytics:
        """Calculate comprehensive spending analytics for a specific user"""

        # Get only this user's receipts and items
        receipts = db.query(Receipt).filter(Receipt.user_id == user_id).all()  # 👈 filter
        receipt_ids = [r.id for r in receipts]
        items = db.query(Item).filter(Item.receipt_id.in_(receipt_ids)).all()  # 👈 filter

        if not receipts:
            return SpendingAnalytics(
                total_spent=0.0,
                transaction_count=0,
                average_transaction=0.0,
                top_category=None,
                top_store=None,
                spending_by_category={},
                spending_by_store={},
                monthly_trend=[]
            )

        total_spent = sum(r.total_amount or 0 for r in receipts)
        transaction_count = len(receipts)
        average_transaction = total_spent / transaction_count if transaction_count > 0 else 0

        spending_by_category = defaultdict(float)
        for item in items:
            category = item.category or "Other"
            spending_by_category[category] += item.price * item.quantity

        spending_by_store = defaultdict(float)
        for receipt in receipts:
            store = receipt.store_name or "Unknown"
            spending_by_store[store] += receipt.total_amount or 0

        top_category = max(spending_by_category.items(), key=lambda x: x[1])[0] if spending_by_category else None
        top_store = max(spending_by_store.items(), key=lambda x: x[1])[0] if spending_by_store else None

        monthly_trend = AnalyticsService._calculate_monthly_trend(db, user_id)  # 👈 pass user_id

        return SpendingAnalytics(
            total_spent=round(total_spent, 2),
            transaction_count=transaction_count,
            average_transaction=round(average_transaction, 2),
            top_category=top_category,
            top_store=top_store,
            spending_by_category=dict(spending_by_category),
            spending_by_store=dict(spending_by_store),
            monthly_trend=monthly_trend
        )

    @staticmethod
    def _calculate_monthly_trend(db: Session, user_id: int) -> List[Dict]:
        """Calculate spending trend for last 6 months for a specific user"""
        now = datetime.utcnow()
        six_months_ago = now - timedelta(days=180)

        receipts = db.query(Receipt).filter(
            Receipt.user_id == user_id,                    # 👈 filter
            Receipt.purchase_date >= six_months_ago
        ).all()

        monthly_data = defaultdict(float)
        for receipt in receipts:
            if receipt.purchase_date:
                month_key = receipt.purchase_date.strftime("%Y-%m")
                monthly_data[month_key] += receipt.total_amount or 0

        trend = []
        for i in range(5, -1, -1):
            month_date = now - timedelta(days=30 * i)
            month_key = month_date.strftime("%Y-%m")
            trend.append({
                "month": month_date.strftime("%b %Y"),
                "amount": round(monthly_data.get(month_key, 0.0), 2)
            })

        return trend

    @staticmethod
    def get_category_breakdown(db: Session, user_id: int) -> Dict[str, Dict]:
        """Get detailed breakdown by category for a specific user"""

        # Get only this user's items via their receipts
        receipt_ids = [
            r.id for r in db.query(Receipt).filter(Receipt.user_id == user_id).all()  # 👈 filter
        ]
        items = db.query(Item).filter(Item.receipt_id.in_(receipt_ids)).all()  # 👈 filter

        category_data = defaultdict(lambda: {"total": 0.0, "count": 0, "items": []})

        for item in items:
            category = item.category or "Other"
            amount = item.price * item.quantity
            category_data[category]["total"] += amount
            category_data[category]["count"] += 1
            category_data[category]["items"].append({
                "name": item.name,
                "price": item.price,
                "quantity": item.quantity
            })

        total = sum(cat["total"] for cat in category_data.values())
        result = {}
        for category, data in category_data.items():
            result[category] = {
                "total": round(data["total"], 2),
                "count": data["count"],
                "percentage": round((data["total"] / total * 100) if total > 0 else 0, 1),
                "top_items": sorted(
                    data["items"],
                    key=lambda x: x["price"] * x["quantity"],
                    reverse=True
                )[:5]
            }

        return result

    @staticmethod
    def update_budgets(db: Session, user_id: int):
        """Update budget tracking for a specific user"""
        budgets = db.query(Budget).filter(Budget.user_id == user_id).all()  # 👈 filter

        for budget in budgets:
            if budget.last_reset.month != datetime.utcnow().month:
                budget.current_spent = 0.0
                budget.last_reset = datetime.utcnow()

            start_of_month = datetime.utcnow().replace(
                day=1, hour=0, minute=0, second=0, microsecond=0
            )

            # Only count items from this user's receipts
            items = db.query(Item).join(Receipt).filter(
                Receipt.user_id == user_id,                # 👈 filter
                Item.category == budget.category,
                Receipt.purchase_date >= start_of_month
            ).all()

            budget.current_spent = sum(item.price * item.quantity for item in items)

        db.commit()

    @staticmethod
    def get_budget_status(db: Session, user_id: int) -> List[Dict]:
        """Get budget status for a specific user"""
        AnalyticsService.update_budgets(db, user_id)  # 👈 pass user_id

        budgets = db.query(Budget).filter(Budget.user_id == user_id).all()  # 👈 filter

        result = []
        for budget in budgets:
            percentage_used = (
                budget.current_spent / budget.monthly_limit * 100
            ) if budget.monthly_limit > 0 else 0

            result.append({
                "id": budget.id,
                "category": budget.category,
                "monthly_limit": budget.monthly_limit,
                "current_spent": round(budget.current_spent, 2),
                "percentage_used": round(percentage_used, 1),
                "remaining": round(budget.monthly_limit - budget.current_spent, 2),
                "status": "over" if percentage_used > 100 else "warning" if percentage_used > 80 else "ok"
            })

        return result


analytics_service = AnalyticsService()