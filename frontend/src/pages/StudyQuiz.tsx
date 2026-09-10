import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import apiClient from '../api/client'
import { CARD_LEVELS, type CardLevel, type QuizSubmitResponse, type StudyCard, type StudyTopic } from '../types'

export default function StudyQuiz() {
  const { topicId } = useParams()
  const [topic, setTopic] = useState<StudyTopic | null>(null)
  const [cards, setCards] = useState<StudyCard[]>([])
  const [level, setLevel] = useState<CardLevel | ''>('')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [result, setResult] = useState<QuizSubmitResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!topicId) return
    setLoading(true)
    Promise.all([
      apiClient.get<StudyTopic>(`/study/topics/${topicId}`),
      apiClient.get<StudyCard[]>(`/study/topics/${topicId}/cards`, {
        params: { card_type: 'quiz', ...(level ? { level } : {}) },
      }),
    ]).then(([topicRes, cardsRes]) => {
      setTopic(topicRes.data)
      setCards(cardsRes.data)
      setAnswers({})
      setResult(null)
      setLoading(false)
    })
  }, [topicId, level])

  const selectAnswer = (cardId: string, choiceIndex: number) => {
    setAnswers((prev) => ({ ...prev, [cardId]: choiceIndex }))
  }

  const handleSubmit = async () => {
    if (!topicId) return
    setSubmitting(true)
    try {
      const payload = { answers: Object.entries(answers).map(([card_id, choice_index]) => ({ card_id, choice_index })) }
      const { data } = await apiClient.post<QuizSubmitResponse>(`/study/topics/${topicId}/quiz/submit`, payload)
      setResult(data)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="text-center mt-10 text-earth-500">Loading...</p>

  const resultByCard = new Map((result?.results ?? []).map((r) => [r.card_id, r]))

  return (
    <div className="max-w-2xl mx-auto mt-10 mb-10 px-4 flex flex-col gap-6">
      <Link to="/study" className="link text-sm self-start">
        ← Back to Study
      </Link>

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-earth-900">{topic?.name ?? 'Quiz'}</h1>
        <select value={level} onChange={(e) => setLevel(e.target.value as CardLevel | '')} className="input w-auto">
          <option value="">All levels</option>
          {CARD_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {cards.length === 0 && <p className="text-earth-500 text-sm">No quiz questions in this topic yet.</p>}

      {result && (
        <section className="card text-center">
          <p className="text-earth-900 font-medium">
            Result: {result.score}/{result.total}
          </p>
        </section>
      )}

      <div className="flex flex-col gap-4">
        {cards.map((card, idx) => {
          const cardResult = resultByCard.get(card.id)
          return (
            <section key={card.id} className="card">
              <p className="font-medium text-earth-900 mb-3">
                {idx + 1}. {card.question}
              </p>
              <div className="flex flex-col gap-2">
                {(card.choices ?? []).map((choice, choiceIdx) => {
                  const selected = answers[card.id] === choiceIdx
                  let extraClass = 'border-earth-300 hover:bg-earth-100'
                  if (cardResult) {
                    if (choiceIdx === cardResult.correct_index) extraClass = 'border-fire-600 bg-fire-50 dark:bg-fire-500/10 text-fire-700 dark:text-fire-300'
                    else if (selected) extraClass = 'border-red-400 bg-red-50 text-red-700'
                  } else if (selected) {
                    extraClass = 'border-fire-600 bg-fire-50 dark:bg-fire-500/10 text-fire-700 dark:text-fire-300'
                  }
                  return (
                    <button
                      key={choiceIdx}
                      type="button"
                      disabled={!!result}
                      onClick={() => selectAnswer(card.id, choiceIdx)}
                      className={`text-left border rounded-lg px-3 py-2 text-sm ${extraClass}`}
                    >
                      {choice}
                    </button>
                  )
                })}
              </div>
              {cardResult?.explanation && (
                <p className="text-xs text-earth-500 mt-3">{cardResult.explanation}</p>
              )}
            </section>
          )
        })}
      </div>

      {cards.length > 0 && !result && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || Object.keys(answers).length !== cards.length}
          className="btn-primary self-start"
        >
          {submitting ? 'Grading...' : 'Submit'}
        </button>
      )}
    </div>
  )
}
