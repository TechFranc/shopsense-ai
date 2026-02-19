from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.schemas import SpendingAnalytics, BudgetCreate, BudgetResponse
from app.models.database import Budget, User
from app.services.analytics_service import analytics_service
from app.dependencies import get_current_user
from typing import List

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/spending", response_model=SpendingAnalytics)
async def get_spending_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 👈 added
):
    """Get comprehensive spending analytics for logged-in user"""
    return analytics_service.calculate_spending_analytics(db, current_user.id)  # 👈 pass user_id


@router.get("/categories")
async def get_category_breakdown(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 👈 added
):
    """Get detailed breakdown by category for logged-in user"""
    return analytics_service.get_category_breakdown(db, current_user.id)  # 👈 pass user_id


@router.get("/budgets", response_model=List[dict])
async def get_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 👈 added
):
    """Get all budgets for logged-in user"""
    return analytics_service.get_budget_status(db, current_user.id)  # 👈 pass user_id


@router.post("/budgets", response_model=BudgetResponse)
async def create_budget(
    budget_data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 👈 added
):
    """Create or update a budget for logged-in user"""
    existing = db.query(Budget).filter(
        Budget.category == budget_data.category,
        Budget.user_id == current_user.id  # 👈 filter by user
    ).first()

    if existing:
        existing.monthly_limit = budget_data.monthly_limit
        db.commit()
        db.refresh(existing)
        budget = existing
    else:
        budget = Budget(
            user_id=current_user.id,  # 👈 added
            category=budget_data.category,
            monthly_limit=budget_data.monthly_limit
        )
        db.add(budget)
        db.commit()
        db.refresh(budget)

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
async def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 👈 added
):
    """Delete a budget — only if it belongs to logged-in user"""
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id  # 👈 security check
    ).first()

    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted successfully"}