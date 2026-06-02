from sqlalchemy import Column, Integer, String, Text, Numeric, CheckConstraint
import uuid
from sqlalchemy.sql import func
from sqlalchemy.types import DateTime
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    uid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    name = Column(String(200), nullable=False)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False, server_default="0")

    __table_args__ = (
        CheckConstraint("price >= 0", name="check_price_positive"),
        CheckConstraint("quantity >= 0", name="check_quantity_positive"),
    )
