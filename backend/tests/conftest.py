import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from typing import AsyncGenerator
import factory
from faker import Faker

from app.main import app
from app.database import Base, get_db
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order, OrderStatus

# Use an in-memory SQLite database for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=None)
TestingSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

fake = Faker()

@pytest_asyncio.fixture(scope="session")
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture(scope="function")
async def db(setup_db) -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session

@pytest_asyncio.fixture(scope="function")
async def client(db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

# Factories (using build, and we insert manually because factory-boy async support is limited)
class ProductFactory(factory.Factory):
    class Meta:
        model = Product

    name = factory.Faker('word')
    sku = factory.Sequence(lambda n: f"SKU-{n}-TST")
    description = factory.Faker('sentence')
    price = factory.Faker('pyfloat', positive=True, min_value=1.0, max_value=100.0, right_digits=2)
    quantity = factory.Faker('random_int', min=10, max=100)

class CustomerFactory(factory.Factory):
    class Meta:
        model = Customer

    full_name = factory.Faker('name')
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    phone = "+1234567890"

class OrderFactory(factory.Factory):
    class Meta:
        model = Order

    customer_id = 1
    status = OrderStatus.pending
    total_amount = 0.0
    notes = ""

@pytest_asyncio.fixture
async def create_product(db: AsyncSession):
    async def _create(**kwargs):
        product = ProductFactory.build(**kwargs)
        db.add(product)
        await db.commit()
        await db.refresh(product)
        return product
    return _create

@pytest_asyncio.fixture
async def create_customer(db: AsyncSession):
    async def _create(**kwargs):
        customer = CustomerFactory.build(**kwargs)
        db.add(customer)
        await db.commit()
        await db.refresh(customer)
        return customer
    return _create

@pytest_asyncio.fixture
async def create_order(db: AsyncSession):
    async def _create(**kwargs):
        order = OrderFactory.build(**kwargs)
        db.add(order)
        await db.commit()
        await db.refresh(order)
        return order
    return _create
