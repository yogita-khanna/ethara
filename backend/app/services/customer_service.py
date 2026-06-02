from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from app.models.customer import Customer
from app.models.order import Order
from app.schemas.customer import CustomerCreate, CustomerUpdate
from app.exceptions import NotFoundError, DuplicateError, DependencyError

class CustomerService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_customer(self, customer_in: CustomerCreate) -> Customer:
        stmt = select(Customer).filter(Customer.email == customer_in.email)
        result = await self.db.execute(stmt)
        if result.scalar_one_or_none():
            raise DuplicateError(field="Email", value=customer_in.email)

        customer = Customer(**customer_in.model_dump())
        self.db.add(customer)
        await self.db.commit()
        await self.db.refresh(customer)
        return customer

    async def get_customers(self, skip: int = 0, limit: int = 20, email: Optional[str] = None) -> List[Customer]:
        stmt = select(Customer)
        if email:
            stmt = stmt.filter(Customer.email.ilike(f"%{email}%"))
        
        stmt = stmt.offset(skip).limit(limit).order_by(Customer.id.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_customer(self, customer_uid: str) -> Customer:
        stmt = select(Customer).filter(Customer.uid == customer_uid)
        result = await self.db.execute(stmt)
        customer = result.scalar_one_or_none()
        if not customer:
            raise NotFoundError(resource="Customer", resource_id=customer_uid)
        return customer

    async def update_customer(self, customer_uid: str, customer_in: CustomerUpdate) -> Customer:
        customer = await self.get_customer(customer_uid)

        update_data = customer_in.model_dump(exclude_unset=True)
        if "email" in update_data and update_data["email"] != customer.email:
            stmt = select(Customer).filter(Customer.email == update_data["email"])
            result = await self.db.execute(stmt)
            if result.scalar_one_or_none():
                raise DuplicateError(field="Email", value=update_data["email"])

        for field, value in update_data.items():
            setattr(customer, field, value)

        await self.db.commit()
        await self.db.refresh(customer)
        return customer

    async def delete_customer(self, customer_uid: str) -> None:
        customer = await self.get_customer(customer_uid)
        
        # Check active orders
        stmt = select(Order).filter(Order.customer_id == customer.id).limit(1)
        result = await self.db.execute(stmt)
        if result.scalar_one_or_none():
            raise DependencyError(resource="Customer", resource_id=customer_uid, reason="Customer has active orders")

        await self.db.delete(customer)
        await self.db.commit()
