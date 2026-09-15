from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.core.database import get_db
from app.models.note import NoteModel
from app.schemas.note import NoteCreate, NoteUpdate, NoteOut

router=APIRouter(prefix="/notes",tags=["Notes"])
@router.post("/",response_model=NoteOut,status_code=status.HTTP_201_CREATED)
def create_note(note_data:NoteCreate,db:Session=Depends(get_db)):
    db_note=NoteModel(
        title=note_data.title,
        content=note_data.content,
        is_archived=note_data.is_archived
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@router.get("/",response_model=List[NoteOut])
def read_all_notes(db:Session=Depends(get_db)):
    return db.query(NoteModel).filter(NoteModel.is_archived==False).order_by(NoteModel.updated_at.desc()).all()

@router.get("/{note_id}",response_model=NoteOut)
def read_sigle_note(note_id: UUID, db:Session=Depends(get_db)):
    note=db.query(NoteModel).filter(NoteModel.id==note_id).first()
    if not note:
        raise HTTPException(status_code=404,detail="Note not found")
    return note

@router.put("/{note_id}",response_model=NoteOut)
def update_note(note_id: UUID, updated_data:NoteUpdate, db:Session=Depends(get_db)):
    note_query=db.query(NoteModel).filter(NoteModel.id==note_id)
    note=note_query.first()
    if not note:
        raise HTTPException(status_code=404,detail="Note not found")
    update_dict=updated_data.model_dump(exclude_unset=True)
    note_query.update(update_dict,synchronize_session=False)
    db.commit()
    db.refresh(note)
    return note

@router.delete("/{note_id}",status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id:UUID,db:Session=Depends(get_db)):
    note=db.query(NoteModel).filter(NoteModel.id==note_id).first()
    if not note:
        raise HTTPException(status_code=404,detail="Note not found")
    db.delete(note)
    db.commit()
    return None
