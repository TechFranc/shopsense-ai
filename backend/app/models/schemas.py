from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ItemBase(BaseModel):
    name: str
    price: float
    quantity: int = 1
    category: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class ItemResponse(ItemBase):
    id: int
    receipt_id: int
    
    class Config:
        from_attributes = True

class ReceiptBase(BaseModel):
    store_name: Optional[str] = None
    purchase_date: Optional[datetime] = None
    total_amount: Optional[float] = None

class ReceiptCreate(ReceiptBase):
    filename: str

class ReceiptResponse(ReceiptBase):
    id: int
    filename: str
    upload_date: datetime
    items: List[ItemResponse] = []
    
    class Config:
        from_attributes = True

class SpendingAnalytics(BaseModel):
    total_spent: float
    transaction_count: int
    average_transaction: float
    top_category: Optional[str]
    top_store: Optional[str]
    spending_by_category: dict
    spending_by_store: dict
    monthly_trend: List[dict]

class InsightResponse(BaseModel):
    id: int
    insight_type: str
    title: str
    description: str
    category: Optional[str]
    amount: Optional[float]
    insight_date: datetime
    
    class Config:
        from_attributes = True

class BudgetCreate(BaseModel):
    category: str
    monthly_limit: float

class BudgetResponse(BaseModel):
    id: int
    category: str
    monthly_limit: float
    current_spent: float
    percentage_used: float
    remaining: float
    
    class Config:
        from_attributes = True

class RecommendationResponse(BaseModel):
    type: str
    title: str
    description: str
    potential_savings: Optional[float] = None
    category: Optional[str] = None
