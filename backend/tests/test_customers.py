import pytest
from httpx import AsyncClient
from app.config import settings

pytestmark = pytest.mark.asyncio

async def test_create_customer_success(client: AsyncClient):
    payload = {
        "full_name": "John Doe",
        "email": "john@example.com"
    }
    response = await client.post(f"{settings.API_PREFIX}/customers/", json=payload)
    assert response.status_code == 201
    assert response.json()["email"] == payload["email"]

async def test_create_customer_duplicate_email(client: AsyncClient, create_customer):
    await create_customer(email="duplicate@example.com")
    payload = {
        "full_name": "Jane Doe",
        "email": "duplicate@example.com"
    }
    response = await client.post(f"{settings.API_PREFIX}/customers/", json=payload)
    assert response.status_code == 409
    assert response.json()["detail"]["field"] == "Email"

async def test_create_customer_invalid_email(client: AsyncClient):
    payload = {
        "full_name": "John",
        "email": "not-an-email"
    }
    response = await client.post(f"{settings.API_PREFIX}/customers/", json=payload)
    assert response.status_code == 422

async def test_get_all_customers_pagination(client: AsyncClient, create_customer):
    for i in range(5):
        await create_customer(email=f"user{i}@example.com")
    response = await client.get(f"{settings.API_PREFIX}/customers/?skip=0&limit=3")
    assert response.status_code == 200
    assert len(response.json()) == 3

async def test_get_customer_by_id(client: AsyncClient, create_customer):
    customer = await create_customer()
    response = await client.get(f"{settings.API_PREFIX}/customers/{customer.id}")
    assert response.status_code == 200
    
    response = await client.get(f"{settings.API_PREFIX}/customers/999")
    assert response.status_code == 404

async def test_delete_customer_success(client: AsyncClient, create_customer):
    customer = await create_customer()
    response = await client.delete(f"{settings.API_PREFIX}/customers/{customer.id}")
    assert response.status_code == 204
    
async def test_delete_customer_has_active_orders(client: AsyncClient, create_customer, db):
    from app.models.order import Order, OrderStatus
    customer = await create_customer()
    order = Order(customer_id=customer.id, status=OrderStatus.pending, total_amount=0)
    db.add(order)
    await db.commit()
    
    response = await client.delete(f"{settings.API_PREFIX}/customers/{customer.id}")
    assert response.status_code == 409
