import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import admin, auth, blog, profile, study

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Profile API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(blog.router)
app.include_router(profile.router)
app.include_router(study.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"status": "ok"}
