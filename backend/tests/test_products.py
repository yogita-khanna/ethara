import pytest
from httpx import AsyncClient
from app.config import settings

pytestmark = pytest.mark.asyncio

async def test_create_product_success(client: AsyncClient):
    payload = {
        "name": "Test Product",
        "sku": "TST-001",
        "price": 10.5,
        "quantity": 100
    }
    response = await client.post(f"{settings.API_PREFIX}/products/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == payload["name"]
    assert data["sku"] == payload["sku"]
    assert data["price"] == payload["price"]

async def test_create_product_duplicate_sku(client: AsyncClient, create_product):
    await create_product(sku="DUP-001")
    payload = {
        "name": "Another Product",
        "sku": "DUP-001",
        "price": 20.0,
        "quantity": 50
    }
    response = await client.post(f"{settings.API_PREFIX}/products/", json=payload)
    assert response.status_code == 409
    assert response.json()["detail"]["field"] == "SKU"

async def test_create_product_missing_fields(client: AsyncClient):
    payload = {"name": "Incomplete"}
    response = await client.post(f"{settings.API_PREFIX}/products/", json=payload)
    assert response.status_code == 422

async def test_create_product_negative_price(client: AsyncClient):
    payload = {
        "name": "Invalid Price",
        "sku": "INV-001",
        "price": -5.0,
        "quantity": 10
    }
    response = await client.post(f"{settings.API_PREFIX}/products/", json=payload)
    assert response.status_code == 422

async def test_get_all_products_empty(client: AsyncClient):
    response = await client.get(f"{settings.API_PREFIX}/products/")
    assert response.status_code == 200
    assert response.json() == []

async def test_get_all_products_pagination(client: AsyncClient, create_product):
    for i in range(5):
        await create_product(sku=f"PAG-{i}")
    response = await client.get(f"{settings.API_PREFIX}/products/?skip=0&limit=3")
    assert response.status_code == 200
    assert len(response.json()) == 3

async def test_get_product_by_id_success(client: AsyncClient, create_product):
    product = await create_product()
    response = await client.get(f"{settings.API_PREFIX}/products/{product.uid}")
    assert response.status_code == 200
    assert response.json()["uid"] == product.uid

async def test_get_product_by_id_not_found(client: AsyncClient):
    response = await client.get(f"{settings.API_PREFIX}/products/999")
    assert response.status_code == 404

async def test_update_product_success(client: AsyncClient, create_product):
    product = await create_product()
    payload = {"price": 99.99}
    response = await client.put(f"{settings.API_PREFIX}/products/{product.uid}", json=payload)
    assert response.status_code == 200
    assert response.json()["price"] == 99.99

async def test_update_product_duplicate_sku(client: AsyncClient, create_product):
    await create_product(sku="EXISTING-SKU")
    product2 = await create_product(sku="OTHER-SKU")
    payload = {"sku": "EXISTING-SKU"}
    response = await client.put(f"{settings.API_PREFIX}/products/{product2.uid}", json=payload)
    assert response.status_code == 409

async def test_update_product_not_found(client: AsyncClient):
    response = await client.put(f"{settings.API_PREFIX}/products/999", json={"price": 10})
    assert response.status_code == 404

async def test_delete_product_success(client: AsyncClient, create_product):
    product = await create_product()
    response = await client.delete(f"{settings.API_PREFIX}/products/{product.uid}")
    assert response.status_code == 204
    # Verify it's gone
    resp2 = await client.get(f"{settings.API_PREFIX}/products/{product.uid}")
    assert resp2.status_code == 404

async def test_delete_product_not_found(client: AsyncClient):
    response = await client.delete(f"{settings.API_PREFIX}/products/999")
    assert response.status_code == 404

async def test_delete_product_referenced_in_order(client: AsyncClient, create_product, create_customer, db):
    from app.models.order import Order, OrderItem, OrderStatus
    product = await create_product()
    customer = await create_customer()
    order = Order(customer_id=customer.id, status=OrderStatus.pending, total_amount=10)
    db.add(order)
    await db.commit()
    await db.refresh(order)
    item = OrderItem(order_id=order.id, product_id=product.id, quantity=1, unit_price=10, subtotal=10)
    db.add(item)
    await db.commit()
    
    response = await client.delete(f"{settings.API_PREFIX}/products/{product.uid}")
    assert response.status_code == 409
