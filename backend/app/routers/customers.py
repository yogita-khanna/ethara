from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.database import get_db
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.services.customer_service import CustomerService

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED, summary="Create a new customer", description="Creates a new customer. Email must be unique.")
async def create_customer(customer_in: CustomerCreate, db: AsyncSession = Depends(get_db)):
    service = CustomerService(db)
    return await service.create_customer(customer_in)

@router.get("/", response_model=List[CustomerResponse], summary="Get all customers", description="Retrieves a paginated list of customers. Can be filtered by email.")
async def get_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    email: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    service = CustomerService(db)
    return await service.get_customers(skip=skip, limit=limit, email=email)

@router.get("/{uid}", response_model=CustomerResponse, summary="Get a customer by ID", description="Retrieves a specific customer by their ID.")
async def get_customer(uid: str, db: AsyncSession = Depends(get_db)):
    service = CustomerService(db)
    return await service.get_customer(uid)

@router.put("/{uid}", response_model=CustomerResponse, summary="Update a customer", description="Updates a customer's details. Only provided fields are updated.")
async def update_customer(uid: str, customer_in: CustomerUpdate, db: AsyncSession = Depends(get_db)):
    service = CustomerService(db)
    return await service.update_customer(uid, customer_in)

@router.delete("/{uid}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a customer", description="Deletes a customer. Will fail if the customer has active orders.")
async def delete_customer(uid: str, db: AsyncSession = Depends(get_db)):
    service = CustomerService(db)
    await service.delete_customer(uid)
