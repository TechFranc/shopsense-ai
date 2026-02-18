import google.generativeai as genai
import json
import os
from sqlalchemy.orm import Session
from app.models.database import Receipt, Item
from datetime import datetime

def get_user_receipt_history(db: Session, user_id: int):
    """Fetch all receipts and items for a user to send to Gemini"""
    receipts = db.query(Receipt).filter(Receipt.user_id == user_id).order_by(Receipt.purchase_date).all()
    
    history = []
    for receipt in receipts:
        items = db.query(Item).filter(Item.receipt_id == receipt.id).all()
        history.append({
            "store": receipt.store_name,
            "date": receipt.purchase_date.strftime("%Y-%m-%d") if receipt.purchase_date else str(receipt.upload_date.date()),
            "total": receipt.total_amount,
            "items": [
                {
                    "name": item.name,
                    "price": item.price,
                    "category": item.category,
                    "quantity": item.quantity
                }
                for item in items
            ]
        })
    
    return history


def analyze_recurring_expenses(db: Session, user_id: int):
    """Use Gemini AI to analyze receipt history and detect recurring patterns"""
    
    history = get_user_receipt_history(db, user_id)
    
    # Need at least 2 receipts to detect patterns
    if len(history) < 2:
        return {
            "patterns": [],
            "forecast": [],
            "summary": "Upload more receipts to start detecting recurring expenses.",
            "total_monthly_recurring": 0
        }
    
    # Build prompt for Gemini
    prompt = f"""
    You are a financial analyst. Analyze this shopping receipt history and detect recurring expense patterns.
    
    Receipt History:
    {json.dumps(history, indent=2)}
    
    Today's date: {datetime.now().strftime("%Y-%m-%d")}
    
    Analyze and identify:
    1. Stores visited repeatedly (same store appearing multiple times)
    2. Items bought repeatedly across different receipts
    3. Spending patterns by category that repeat regularly
    4. Estimated frequency (weekly, biweekly, monthly)
    5. Average amount spent per occurrence
    6. Predicted next occurrence date
    7. Monthly forecast total for recurring expenses
    
    Respond ONLY with valid JSON in exactly this structure, no extra text:
    {{
        "patterns": [
            {{
                "type": "store" or "item" or "category",
                "name": "name of store/item/category",
                "frequency": "weekly" or "biweekly" or "monthly" or "irregular",
                "average_amount": 0.00,
                "occurrences": 0,
                "last_seen": "YYYY-MM-DD",
                "next_predicted": "YYYY-MM-DD",
                "confidence": "high" or "medium" or "low",
                "insight": "one sentence insight about this pattern"
            }}
        ],
        "forecast": [
            {{
                "name": "expense name",
                "predicted_amount": 0.00,
                "predicted_date": "YYYY-MM-DD"
            }}
        ],
        "summary": "2-3 sentence plain English summary of the user's recurring expense patterns",
        "total_monthly_recurring": 0.00
    }}
    """
    
    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        # Clean response — strip markdown if present
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        result = json.loads(text)
        return result
        
    except Exception as e:
        print(f"Gemini recurring analysis error: {e}")
        return {
            "patterns": [],
            "forecast": [],
            "summary": "Unable to analyze patterns at this time. Please try again later.",
            "total_monthly_recurring": 0
        }