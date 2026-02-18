from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.pdf_service import pdf_service
from app.services.analytics_service import analytics_service
from app.routers.insights import get_insights
from datetime import datetime
import os

router = APIRouter(prefix="/api/exports", tags=["exports"])

@router.get("/monthly-report-pdf")
async def export_monthly_report_pdf(db: Session = Depends(get_db)):
    """Generate and download monthly spending report as PDF"""
    
    try:
        # Gather all data
        analytics = analytics_service.calculate_spending_analytics(db)
        categories = analytics_service.get_category_breakdown(db)
        budgets = analytics_service.get_budget_status(db)
        insights = db.query(
            __import__('app.models.database', fromlist=['SpendingInsight']).SpendingInsight
        ).order_by(
            __import__('app.models.database', fromlist=['SpendingInsight']).SpendingInsight.insight_date.desc()
        ).limit(5).all()
        
        # Convert insights to dict
        insights_list = [
            {
                'title': i.title,
                'description': i.description,
                'insight_type': i.insight_type
            }
            for i in insights
        ]
        
        # Generate PDF
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"ShopSense_Report_{timestamp}.pdf"
        output_path = os.path.join("uploads", filename)
        
        pdf_service.generate_monthly_report(
            analytics=analytics.__dict__,
            categories=categories,
            budgets=budgets,
            insights=insights_list,
            output_path=output_path
        )
        
        # Return file for download
        return FileResponse(
            path=output_path,
            media_type='application/pdf',
            filename=filename,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        print(f"PDF export error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

@router.get("/receipts-csv")
async def export_receipts_csv(db: Session = Depends(get_db)):
    """Export all receipts to CSV"""
    
    try:
        from app.models.database import Receipt, Item
        import csv
        from io import StringIO
        
        receipts = db.query(Receipt).order_by(Receipt.purchase_date.desc()).all()
        
        # Create CSV
        output = StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow(['Date', 'Store', 'Item', 'Category', 'Price', 'Quantity', 'Total', 'Receipt Total'])
        
        # Data
        for receipt in receipts:
            for item in receipt.items:
                writer.writerow([
                    receipt.purchase_date.strftime('%Y-%m-%d') if receipt.purchase_date else 'N/A',
                    receipt.store_name or 'Unknown',
                    item.name,
                    item.category or 'Other',
                    f"${item.price:.2f}",
                    item.quantity,
                    f"${(item.price * item.quantity):.2f}",
                    f"${receipt.total_amount:.2f}" if receipt.total_amount else 'N/A'
                ])
        
        # Save to file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"ShopSense_Receipts_{timestamp}.csv"
        filepath = os.path.join("uploads", filename)
        
        with open(filepath, 'w', newline='') as f:
            f.write(output.getvalue())
        
        return FileResponse(
            path=filepath,
            media_type='text/csv',
            filename=filename,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        print(f"CSV export error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate CSV: {str(e)}")