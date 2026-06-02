from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, Dict

from app.database import get_db
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", summary="Get dashboard summary", description="Retrieves system statistics like total revenue, product count, and low stock items.")
async def get_summary(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    service = DashboardService(db)
    return await service.get_summary()
