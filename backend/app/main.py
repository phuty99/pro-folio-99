import logging
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.http import get_client_ip
from app.routers import admin, auth, blog, profile, study

logging.basicConfig(level=logging.INFO)
request_logger = logging.getLogger("app.request")

app = FastAPI(title="Profile API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    if request.method == "OPTIONS" or request.url.path == "/health":
        return await call_next(request)

    request_id = uuid.uuid4().hex[:12]
    started = time.perf_counter()
    status_code = 500
    try:
        response = await call_next(request)
        status_code = response.status_code
        response.headers["X-Request-ID"] = request_id
        return response
    except Exception:
        request_logger.exception("Unhandled error request_id=%s path=%s", request_id, request.url.path)
        raise
    finally:
        duration_ms = round((time.perf_counter() - started) * 1000, 1)
        level = logging.ERROR if status_code >= 500 else logging.WARNING if status_code >= 400 else logging.INFO
        # key=value pairs so Grafana can parse fields with `| logfmt`
        request_logger.log(
            level,
            "method=%s path=%s route=%s status=%d duration_ms=%.1f request_id=%s client_ip=%s",
            request.method,
            request.url.path,
            getattr(request.scope.get("route"), "path", "-"),
            status_code,
            duration_ms,
            request_id,
            get_client_ip(request),
        )


app.include_router(auth.router)
app.include_router(blog.router)
app.include_router(profile.router)
app.include_router(study.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"status": "ok"}
