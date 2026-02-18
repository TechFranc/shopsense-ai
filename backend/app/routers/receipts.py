from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.database import Receipt, Item
from app.models.schemas import ReceiptResponse
from app.dependencies import get_current_user
from app.models.database import User
from app.services.ai_service import ai_service
from typing import List
import os
import shutil
from datetime import datetime

router = APIRouter(prefix="/api/receipts", tags=["receipts"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=ReceiptResponse)
async def upload_receipt(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload and process a receipt image"""
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    
    # Save file
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Extract data using AI
        extracted_data = await ai_service.extract_receipt_data(filepath)
        
        # Create receipt record
        receipt = Receipt(
            filename=filename,
            store_name=extracted_data.get("store_name"),
            purchase_date=datetime.fromisoformat(extracted_data["purchase_date"]) if extracted_data.get("purchase_date") else None,
            total_amount=extracted_data.get("total_amount", 0.0),
            user_id=current_user.id
        )
        
        db.add(receipt)
        db.flush()
        
        # Create item records
        for item_data in extracted_data.get("items", []):
            item = Item(
                receipt_id=receipt.id,
                name=item_data["name"],
                price=item_data["price"],
                quantity=item_data.get("quantity", 1),
                category=item_data.get("category", "Other")
            )
            db.add(item)
        
        db.commit()
        db.refresh(receipt)
        
        return receipt
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing receipt: {str(e)}")

@router.get("/", response_model=List[ReceiptResponse])
async def get_receipts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all receipts"""
    receipts = db.query(Receipt).order_by(Receipt.upload_date.desc()).offset(skip).limit(limit).all()
    return receipts

@router.get("/{receipt_id}", response_model=ReceiptResponse)
async def get_receipt(
    receipt_id: int,
    db: Session = Depends(get_db)
):
    """Get specific receipt by ID"""
    receipt = db.query(Receipt).filter(Receipt.id == receipt_id).first()
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    return receipt

@router.delete("/{receipt_id}")
async def delete_receipt(
    receipt_id: int,
    db: Session = Depends(get_db)
):
    """Delete a receipt"""
    receipt = db.query(Receipt).filter(Receipt.id == receipt_id).first()
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    # Delete file
    filepath = os.path.join(UPLOAD_DIR, receipt.filename)
    if os.path.exists(filepath):
        os.remove(filepath)
    
    db.delete(receipt)
    db.commit()
    
    return {"message": "Receipt deleted successfully"}
