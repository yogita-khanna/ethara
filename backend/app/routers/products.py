from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED, summary="Create a new product", description="Creates a new product in the inventory. SKU must be unique.")
async def create_product(product_in: ProductCreate, db: AsyncSession = Depends(get_db)):
    service = ProductService(db)
    return await service.create_product(product_in)

@router.get("/", response_model=List[ProductResponse], summary="Get all products", description="Retrieves a paginated list of products. Can be filtered by name or SKU.")
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    name: Optional[str] = None,
    sku: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    service = ProductService(db)
    return await service.get_products(skip=skip, limit=limit, name=name, sku=sku)

@router.get("/{uid}", response_model=ProductResponse, summary="Get a product by ID", description="Retrieves a specific product by its ID.")
async def get_product(uid: str, db: AsyncSession = Depends(get_db)):
    service = ProductService(db)
    return await service.get_product(uid)

@router.put("/{uid}", response_model=ProductResponse, summary="Update a product", description="Updates a product's details. Only provided fields are updated.")
async def update_product(uid: str, product_in: ProductUpdate, db: AsyncSession = Depends(get_db)):
    service = ProductService(db)
    return await service.update_product(uid, product_in)

@router.delete("/{uid}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a product", description="Deletes a product from the inventory. Will fail if the product is referenced in any active order.")
async def delete_product(uid: str, db: AsyncSession = Depends(get_db)):
    service = ProductService(db)
    await service.delete_product(uid)
