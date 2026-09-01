from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.models.base import Base

class MappingPreset(Base):
    __tablename__ = "mapping_presets"

    id = Column(Integer, primary_key=True, index=True)
    cedant_code = Column(String(50), nullable=False, index=True)
    cob = Column(String(30), nullable=False, index=True)
    category = Column(String(20), nullable=False, index=True)  # "premi" | "claim"
    preset_name = Column(String(100), nullable=False)
    mapping_json = Column(Text, nullable=False)  # JSON string of column mapping
    created_by = Column(Integer, ForeignKey("app_users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, onupdate=func.now(), nullable=True)

    creator = relationship("AppUser", foreign_keys=[created_by])

    def __repr__(self):
        return f"<MappingPreset(id={self.id}, name='{self.preset_name}', cedant='{self.cedant_code}')>"
