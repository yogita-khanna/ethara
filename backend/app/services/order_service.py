from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from sqlalchemy import func

from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.order import OrderCreate
from app.exceptions import NotFoundError, InsufficientStockError, OrderCancellationError

class OrderService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_order(self, order_in: OrderCreate) -> Order:
        # ATOMIC transaction implicitly managed by SQLAlchemy
        # 1. Load customer by uid
        stmt_cust = select(Customer).filter(Customer.uid == order_in.customer_uid)
        result_cust = await self.db.execute(stmt_cust)
        customer = result_cust.scalar_one_or_none()
        if not customer:
            raise NotFoundError(resource="Customer", resource_id=order_in.customer_uid)

        # Create Order first to attach items
        new_order = Order(
            customer_id=customer.id,
            notes=order_in.notes,
            status=OrderStatus.pending,
            total_amount=0
        )
        self.db.add(new_order)
        # Flush to get the order ID
        await self.db.flush()

        total_amount = 0.0

        for item_in in order_in.items:
            # 2. Load product by uid
            stmt_prod = select(Product).filter(Product.uid == item_in.product_uid).with_for_update()
            result_prod = await self.db.execute(stmt_prod)
            product = result_prod.scalar_one_or_none()

            if not product:
                raise NotFoundError(resource="Product", resource_id=item_in.product_uid)

            # 3. Check stock
            if product.quantity < item_in.quantity:
                raise InsufficientStockError(
                    product_id=product.id,
                    available=product.quantity,
                    requested=item_in.quantity
                )

            # 4. Deduct stock
            product.quantity -= item_in.quantity

            # 5. Snapshot unit_price
            unit_price = product.price

            # 6. Compute subtotal
            subtotal = unit_price * item_in.quantity
            total_amount += float(subtotal)

            # Create OrderItem
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=product.id,
                quantity=item_in.quantity,
                unit_price=unit_price,
                subtotal=subtotal
            )
            self.db.add(order_item)

        new_order.total_amount = total_amount
        await self.db.commit()
        await self.db.refresh(new_order)
        
        # Load relationships for response
        return await self.get_order(new_order.uid)

    async def get_orders(self, skip: int = 0, limit: int = 20, status: Optional[OrderStatus] = None) -> List[Order]:
        stmt = select(Order).options(selectinload(Order.customer))
        if status:
            stmt = stmt.filter(Order.status == status)
        
        stmt = stmt.offset(skip).limit(limit).order_by(Order.id.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_order(self, order_uid: str) -> Order:
        stmt = select(Order).options(
            selectinload(Order.customer),
            selectinload(Order.items).selectinload(OrderItem.product)
        ).filter(Order.uid == order_uid)
        result = await self.db.execute(stmt)
        order = result.scalar_one_or_none()
        if not order:
            raise NotFoundError(resource="Order", resource_id=order_uid)
        return order

    async def delete_order(self, order_uid: str) -> None:
        order = await self.get_order(order_uid)
        
        # 1. Only allow delete if status is "pending" or "cancelled"
        if order.status not in [OrderStatus.pending, OrderStatus.cancelled]:
            raise OrderCancellationError(reason=f"Cannot delete order with status {order.status}")

        # 2. Restore stock
        for item in order.items:
            stmt_prod = select(Product).filter(Product.id == item.product_id).with_for_update()
            result_prod = await self.db.execute(stmt_prod)
            product = result_prod.scalar_one_or_none()
            if product:
                product.quantity += item.quantity

        await self.db.delete(order)
        await self.db.commit()
