import uuid
from sqlalchemy import Column,String,Text,DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class NoteModel(Base):
    __tablename__="notes"
    id=Column(UUID(as_uuid=True), primary_key=True,default=uuid.uuid4)
    title=Column(String(255),nullable=False, default="Untitled")
    content = Column(Text,nullable=False, default="")
    is_archived=Column(Boolean, default = False)
    created_at= Column(DateTime(timezone=True), server_default=func.now())
    updated_at=Column(DateTime(timezone=True), onupdate=func.now(),server_default=func.now())