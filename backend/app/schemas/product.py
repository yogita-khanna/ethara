from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator
import re

class ProductBase(BaseModel):
    name: str = Field(..., max_length=200)
    sku: str = Field(..., max_length=100)
    description: Optional[str] = None
    price: float = Field(..., ge=0)
    quantity: int = Field(0, ge=0)

    @field_validator("sku")
    @classmethod
    def validate_sku(cls, v: str) -> str:
        v = v.strip().upper()
        if len(v) < 3:
            raise ValueError("SKU must be at least 3 characters long")
        if not re.match(r"^[A-Z0-9\-]+$", v):
            raise ValueError("SKU must only contain alphanumeric characters and hyphens")
        return v

class ProductCreate(ProductBase):
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "name": "Wireless Mouse",
            "sku": "WM-2024-BLK",
            "description": "Ergonomic wireless mouse",
            "price": 29.99,
            "quantity": 150
        }
    })

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=200)
    sku: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    quantity: Optional[int] = Field(None, ge=0)

    @field_validator("sku")
    @classmethod
    def validate_sku(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip().upper()
        if len(v) < 3:
            raise ValueError("SKU must be at least 3 characters long")
        if not re.match(r"^[A-Z0-9\-]+$", v):
            raise ValueError("SKU must only contain alphanumeric characters and hyphens")
        return v
        
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "price": 24.99,
            "quantity": 100
        }
    })

class ProductResponse(ProductBase):
    uid: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, json_schema_extra={
        "example": {
            "id": 1,
            "name": "Wireless Mouse",
            "sku": "WM-2024-BLK",
            "description": "Ergonomic wireless mouse",
            "price": 29.99,
            "quantity": 150,
            "created_at": "2024-05-01T10:00:00Z",
            "updated_at": "2024-05-01T10:00:00Z"
        }
    })
