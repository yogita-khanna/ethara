from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import Dict, Any

from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order, OrderStatus

class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_summary(self) -> Dict[str, Any]:
        # Count products
        total_products = await self.db.execute(select(func.count()).select_from(Product))
        total_products_count = total_products.scalar() or 0

        # Count customers
        total_customers = await self.db.execute(select(func.count()).select_from(Customer))
        total_customers_count = total_customers.scalar() or 0

        # Count orders
        total_orders = await self.db.execute(select(func.count()).select_from(Order))
        total_orders_count = total_orders.scalar() or 0

        # Total revenue (sum of delivered order totals)
        revenue_stmt = select(func.sum(Order.total_amount)).filter(Order.status == OrderStatus.delivered)
        revenue_result = await self.db.execute(revenue_stmt)
        total_revenue = revenue_result.scalar() or 0.0

        # Low stock products (quantity <= 10)
        low_stock_stmt = select(Product).filter(Product.quantity <= 10).order_by(Product.quantity.asc()).limit(10)
        low_stock_result = await self.db.execute(low_stock_stmt)
        low_stock_products = [
            {"id": p.id, "name": p.name, "sku": p.sku, "quantity": p.quantity}
            for p in low_stock_result.scalars().all()
        ]

        # Recent orders (last 5)
        from sqlalchemy.orm import selectinload
        recent_orders_stmt = select(Order).options(selectinload(Order.customer)).order_by(Order.created_at.desc()).limit(5)
        recent_orders_result = await self.db.execute(recent_orders_stmt)
        recent_orders = [
            {
                "id": o.id,
                "customer_name": o.customer.full_name,
                "total_amount": float(o.total_amount),
                "status": o.status,
                "created_at": o.created_at.isoformat()
            }
            for o in recent_orders_result.scalars().all()
        ]

        # Orders by status
        orders_by_status = {}
        status_stmt = select(Order.status, func.count()).group_by(Order.status)
        status_result = await self.db.execute(status_stmt)
        
        # Initialize all statuses to 0
        for status in OrderStatus:
            orders_by_status[status.value] = 0
            
        for row in status_result.all():
            orders_by_status[row[0].value] = row[1]

        return {
            "total_products": total_products_count,
            "total_customers": total_customers_count,
            "total_orders": total_orders_count,
            "total_revenue": float(total_revenue),
            "low_stock_products": low_stock_products,
            "recent_orders": recent_orders,
            "orders_by_status": orders_by_status
        }
