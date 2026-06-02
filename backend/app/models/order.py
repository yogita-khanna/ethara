from sqlalchemy import Column, Integer, Text, Numeric, ForeignKey, Enum, CheckConstraint, String
import uuid
from sqlalchemy.sql import func
from sqlalchemy.types import DateTime
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class OrderStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    uid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False)
    status = Column(Enum(OrderStatus), nullable=False, default=OrderStatus.pending)
    total_amount = Column(Numeric(12, 2), nullable=False, server_default="0")
    notes = Column(Text, nullable=True)

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    uid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(12, 2), nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")

    __table_args__ = (
        CheckConstraint("quantity > 0", name="check_item_quantity_positive"),
    )
