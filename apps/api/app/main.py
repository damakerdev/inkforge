from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.database import get_db,engine
from app.api.v1.endpoints import notes

app=FastAPI(
    title="InkForge API Core",
    version="0.1.0",
    description="Backend service for InkForge",
    redirect_slashes=True
)
origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notes.router,prefix="/api/v1/notes", tags=["notes"])
@app.get("/")
def read_root():
    return {"status":"healthy","message":"Welcome to InkForge v0.1.0 :)"}

@app.get("/health")
def health_check(db: Session=Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status":"healthy","database":"connected"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Db connection error:{str(e)}")
