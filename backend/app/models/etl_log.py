from sqlalchemy import Column, Integer, BigInteger, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.models.base import Base

class EtlActivityLog(Base):
    __tablename__ = "etl_activity_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("app_users.id", ondelete="SET NULL"), nullable=True, index=True)
    cedant_code = Column(String(50), nullable=False, index=True)
    cedant_name = Column(String(150), nullable=True)
    cob = Column(String(30), nullable=False, index=True)
    category = Column(String(20), nullable=False, index=True)  # "premi" | "claim"
    target_table = Column(String(100), nullable=False, index=True)
    period = Column(String(50), nullable=True)
    file_name = Column(String(255), nullable=True)
    file_size_bytes = Column(BigInteger, nullable=True)
    rows_inserted = Column(Integer, default=0, nullable=False)
    rows_deleted = Column(Integer, default=0, nullable=False)
    status = Column(String(20), default="success", nullable=False)  # "success" | "failed"
    error_message = Column(Text, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    executed_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)

    # Relationship to user
    user = relationship("AppUser", backref="etl_logs", foreign_keys=[user_id])

    def __repr__(self):
        return f"<EtlActivityLog(id={self.id}, table='{self.target_table}', status='{self.status}')>"
