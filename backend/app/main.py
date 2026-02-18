from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import init_db
from app.routers import auth
from app.routers import recurring 
from app.routers import receipts, analytics, insights, exports
import os

# Initialize database
init_db()

# Create FastAPI app
app = FastAPI(
    title="ShopSense AI",
    description="AI-powered shopping behavior tracker and analyzer",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for serving images
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(receipts.router)
app.include_router(analytics.router)
app.include_router(insights.router)
app.include_router(exports.router)
app.include_router(auth.router)
app.include_router(recurring.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to ShopSense AI API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
