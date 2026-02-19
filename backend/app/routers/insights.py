from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.database import Receipt, SpendingInsight, User
from app.models.schemas import InsightResponse, RecommendationResponse
from app.services.ai_service import ai_service
from app.dependencies import get_current_user
from typing import List
from datetime import datetime

router = APIRouter(prefix="/api/insights", tags=["insights"])


@router.post("/generate")
async def generate_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 👈 added
):
    """Generate AI-powered spending insights for logged-in user"""

    # Get only this user's receipts
    receipts = db.query(Receipt).filter(
        Receipt.user_id == current_user.id             # 👈 filter by user
    ).order_by(Receipt.upload_date.desc()).limit(50).all()

    if not receipts:
        raise HTTPException(status_code=400, detail="No receipts found. Upload some receipts first.")

    receipts_data = []
    for receipt in receipts:
        receipt_dict = {
            "store": receipt.store_name,
            "date": receipt.purchase_date.isoformat() if receipt.purchase_date else None,
            "total": receipt.total_amount,
            "items": [
                {
                    "name": item.name,
                    "price": item.price,
                    "quantity": item.quantity,
                    "category": item.category
                }
                for item in receipt.items
            ]
        }
        receipts_data.append(receipt_dict)

    analysis = await ai_service.analyze_spending_behavior(receipts_data)

    insights_created = []

    for impulse in analysis.get("impulse_buys", []):
        insight = SpendingInsight(
            user_id=current_user.id,                   # 👈 added
            insight_type="impulse",
            title=f"Impulse Purchase: {impulse.get('item', 'Unknown')}",
            description=impulse.get("reason", "Detected impulse buying pattern"),
            amount=impulse.get("amount", 0.0)
        )
        db.add(insight)
        insights_created.append(insight)

    for trend in analysis.get("spending_trends", []):
        insight = SpendingInsight(
            user_id=current_user.id,                   # 👈 added
            insight_type="trend",
            title=f"{trend.get('category', 'General')} Spending Trend",
            description=f"{trend.get('trend', 'stable').capitalize()}: {trend.get('insight', 'No specific insight')}",
            category=trend.get("category")
        )
        db.add(insight)
        insights_created.append(insight)

    if analysis.get("peak_spending"):
        peak = analysis["peak_spending"]
        insight = SpendingInsight(
            user_id=current_user.id,                   # 👈 added
            insight_type="pattern",
            title="Peak Spending Time",
            description=f"You spend most on {peak.get('day', 'weekdays')} {peak.get('time', 'evenings')}. {peak.get('reason', '')}"
        )
        db.add(insight)
        insights_created.append(insight)

    db.commit()

    return {
        "message": "Insights generated successfully",
        "insights_count": len(insights_created),
        "analysis": analysis
    }


@router.get("/", response_model=List[InsightResponse])
async def get_insights(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 👈 added
):
    """Get insights for logged-in user"""
    insights = db.query(SpendingInsight).filter(
        SpendingInsight.user_id == current_user.id     # 👈 filter by user
    ).order_by(
        SpendingInsight.insight_date.desc()
    ).offset(skip).limit(limit).all()
    return insights


@router.get("/recommendations", response_model=List[RecommendationResponse])
async def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 👈 added
):
    """Get personalized recommendations for logged-in user"""
    from app.services.analytics_service import analytics_service

    analytics = analytics_service.calculate_spending_analytics(db, current_user.id)  # 👈 pass user_id
    categories = analytics_service.get_category_breakdown(db, current_user.id)       # 👈 pass user_id

    spending_data = {
        "total_spent": analytics.total_spent,
        "categories": categories,
        "top_category": analytics.top_category,
        "average_transaction": analytics.average_transaction
    }

    recommendations = await ai_service.generate_recommendations(spending_data)
    return recommendations


@router.delete("/{insight_id}")
async def delete_insight(
    insight_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 👈 added
):
    """Delete an insight — only if it belongs to logged-in user"""
    insight = db.query(SpendingInsight).filter(
        SpendingInsight.id == insight_id,
        SpendingInsight.user_id == current_user.id     # 👈 security check
    ).first()

    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found")

    db.delete(insight)
    db.commit()
    return {"message": "Insight deleted successfully"}