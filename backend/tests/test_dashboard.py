import pytest
from httpx import AsyncClient
from app.config import settings

pytestmark = pytest.mark.asyncio

async def test_dashboard_summary(client: AsyncClient, create_product, create_customer, db):
    from app.models.order import Order, OrderStatus
    # Seed data
    p1 = await create_product(quantity=5) # low stock
    p2 = await create_product(quantity=15)
    
    c1 = await create_customer()
    
    o1 = Order(customer_id=c1.id, status=OrderStatus.delivered, total_amount=100.0)
    o2 = Order(customer_id=c1.id, status=OrderStatus.pending, total_amount=50.0)
    db.add_all([o1, o2])
    await db.commit()
    
    response = await client.get(f"{settings.API_PREFIX}/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    
    assert data["total_products"] == 2
    assert data["total_customers"] == 1
    assert data["total_orders"] == 2
    assert data["total_revenue"] == 100.0 # Only delivered
    
    assert len(data["low_stock_products"]) == 1
    assert data["low_stock_products"][0]["id"] == p1.id
    
    assert len(data["recent_orders"]) == 2
    
    assert data["orders_by_status"]["delivered"] == 1
    assert data["orders_by_status"]["pending"] == 1
    assert data["orders_by_status"]["shipped"] == 0
