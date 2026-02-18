from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.models.database import Receipt, Item, SpendingInsight, Budget
from app.models.schemas import SpendingAnalytics
from datetime import datetime, timedelta
from typing import Dict, List
from collections import defaultdict

class AnalyticsService:
    
    @staticmethod
    def calculate_spending_analytics(db: Session) -> SpendingAnalytics:
        """Calculate comprehensive spending analytics"""
        
        # Get all receipts
        receipts = db.query(Receipt).all()
        items = db.query(Item).all()
        
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
        
        # Total spent
        total_spent = sum(r.total_amount or 0 for r in receipts)
        
        # Transaction count
        transaction_count = len(receipts)
        
        # Average transaction
        average_transaction = total_spent / transaction_count if transaction_count > 0 else 0
        
        # Spending by category
        spending_by_category = defaultdict(float)
        for item in items:
            category = item.category or "Other"
            spending_by_category[category] += item.price * item.quantity
        
        # Spending by store
        spending_by_store = defaultdict(float)
        for receipt in receipts:
            store = receipt.store_name or "Unknown"
            spending_by_store[store] += receipt.total_amount or 0
        
        # Top category and store
        top_category = max(spending_by_category.items(), key=lambda x: x[1])[0] if spending_by_category else None
        top_store = max(spending_by_store.items(), key=lambda x: x[1])[0] if spending_by_store else None
        
        # Monthly trend (last 6 months)
        monthly_trend = AnalyticsService._calculate_monthly_trend(db)
        
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
    def _calculate_monthly_trend(db: Session) -> List[Dict]:
        """Calculate spending trend for last 6 months"""
        now = datetime.utcnow()
        six_months_ago = now - timedelta(days=180)
        
        receipts = db.query(Receipt).filter(
            Receipt.purchase_date >= six_months_ago
        ).all()
        
        monthly_data = defaultdict(float)
        for receipt in receipts:
            if receipt.purchase_date:
                month_key = receipt.purchase_date.strftime("%Y-%m")
                monthly_data[month_key] += receipt.total_amount or 0
        
        # Generate last 6 months
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
    def get_category_breakdown(db: Session) -> Dict[str, Dict]:
        """Get detailed breakdown by category"""
        items = db.query(Item).all()
        
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
        
        # Convert to regular dict and add percentages
        total = sum(cat["total"] for cat in category_data.values())
        result = {}
        for category, data in category_data.items():
            result[category] = {
                "total": round(data["total"], 2),
                "count": data["count"],
                "percentage": round((data["total"] / total * 100) if total > 0 else 0, 1),
                "top_items": sorted(data["items"], key=lambda x: x["price"] * x["quantity"], reverse=True)[:5]
            }
        
        return result
    
    @staticmethod
    def update_budgets(db: Session):
        """Update budget tracking with current spending"""
        budgets = db.query(Budget).all()
        
        for budget in budgets:
            # Reset monthly if needed
            if budget.last_reset.month != datetime.utcnow().month:
                budget.current_spent = 0.0
                budget.last_reset = datetime.utcnow()
            
            # Calculate current month spending for this category
            start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            items = db.query(Item).join(Receipt).filter(
                Item.category == budget.category,
                Receipt.purchase_date >= start_of_month
            ).all()
            
            budget.current_spent = sum(item.price * item.quantity for item in items)
        
        db.commit()
    
    @staticmethod
    def get_budget_status(db: Session) -> List[Dict]:
        """Get budget status for all categories"""
        AnalyticsService.update_budgets(db)
        budgets = db.query(Budget).all()
        
        result = []
        for budget in budgets:
            percentage_used = (budget.current_spent / budget.monthly_limit * 100) if budget.monthly_limit > 0 else 0
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
