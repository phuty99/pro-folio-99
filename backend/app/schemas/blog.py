from datetime import datetime

from pydantic import BaseModel


class PostCreateRequest(BaseModel):
    title: str
    content: str = ""


class PostUpdateRequest(BaseModel):
    title: str | None = None
    content: str | None = None
    status: str | None = None


class PostSummary(BaseModel):
    id: str
    title: str
    slug: str
    status: str
    created_at: datetime
    updated_at: datetime
    published_at: datetime | None = None

    model_config = {"from_attributes": True}


class PostResponse(PostSummary):
    content: str
