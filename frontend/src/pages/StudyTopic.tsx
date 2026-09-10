import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import apiClient from '../api/client'
import { CARD_LEVELS, type CardLevel, type StudyCard, type StudyTopic } from '../types'

export default function StudyTopicPage() {
  const { topicId } = useParams()
  const [topic, setTopic] = useState<StudyTopic | null>(null)
  const [cards, setCards] = useState<StudyCard[]>([])
  const [level, setLevel] = useState<CardLevel | ''>('')
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [knownCount, setKnownCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!topicId) return
    setLoading(true)
    Promise.all([
      apiClient.get<StudyTopic>(`/study/topics/${topicId}`),
      apiClient.get<StudyCard[]>(`/study/topics/${topicId}/cards`, {
        params: { card_type: 'flashcard', ...(level ? { level } : {}) },
      }),
    ]).then(([topicRes, cardsRes]) => {
      setTopic(topicRes.data)
      setCards(cardsRes.data)
      setIndex(0)
      setKnownCount(0)
      setFlipped(false)
      setLoading(false)
    })
  }, [topicId, level])

  const currentCard = cards[index]

  const handleAnswer = async (known: boolean) => {
    if (!currentCard) return
    if (known) setKnownCount((n) => n + 1)
    try {
      await apiClient.post('/study/progress', { card_id: currentCard.id, known })
    } catch {
      // progress tracking is best-effort; keep studying even if it fails
    }
    setFlipped(false)
    setIndex((i) => i + 1)
  }

  if (loading) return <p className="text-center mt-10 text-earth-500">Loading...</p>

  return (
    <div className="max-w-2xl mx-auto mt-10 mb-10 px-4 flex flex-col gap-6">
      <Link to="/study" className="link text-sm self-start">
        ← Back to Study
      </Link>

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-earth-900">{topic?.name ?? 'Flashcards'}</h1>
        <select value={level} onChange={(e) => setLevel(e.target.value as CardLevel | '')} className="input w-auto">
          <option value="">All levels</option>
          {CARD_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {cards.length === 0 && <p className="text-earth-500 text-sm">No flashcards in this topic yet.</p>}

      {cards.length > 0 && index < cards.length && currentCard && (
        <>
          <p className="text-sm text-earth-500">
            Card {index + 1} / {cards.length} · Known: {knownCount}
          </p>

          <section
            className="card min-h-[16rem] flex items-center justify-center text-center cursor-pointer select-none"
            onClick={() => setFlipped((f) => !f)}
          >
            <p className="text-lg text-earth-900 whitespace-pre-wrap">{flipped ? currentCard.back : currentCard.front}</p>
          </section>

          <p className="text-xs text-earth-400 text-center">Click the card to flip {flipped ? '(showing answer)' : '(showing question)'}</p>

          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => handleAnswer(false)}
              className="btn-secondary"
            >
              Don't know
            </button>
            <button
              type="button"
              onClick={() => handleAnswer(true)}
              className="btn-primary"
            >
              Know it
            </button>
          </div>
        </>
      )}

      {cards.length > 0 && index >= cards.length && (
        <section className="card text-center">
          <p className="text-earth-900 font-medium mb-2">Done!</p>
          <p className="text-earth-600 text-sm mb-4">
            You knew {knownCount}/{cards.length} cards.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => {
                setIndex(0)
                setKnownCount(0)
                setFlipped(false)
              }}
              className="btn-secondary"
            >
              Study again
            </button>
            <Link
              to={`/study/${topicId}/quiz`}
              className="btn-primary"
            >
              Take quiz
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
