import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.profile import Post
from app.models.user import User
from app.schemas.blog import PostCreateRequest, PostResponse, PostSummary, PostUpdateRequest
from app.services.slugify import slugify

router = APIRouter(prefix="/blog", tags=["blog"])


def _unique_slug(db: Session, profile_id: uuid.UUID, base_slug: str) -> str:
    slug = base_slug
    n = 2
    while db.query(Post).filter(Post.profile_id == profile_id, Post.slug == slug).first():
        slug = f"{base_slug}-{n}"
        n += 1
    return slug


def _summary(post: Post) -> PostSummary:
    return PostSummary(
        id=str(post.id),
        title=post.title,
        slug=post.slug,
        status=post.status,
        created_at=post.created_at,
        updated_at=post.updated_at,
        published_at=post.published_at,
    )


def _full(post: Post) -> PostResponse:
    return PostResponse(**_summary(post).model_dump(), content=post.content)


@router.get("/me", response_model=list[PostSummary])
def list_my_posts(current_user: User = Depends(get_current_user)):
    posts = sorted(current_user.profile.posts, key=lambda p: p.updated_at, reverse=True)
    return [_summary(p) for p in posts]


@router.post("/me", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    payload: PostCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = current_user.profile
    slug = _unique_slug(db, profile.id, slugify(payload.title))
    post = Post(profile_id=profile.id, title=payload.title, slug=slug, content=payload.content, status="draft")
    db.add(post)
    db.commit()
    db.refresh(post)
    return _full(post)


@router.get("/me/{post_id}", response_model=PostResponse)
def get_my_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.get(Post, post_id)
    if not post or post.profile_id != current_user.profile.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return _full(post)


@router.put("/me/{post_id}", response_model=PostResponse)
def update_post(
    post_id: str,
    payload: PostUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.get(Post, post_id)
    if not post or post.profile_id != current_user.profile.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    if payload.title is not None:
        post.title = payload.title
    if payload.content is not None:
        post.content = payload.content
    if payload.status is not None:
        if payload.status not in ("draft", "published"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status")
        if payload.status == "published" and post.status != "published":
            post.published_at = datetime.now(timezone.utc)
        post.status = payload.status

    db.commit()
    db.refresh(post)
    return _full(post)


@router.delete("/me/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.get(Post, post_id)
    if not post or post.profile_id != current_user.profile.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    db.delete(post)
    db.commit()
