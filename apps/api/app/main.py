from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app=FastAPI(
    title="InkForge API Core",
    version="0.1.0",
    description="backend service for InkForge"
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

@app.get("/")
def read_root():
    return {"status":"success","message":"Welcome to InkForge v0.1.0 :)"}

@app.get("/health")
def health_check():
    return {"status":"healthy"}
