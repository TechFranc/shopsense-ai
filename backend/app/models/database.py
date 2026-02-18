from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    receipts = relationship("Receipt", back_populates="owner", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="owner", cascade="all, delete-orphan")
    insights = relationship("SpendingInsight", back_populates="owner", cascade="all, delete-orphan")


class Receipt(Base):
    __tablename__ = "receipts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)   
    filename = Column(String, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    store_name = Column(String, nullable=True)
    purchase_date = Column(DateTime, nullable=True)
    total_amount = Column(Float, nullable=True)
    extracted_text = Column(Text, nullable=True)

    owner = relationship("User", back_populates="receipts")             
    items = relationship("Item", back_populates="receipt", cascade="all, delete-orphan")


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    receipt_id = Column(Integer, ForeignKey("receipts.id"))
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, default=1)
    category = Column(String, nullable=True)

    receipt = relationship("Receipt", back_populates="items")


class SpendingInsight(Base):
    __tablename__ = "spending_insights"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)   # 👈 added
    insight_date = Column(DateTime, default=datetime.utcnow)
    insight_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=True)
    amount = Column(Float, nullable=True)

    owner = relationship("User", back_populates="insights")             


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)   
    category = Column(String, nullable=False)
    monthly_limit = Column(Float, nullable=False)
    current_spent = Column(Float, default=0.0)
    last_reset = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="budgets")              