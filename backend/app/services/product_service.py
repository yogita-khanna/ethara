from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from typing import List, Optional

from app.models.product import Product
from app.models.order import OrderItem
from app.schemas.product import ProductCreate, ProductUpdate
from app.exceptions import NotFoundError, DuplicateError, DependencyError

class ProductService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_product(self, product_in: ProductCreate) -> Product:
        # Check SKU uniqueness
        stmt = select(Product).filter(Product.sku == product_in.sku)
        result = await self.db.execute(stmt)
        if result.scalar_one_or_none():
            raise DuplicateError(field="SKU", value=product_in.sku)

        product = Product(**product_in.model_dump())
        self.db.add(product)
        await self.db.commit()
        await self.db.refresh(product)
        return product

    async def get_products(self, skip: int = 0, limit: int = 20, name: Optional[str] = None, sku: Optional[str] = None) -> List[Product]:
        stmt = select(Product)
        if name:
            stmt = stmt.filter(Product.name.ilike(f"%{name}%"))
        if sku:
            stmt = stmt.filter(Product.sku.ilike(f"%{sku}%"))
        
        stmt = stmt.offset(skip).limit(limit).order_by(Product.id.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_product(self, product_uid: str) -> Product:
        stmt = select(Product).filter(Product.uid == product_uid)
        result = await self.db.execute(stmt)
        product = result.scalar_one_or_none()
        if not product:
            raise NotFoundError(resource="Product", resource_id=product_uid)
        return product

    async def update_product(self, product_uid: str, product_in: ProductUpdate) -> Product:
        product = await self.get_product(product_uid)

        update_data = product_in.model_dump(exclude_unset=True)
        if "sku" in update_data and update_data["sku"] != product.sku:
            stmt = select(Product).filter(Product.sku == update_data["sku"])
            result = await self.db.execute(stmt)
            if result.scalar_one_or_none():
                raise DuplicateError(field="SKU", value=update_data["sku"])

        for field, value in update_data.items():
            setattr(product, field, value)

        await self.db.commit()
        await self.db.refresh(product)
        return product

    async def delete_product(self, product_uid: str) -> None:
        product = await self.get_product(product_uid)
        
        # Check if product is referenced in any order
        stmt = select(OrderItem).filter(OrderItem.product_id == product.id).limit(1)
        result = await self.db.execute(stmt)
        if result.scalar_one_or_none():
            raise DependencyError(resource="Product", resource_id=product_uid, reason="Referenced in active orders")

        await self.db.delete(product)
        await self.db.commit()
