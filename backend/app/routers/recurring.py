from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.database import User
from app.services.recurring_service import analyze_recurring_expenses

router = APIRouter(prefix="/api/recurring", tags=["recurring"])


@router.get("/analyze")
def get_recurring_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze the logged-in user's receipt history
    and return recurring expense patterns via Gemini AI
    """
    result = analyze_recurring_expenses(db, current_user.id)
    return result