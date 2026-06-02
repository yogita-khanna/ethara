from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum
from .product import ProductResponse
from .customer import CustomerResponse

class OrderStatusEnum(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"

class OrderItemCreate(BaseModel):
    product_uid: str = Field(..., min_length=36, max_length=36)
    quantity: int = Field(..., gt=0)

class OrderCreate(BaseModel):
    customer_uid: str = Field(..., min_length=36, max_length=36)
    items: List[OrderItemCreate] = Field(..., min_length=1)
    notes: Optional[str] = None
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "customer_id": 1,
            "items": [
                {"product_id": 1, "quantity": 2},
                {"product_id": 2, "quantity": 1}
            ],
            "notes": "Please deliver to front desk."
        }
    })

class OrderItemResponse(BaseModel):
    uid: str
    quantity: int
    unit_price: float
    subtotal: float
    
    model_config = ConfigDict(from_attributes=True)

class OrderItemDetailResponse(OrderItemResponse):
    product: Optional[ProductResponse] = None

class OrderResponse(BaseModel):
    uid: str
    status: OrderStatusEnum
    total_amount: float
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    customer: Optional[CustomerResponse] = None
    
    model_config = ConfigDict(from_attributes=True, json_schema_extra={
        "example": {
            "id": 1,
            "customer_id": 1,
            "status": "pending",
            "total_amount": 84.97,
            "notes": "Please deliver to front desk.",
            "created_at": "2024-05-01T10:00:00Z",
            "updated_at": "2024-05-01T10:00:00Z"
        }
    })

class OrderDetailResponse(OrderResponse):
    items: List[OrderItemDetailResponse] = []
    
    model_config = ConfigDict(from_attributes=True, json_schema_extra={
        "example": {
            "id": 1,
            "customer_id": 1,
            "status": "pending",
            "total_amount": 84.97,
            "notes": "Please deliver to front desk.",
            "created_at": "2024-05-01T10:00:00Z",
            "updated_at": "2024-05-01T10:00:00Z",
            "customer": {
                "id": 1,
                "full_name": "John Doe",
                "email": "john.doe@example.com",
                "phone": "+1234567890",
                "created_at": "2024-05-01T10:00:00Z",
                "updated_at": "2024-05-01T10:00:00Z"
            },
            "items": [
                {
                    "id": 1,
                    "order_id": 1,
                    "product_id": 1,
                    "quantity": 2,
                    "unit_price": 29.99,
                    "subtotal": 59.98,
                    "product": {
                        "id": 1,
                        "name": "Wireless Mouse",
                        "sku": "WM-2024-BLK",
                        "description": "Ergonomic wireless mouse",
                        "price": 29.99,
                        "quantity": 148,
                        "created_at": "2024-05-01T10:00:00Z",
                        "updated_at": "2024-05-01T10:00:00Z"
                    }
                }
            ]
        }
    })
