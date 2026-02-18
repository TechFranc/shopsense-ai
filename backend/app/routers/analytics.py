from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.schemas import SpendingAnalytics, BudgetCreate, BudgetResponse
from app.models.database import Budget
from app.services.analytics_service import analytics_service
from typing import List

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/spending", response_model=SpendingAnalytics)
async def get_spending_analytics(db: Session = Depends(get_db)):
    """Get comprehensive spending analytics"""
    return analytics_service.calculate_spending_analytics(db)

@router.get("/categories")
async def get_category_breakdown(db: Session = Depends(get_db)):
    """Get detailed breakdown by category"""
    return analytics_service.get_category_breakdown(db)

@router.get("/budgets", response_model=List[dict])
async def get_budgets(db: Session = Depends(get_db)):
    """Get all budgets with status"""
    return analytics_service.get_budget_status(db)

@router.post("/budgets", response_model=BudgetResponse)
async def create_budget(
    budget_data: BudgetCreate,
    db: Session = Depends(get_db)
):
    """Create or update a budget"""
    existing = db.query(Budget).filter(Budget.category == budget_data.category).first()
    
    if existing:
        existing.monthly_limit = budget_data.monthly_limit
        db.commit()
        db.refresh(existing)
        budget = existing
    else:
        budget = Budget(
            category=budget_data.category,
            monthly_limit=budget_data.monthly_limit
        )
        db.add(budget)
        db.commit()
        db.refresh(budget)
    
    # Calculate response fields
    percentage_used = (budget.current_spent / budget.monthly_limit * 100) if budget.monthly_limit > 0 else 0
    
    return BudgetResponse(
        id=budget.id,
        category=budget.category,
        monthly_limit=budget.monthly_limit,
        current_spent=budget.current_spent,
        percentage_used=round(percentage_used, 1),
        remaining=budget.monthly_limit - budget.current_spent
    )

@router.delete("/budgets/{budget_id}")
async def delete_budget(budget_id: int, db: Session = Depends(get_db)):
    """Delete a budget"""
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted successfully"}
