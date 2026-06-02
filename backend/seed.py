import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.config import settings
from sqlalchemy import text
from app.models import Product, Customer, Order, OrderItem
import random

async def seed_data():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session() as session:
        # Check if already seeded
        result = await session.execute(text("SELECT COUNT(*) FROM products"))
        count = result.scalar()
        if count > 0:
            print("Database already seeded. Skipping.")
            return

        print("Seeding products...")
        products = [
            Product(name="Wireless Mouse", sku="WM-001", description="Ergonomic wireless mouse", price=29.99, quantity=50),
            Product(name="Mechanical Keyboard", sku="MK-002", description="RGB mechanical keyboard", price=89.99, quantity=30),
            Product(name="USB-C Hub", sku="UCH-003", description="7-in-1 USB-C hub", price=45.00, quantity=100),
            Product(name="27-inch Monitor", sku="MN-004", description="4K UHD Monitor", price=350.00, quantity=4), # Low stock
            Product(name="Laptop Stand", sku="LS-005", description="Aluminum laptop stand", price=35.50, quantity=0), # Out of stock
        ]
        session.add_all(products)
        await session.commit()

        print("Seeding customers...")
        customers = [
            Customer(full_name="Alice Smith", email="alice@example.com", phone="+1234567890"),
            Customer(full_name="Bob Johnson", email="bob@example.com", phone="+1987654321"),
            Customer(full_name="Charlie Davis", email="charlie@example.com", phone=None),
        ]
        session.add_all(customers)
        await session.commit()

        print("Seeding orders...")
        # Get products and customers to use their IDs
        result = await session.execute(text("SELECT id, price FROM products"))
        db_products = result.fetchall()
        
        result = await session.execute(text("SELECT id FROM customers"))
        db_customers = result.scalars().all()

        statuses = ["pending", "confirmed", "shipped", "delivered"]
        
        for i in range(10):
            customer_id = random.choice(db_customers)
            order = Order(customer_id=customer_id, status=random.choice(statuses), notes=f"Test order {i}")
            session.add(order)
            await session.commit()
            
            # Add 1-3 random items
            total = 0
            for _ in range(random.randint(1, 3)):
                prod = random.choice(db_products)
                qty = random.randint(1, 2)
                subtotal = prod.price * qty
                total += subtotal
                
                item = OrderItem(order_id=order.id, product_id=prod.id, quantity=qty, unit_price=prod.price, subtotal=subtotal)
                session.add(item)
            
            order.total_amount = total
            await session.commit()

        print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_data())
