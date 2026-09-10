from datetime import datetime

from pydantic import BaseModel


class CategoryCreateRequest(BaseModel):
    name: str


class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str


class TopicCreateRequest(BaseModel):
    name: str


class TopicResponse(BaseModel):
    id: str
    category_id: str
    name: str
    slug: str


class CardCreateRequest(BaseModel):
    type: str = "flashcard"
    front: str = ""
    back: str = ""
    question: str = ""
    choices: list[str] | None = None
    correct_index: int | None = None
    explanation: str = ""
    level: str = "junior"


class CardUpdateRequest(BaseModel):
    front: str | None = None
    back: str | None = None
    question: str | None = None
    choices: list[str] | None = None
    correct_index: int | None = None
    explanation: str | None = None
    level: str | None = None


class CardResponse(BaseModel):
    id: str
    topic_id: str
    type: str
    front: str
    back: str
    question: str
    choices: list[str] | None = None
    correct_index: int | None = None
    explanation: str
    level: str


class BulkSaveCardsRequest(BaseModel):
    type: str = "flashcard"
    cards: list[CardCreateRequest]


class ProgressUpdateRequest(BaseModel):
    card_id: str
    known: bool


class ProgressResponse(BaseModel):
    card_id: str
    status: str
    correct_count: int
    wrong_count: int


class QuizAnswer(BaseModel):
    card_id: str
    choice_index: int


class QuizSubmitRequest(BaseModel):
    answers: list[QuizAnswer]


class QuizResultItem(BaseModel):
    card_id: str
    correct: bool
    correct_index: int
    explanation: str


class QuizSubmitResponse(BaseModel):
    score: int
    total: int
    results: list[QuizResultItem]


class QuizAttemptResponse(BaseModel):
    id: str
    topic_id: str
    score: int
    total: int
    created_at: datetime

    model_config = {"from_attributes": True}
