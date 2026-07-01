import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import engine, Base
from .routers import incidents, kpi

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="نظام إدارة عمليات محطات المترو الذكي",
    description="Smart Metro Station Operations Management System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incidents.router)
app.include_router(kpi.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "نظام إدارة عمليات محطات المترو الذكي يعمل"}


static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "static")
if os.path.isdir(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
