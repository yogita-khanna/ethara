import pytest
from httpx import AsyncClient
from app.config import settings

pytestmark = pytest.mark.asyncio

async def test_create_order_success(client: AsyncClient, create_customer, create_product):
    customer = await create_customer()
    product = await create_product(price=10.0, quantity=5)
    
    payload = {
        "customer_id": customer.id,
        "items": [
            {"product_id": product.id, "quantity": 2}
        ],
        "notes": "Fast delivery"
    }
    response = await client.post(f"{settings.API_PREFIX}/orders/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["total_amount"] == 20.0
    
    # Check stock deduction
    resp_prod = await client.get(f"{settings.API_PREFIX}/products/{product.id}")
    assert resp_prod.json()["quantity"] == 3

async def test_create_order_insufficient_stock(client: AsyncClient, create_customer, create_product):
    customer = await create_customer()
    product = await create_product(quantity=1)
    
    payload = {
        "customer_id": customer.id,
        "items": [
            {"product_id": product.id, "quantity": 5}
        ]
    }
    response = await client.post(f"{settings.API_PREFIX}/orders/", json=payload)
    assert response.status_code == 422
    assert response.json()["detail"]["available"] == 1
    assert response.json()["detail"]["product_id"] == product.id

async def test_create_order_customer_not_found(client: AsyncClient, create_product):
    product = await create_product(quantity=10)
    payload = {
        "customer_id": 999,
        "items": [{"product_id": product.id, "quantity": 1}]
    }
    response = await client.post(f"{settings.API_PREFIX}/orders/", json=payload)
    assert response.status_code == 404

async def test_create_order_product_not_found(client: AsyncClient, create_customer):
    customer = await create_customer()
    payload = {
        "customer_id": customer.id,
        "items": [{"product_id": 999, "quantity": 1}]
    }
    response = await client.post(f"{settings.API_PREFIX}/orders/", json=payload)
    assert response.status_code == 404

async def test_create_order_quantity_zero(client: AsyncClient, create_customer, create_product):
    customer = await create_customer()
    product = await create_product()
    payload = {
        "customer_id": customer.id,
        "items": [{"product_id": product.id, "quantity": 0}]
    }
    response = await client.post(f"{settings.API_PREFIX}/orders/", json=payload)
    assert response.status_code == 422

async def test_create_order_multiple_items_atomicity(client: AsyncClient, create_customer, create_product):
    customer = await create_customer()
    product1 = await create_product(quantity=10)
    product2 = await create_product(quantity=2) # Insufficient stock for this one
    
    payload = {
        "customer_id": customer.id,
        "items": [
            {"product_id": product1.id, "quantity": 5},
            {"product_id": product2.id, "quantity": 5}
        ]
    }
    response = await client.post(f"{settings.API_PREFIX}/orders/", json=payload)
    assert response.status_code == 422
    
    # Check product 1 stock is not deducted (rolled back)
    resp_prod1 = await client.get(f"{settings.API_PREFIX}/products/{product1.id}")
    assert resp_prod1.json()["quantity"] == 10

async def test_get_all_orders_filter_status(client: AsyncClient, create_customer, create_product, db):
    from app.models.order import Order, OrderStatus
    customer = await create_customer()
    o1 = Order(customer_id=customer.id, status=OrderStatus.pending)
    o2 = Order(customer_id=customer.id, status=OrderStatus.delivered)
    db.add_all([o1, o2])
    await db.commit()
    
    response = await client.get(f"{settings.API_PREFIX}/orders/?status=pending")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["status"] == "pending"

async def test_get_order_detail(client: AsyncClient, create_customer, create_product):
    customer = await create_customer()
    product = await create_product(price=50.0, quantity=10)
    
    payload = {
        "customer_id": customer.id,
        "items": [{"product_id": product.id, "quantity": 2}]
    }
    resp_create = await client.post(f"{settings.API_PREFIX}/orders/", json=payload)
    order_id = resp_create.json()["id"]
    
    response = await client.get(f"{settings.API_PREFIX}/orders/{order_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["customer"]["id"] == customer.id
    assert len(data["items"]) == 1
    assert data["items"][0]["unit_price"] == 50.0
    assert data["items"][0]["product"]["id"] == product.id

async def test_delete_pending_order_success(client: AsyncClient, create_customer, create_product):
    customer = await create_customer()
    product = await create_product(quantity=5)
    
    payload = {
        "customer_id": customer.id,
        "items": [{"product_id": product.id, "quantity": 2}]
    }
    resp_create = await client.post(f"{settings.API_PREFIX}/orders/", json=payload)
    order_id = resp_create.json()["id"]
    
    response = await client.delete(f"{settings.API_PREFIX}/orders/{order_id}")
    assert response.status_code == 204
    
    # Stock should be restored
    resp_prod = await client.get(f"{settings.API_PREFIX}/products/{product.id}")
    assert resp_prod.json()["quantity"] == 5

async def test_delete_non_pending_order(client: AsyncClient, create_customer, db):
    from app.models.order import Order, OrderStatus
    customer = await create_customer()
    order = Order(customer_id=customer.id, status=OrderStatus.shipped, total_amount=0)
    db.add(order)
    await db.commit()
    await db.refresh(order)
    
    response = await client.delete(f"{settings.API_PREFIX}/orders/{order.id}")
    assert response.status_code == 409
