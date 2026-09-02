"""Database models for route audit records."""

from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, Text, Float
from sqlalchemy.orm import Mapped, mapped_column

from backend.db.session import Base


class RouteAudit(Base):
    __tablename__ = "route_audits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    forecast_day: Mapped[int] = mapped_column(Integer)
    vessel_ice_class: Mapped[str] = mapped_column(String(32))
    origin: Mapped[str] = mapped_column(Text)
    destination: Mapped[str] = mapped_column(Text)
    iceberg_positions: Mapped[str] = mapped_column(Text, default="[]")
    selected_route: Mapped[str] = mapped_column(String(32), default="")
    estimated_fuel_tons: Mapped[float] = mapped_column(Float, default=0.0)
