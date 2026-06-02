import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings
from app.routers import products_router, customers_router, orders_router, dashboard_router
from app.exceptions import (
    NotFoundError,
    DuplicateError,
    InsufficientStockError,
    OrderCancellationError,
    DependencyError
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Inventory & Order Management API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Application startup: verifying settings and connecting to database.")

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}

# Include routers
app.include_router(products_router, prefix=settings.API_PREFIX)
app.include_router(customers_router, prefix=settings.API_PREFIX)
app.include_router(orders_router, prefix=settings.API_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_PREFIX)

# Exception Handlers
@app.exception_handler(NotFoundError)
async def not_found_exception_handler(request: Request, exc: NotFoundError):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"error": True, "message": exc.message, "detail": {"resource": exc.resource, "id": exc.resource_id}},
    )

@app.exception_handler(DuplicateError)
async def duplicate_exception_handler(request: Request, exc: DuplicateError):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"error": True, "message": exc.message, "detail": {"field": exc.field, "value": exc.value}},
    )

@app.exception_handler(DependencyError)
async def dependency_exception_handler(request: Request, exc: DependencyError):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"error": True, "message": exc.message, "detail": {"resource": exc.resource, "id": exc.resource_id, "reason": exc.reason}},
    )

@app.exception_handler(InsufficientStockError)
async def insufficient_stock_exception_handler(request: Request, exc: InsufficientStockError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": True, "message": exc.message, "detail": {"product_id": exc.product_id, "available": exc.available, "requested": exc.requested}},
    )

@app.exception_handler(OrderCancellationError)
async def order_cancellation_exception_handler(request: Request, exc: OrderCancellationError):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"error": True, "message": exc.message, "detail": {"reason": exc.reason}},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": True, "message": "Validation error", "detail": exc.errors()},
    )

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": True, "message": "Internal server error", "detail": "A database error occurred."},
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": True, "message": "Internal server error", "detail": str(exc)},
    )
