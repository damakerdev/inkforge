from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class NoteBase(BaseModel):
    title:Optional[str]="Untitled"
    content: Optional[str]= ""
    is_archived: Optional[bool]=False

class NoteCreate(NoteBase):
    pass

class NoteUpdate(NoteBase):
    pass

class NoteOut(NoteBase):
    id:UUID
    created_at:datetime
    updated_at: datetime

    class Config:
        from_attributes = True