from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.database import get_db
from app.schemas.order import OrderCreate, OrderResponse, OrderDetailResponse, OrderStatusEnum
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED, summary="Create a new order", description="Creates a new order. Stock will be automatically deducted.")
async def create_order(order_in: OrderCreate, db: AsyncSession = Depends(get_db)):
    service = OrderService(db)
    return await service.create_order(order_in)

@router.get("/", response_model=List[OrderResponse], summary="Get all orders", description="Retrieves a paginated list of orders. Can be filtered by status.")
async def get_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    order_status: Optional[OrderStatusEnum] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db)
):
    service = OrderService(db)
    # The Enum schema definition matches the model's Enum
    return await service.get_orders(skip=skip, limit=limit, status=order_status)

@router.get("/{uid}", response_model=OrderDetailResponse, summary="Get an order by ID", description="Retrieves a specific order including items and customer details.")
async def get_order(uid: str, db: AsyncSession = Depends(get_db)):
    service = OrderService(db)
    return await service.get_order(uid)

@router.delete("/{uid}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete an order", description="Deletes a pending or cancelled order and restores stock.")
async def delete_order(uid: str, db: AsyncSession = Depends(get_db)):
    service = OrderService(db)
    await service.delete_order(uid)
