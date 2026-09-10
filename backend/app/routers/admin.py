from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin
from app.db.database import get_db
from app.models.study import Card, Category, Topic
from app.schemas.study import (
    BulkSaveCardsRequest,
    CardCreateRequest,
    CardResponse,
    CardUpdateRequest,
    CategoryCreateRequest,
    CategoryResponse,
    TopicCreateRequest,
    TopicResponse,
)
from app.services.slugify import slugify

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(get_current_admin)])


def _card_response(card: Card) -> CardResponse:
    return CardResponse(
        id=str(card.id),
        topic_id=str(card.topic_id),
        type=card.type,
        front=card.front,
        back=card.back,
        question=card.question,
        choices=card.choices,
        correct_index=card.correct_index,
        explanation=card.explanation,
        level=card.level,
    )


@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryCreateRequest, db: Session = Depends(get_db)):
    category = Category(name=payload.name, slug=slugify(payload.name))
    db.add(category)
    db.commit()
    db.refresh(category)
    return CategoryResponse(id=str(category.id), name=category.name, slug=category.slug)


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: str, db: Session = Depends(get_db)):
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    db.delete(category)
    db.commit()


@router.post("/categories/{category_id}/topics", response_model=TopicResponse, status_code=status.HTTP_201_CREATED)
def create_topic(category_id: str, payload: TopicCreateRequest, db: Session = Depends(get_db)):
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    topic = Topic(category_id=category.id, name=payload.name, slug=slugify(payload.name))
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return TopicResponse(id=str(topic.id), category_id=str(topic.category_id), name=topic.name, slug=topic.slug)


@router.delete("/topics/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_topic(topic_id: str, db: Session = Depends(get_db)):
    topic = db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")
    db.delete(topic)
    db.commit()


@router.get("/topics/{topic_id}/cards", response_model=list[CardResponse])
def list_topic_cards(topic_id: str, db: Session = Depends(get_db)):
    topic = db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")
    return [_card_response(c) for c in topic.cards]


@router.post("/topics/{topic_id}/cards", response_model=CardResponse, status_code=status.HTTP_201_CREATED)
def create_card(topic_id: str, payload: CardCreateRequest, db: Session = Depends(get_db)):
    """Add a single card by hand, independent of the AI-generate flow."""
    topic = db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")

    card = Card(
        topic_id=topic.id,
        type=payload.type,
        front=payload.front,
        back=payload.back,
        question=payload.question,
        choices=payload.choices,
        correct_index=payload.correct_index,
        explanation=payload.explanation,
        level=payload.level,
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return _card_response(card)


@router.post("/topics/{topic_id}/cards/bulk", response_model=list[CardResponse], status_code=status.HTTP_201_CREATED)
def bulk_save_cards(topic_id: str, payload: BulkSaveCardsRequest, db: Session = Depends(get_db)):
    topic = db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")

    cards = []
    for item in payload.cards:
        card = Card(
            topic_id=topic.id,
            type=payload.type,
            front=item.front,
            back=item.back,
            question=item.question,
            choices=item.choices,
            correct_index=item.correct_index,
            explanation=item.explanation,
            level=item.level,
        )
        db.add(card)
        cards.append(card)
    db.commit()
    for card in cards:
        db.refresh(card)
    return [_card_response(c) for c in cards]


@router.put("/cards/{card_id}", response_model=CardResponse)
def update_card(card_id: str, payload: CardUpdateRequest, db: Session = Depends(get_db)):
    card = db.get(Card, card_id)
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")

    for field in ("front", "back", "question", "choices", "correct_index", "explanation", "level"):
        value = getattr(payload, field)
        if value is not None:
            setattr(card, field, value)

    db.commit()
    db.refresh(card)
    return _card_response(card)


@router.delete("/cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(card_id: str, db: Session = Depends(get_db)):
    card = db.get(Card, card_id)
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    db.delete(card)
    db.commit()
