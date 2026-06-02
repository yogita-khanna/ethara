from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator
import re

class CustomerBase(BaseModel):
    full_name: str = Field(..., max_length=200)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        # basic E.164 validation
        if not re.match(r"^\+?[1-9]\d{1,14}$", v):
            raise ValueError("Phone number must be in E.164 format")
        return v

class CustomerCreate(CustomerBase):
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "full_name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "+1234567890"
        }
    })

class CustomerUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=200)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        if not re.match(r"^\+?[1-9]\d{1,14}$", v):
            raise ValueError("Phone number must be in E.164 format")
        return v
        
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "phone": "+1987654321"
        }
    })

class CustomerResponse(CustomerBase):
    uid: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, json_schema_extra={
        "example": {
            "id": 1,
            "full_name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "+1234567890",
            "created_at": "2024-05-01T10:00:00Z",
            "updated_at": "2024-05-01T10:00:00Z"
        }
    })
