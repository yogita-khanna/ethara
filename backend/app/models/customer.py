from sqlalchemy import Column, Integer, String
import uuid
from sqlalchemy.sql import func
from sqlalchemy.types import DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    uid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    full_name = Column(String(200), nullable=False)
    email = Column(String(254), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True)

    orders = relationship("Order", back_populates="customer")
