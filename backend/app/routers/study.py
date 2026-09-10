from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.study import Card, Category, QuizAttempt, StudyProgress, Topic
from app.models.user import User
from app.schemas.study import (
    CardResponse,
    CategoryResponse,
    ProgressResponse,
    ProgressUpdateRequest,
    QuizResultItem,
    QuizSubmitRequest,
    QuizSubmitResponse,
    TopicResponse,
)

router = APIRouter(prefix="/study", tags=["study"])


def _study_card_response(card: Card, reveal_answer: bool) -> CardResponse:
    return CardResponse(
        id=str(card.id),
        topic_id=str(card.topic_id),
        type=card.type,
        front=card.front,
        back=card.back,
        question=card.question,
        choices=card.choices,
        correct_index=card.correct_index if reveal_answer else None,
        explanation=card.explanation if reveal_answer else "",
        level=card.level,
    )


@router.get("/categories", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).order_by(Category.sort_order).all()
    return [CategoryResponse(id=str(c.id), name=c.name, slug=c.slug) for c in categories]


@router.get("/categories/{category_id}/topics", response_model=list[TopicResponse])
def list_topics(category_id: str, db: Session = Depends(get_db)):
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return [
        TopicResponse(id=str(t.id), category_id=str(t.category_id), name=t.name, slug=t.slug)
        for t in category.topics
    ]


@router.get("/topics/{topic_id}", response_model=TopicResponse)
def get_topic(topic_id: str, db: Session = Depends(get_db)):
    topic = db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")
    return TopicResponse(id=str(topic.id), category_id=str(topic.category_id), name=topic.name, slug=topic.slug)


@router.get("/topics/{topic_id}/cards", response_model=list[CardResponse])
def list_cards(topic_id: str, card_type: str = "flashcard", level: str | None = None, db: Session = Depends(get_db)):
    topic = db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")
    cards = [c for c in topic.cards if c.type == card_type and (level is None or c.level == level)]
    reveal_answer = card_type == "flashcard"
    return [_study_card_response(c, reveal_answer) for c in cards]


@router.post("/progress", response_model=ProgressResponse)
def update_progress(
    payload: ProgressUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    card = db.get(Card, payload.card_id)
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")

    progress = (
        db.query(StudyProgress)
        .filter(StudyProgress.user_id == current_user.id, StudyProgress.card_id == card.id)
        .first()
    )
    if not progress:
        progress = StudyProgress(user_id=current_user.id, card_id=card.id)
        db.add(progress)

    progress.status = "known" if payload.known else "learning"
    if payload.known:
        progress.correct_count += 1
    else:
        progress.wrong_count += 1

    db.commit()
    db.refresh(progress)
    return ProgressResponse(
        card_id=str(progress.card_id),
        status=progress.status,
        correct_count=progress.correct_count,
        wrong_count=progress.wrong_count,
    )


@router.get("/topics/{topic_id}/progress", response_model=list[ProgressResponse])
def get_topic_progress(
    topic_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    topic = db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")
    card_ids = [c.id for c in topic.cards]
    progress_rows = (
        db.query(StudyProgress)
        .filter(StudyProgress.user_id == current_user.id, StudyProgress.card_id.in_(card_ids))
        .all()
    )
    return [
        ProgressResponse(
            card_id=str(p.card_id), status=p.status, correct_count=p.correct_count, wrong_count=p.wrong_count
        )
        for p in progress_rows
    ]


@router.post("/topics/{topic_id}/quiz/submit", response_model=QuizSubmitResponse)
def submit_quiz(
    topic_id: str,
    payload: QuizSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    topic = db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")

    results: list[QuizResultItem] = []
    score = 0
    for answer in payload.answers:
        card = db.get(Card, answer.card_id)
        if not card or card.topic_id != topic.id or card.correct_index is None:
            continue
        correct = answer.choice_index == card.correct_index
        if correct:
            score += 1
        results.append(
            QuizResultItem(
                card_id=str(card.id),
                correct=correct,
                correct_index=card.correct_index,
                explanation=card.explanation,
            )
        )

    attempt = QuizAttempt(user_id=current_user.id, topic_id=topic.id, score=score, total=len(results))
    db.add(attempt)
    db.commit()

    return QuizSubmitResponse(score=score, total=len(results), results=results)
