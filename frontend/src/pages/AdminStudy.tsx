import { useEffect, useState } from 'react'
import apiClient from '../api/client'
import { CARD_LEVELS, type CardLevel, type CardType, type StudyCard, type StudyCategory, type StudyTopic } from '../types'

const EMPTY_MANUAL_CARD = {
  type: 'flashcard' as CardType,
  level: 'junior' as CardLevel,
  front: '',
  back: '',
  question: '',
  choices: ['', '', '', ''],
  correct_index: 0,
  explanation: '',
}

export default function AdminStudy() {
  const [categories, setCategories] = useState<StudyCategory[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [topics, setTopics] = useState<StudyTopic[]>([])
  const [newTopicName, setNewTopicName] = useState('')

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [cards, setCards] = useState<StudyCard[]>([])

  const [error, setError] = useState('')

  const [manualCard, setManualCard] = useState(EMPTY_MANUAL_CARD)
  const [savingManualCard, setSavingManualCard] = useState(false)

  const loadCategories = () => apiClient.get<StudyCategory[]>('/study/categories').then(({ data }) => setCategories(data))

  useEffect(() => {
    loadCategories()
  }, [])

  const loadTopics = (categoryId: string) =>
    apiClient.get<StudyTopic[]>(`/study/categories/${categoryId}/topics`).then(({ data }) => setTopics(data))

  const loadCards = (topicId: string) =>
    apiClient.get<StudyCard[]>(`/admin/topics/${topicId}/cards`).then(({ data }) => setCards(data))

  const selectCategory = async (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setSelectedTopicId(null)
    setCards([])
    await loadTopics(categoryId)
  }

  const selectTopic = async (topicId: string) => {
    setSelectedTopicId(topicId)
    await loadCards(topicId)
  }

  const addCategory = async () => {
    if (!newCategoryName.trim()) return
    await apiClient.post('/admin/categories', { name: newCategoryName })
    setNewCategoryName('')
    await loadCategories()
  }

  const deleteCategory = async (categoryId: string) => {
    await apiClient.delete(`/admin/categories/${categoryId}`)
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null)
      setTopics([])
    }
    await loadCategories()
  }

  const addTopic = async () => {
    if (!newTopicName.trim() || !selectedCategoryId) return
    await apiClient.post(`/admin/categories/${selectedCategoryId}/topics`, { name: newTopicName })
    setNewTopicName('')
    await loadTopics(selectedCategoryId)
  }

  const deleteTopic = async (topicId: string) => {
    await apiClient.delete(`/admin/topics/${topicId}`)
    if (selectedTopicId === topicId) {
      setSelectedTopicId(null)
      setCards([])
    }
    if (selectedCategoryId) await loadTopics(selectedCategoryId)
  }

  const deleteCard = async (cardId: string) => {
    await apiClient.delete(`/admin/cards/${cardId}`)
    if (selectedTopicId) await loadCards(selectedTopicId)
  }

  const saveManualCard = async () => {
    if (!selectedTopicId) return
    if (manualCard.type === 'flashcard' && (!manualCard.front.trim() || !manualCard.back.trim())) return
    if (manualCard.type === 'quiz' && (!manualCard.question.trim() || manualCard.choices.some((c) => !c.trim()))) return

    setSavingManualCard(true)
    setError('')
    try {
      await apiClient.post(`/admin/topics/${selectedTopicId}/cards`, {
        type: manualCard.type,
        level: manualCard.level,
        front: manualCard.front,
        back: manualCard.back,
        question: manualCard.question,
        choices: manualCard.type === 'quiz' ? manualCard.choices : null,
        correct_index: manualCard.type === 'quiz' ? manualCard.correct_index : null,
        explanation: manualCard.explanation,
      })
      setManualCard({ ...EMPTY_MANUAL_CARD, type: manualCard.type, level: manualCard.level })
      await loadCards(selectedTopicId)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not save card')
    } finally {
      setSavingManualCard(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 mb-10 px-4 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-earth-900">Admin · Study content</h1>
      {error && <p className="text-fire-600 text-sm">{error}</p>}

      <div className="grid md:grid-cols-2 gap-4">
        <section className="card">
          <h2 className="font-medium text-earth-900 mb-3">Categories</h2>
          <div className="flex flex-col gap-2 mb-3">
            {categories.map((c) => (
              <div
                key={c.id}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer ${
                  selectedCategoryId === c.id ? 'border-fire-500 bg-fire-50 dark:bg-fire-500/10' : 'border-earth-200'
                }`}
                onClick={() => selectCategory(c.id)}
              >
                <span className="text-sm text-earth-800">{c.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteCategory(c.id)
                  }}
                  className="text-xs text-earth-400 hover:text-fire-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Java, Python, React.js..."
              className="input"
            />
            <button type="button" onClick={addCategory} className="btn-ghost">
              + Add
            </button>
          </div>
        </section>

        <section className="card">
          <h2 className="font-medium text-earth-900 mb-3">Topics</h2>
          {!selectedCategoryId && <p className="text-earth-400 text-sm">Select a category.</p>}
          {selectedCategoryId && (
            <>
              <div className="flex flex-col gap-2 mb-3">
                {topics.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer ${
                      selectedTopicId === t.id ? 'border-fire-500 bg-fire-50 dark:bg-fire-500/10' : 'border-earth-200'
                    }`}
                    onClick={() => selectTopic(t.id)}
                  >
                    <span className="text-sm text-earth-800">{t.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteTopic(t.id)
                      }}
                      className="text-xs text-earth-400 hover:text-fire-600"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="Fundamentals, Collections..."
                  className="input"
                />
                <button type="button" onClick={addTopic} className="btn-ghost">
                  + Add
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {selectedTopicId && (
        <section className="card">
          <h2 className="font-medium text-earth-900 mb-3">Add a card manually</h2>
          <p className="text-xs text-earth-400 mb-3">
            This topic currently has {cards.length} published cards.
          </p>
          <div className="flex flex-col gap-3 max-w-xl">
            <div className="flex gap-2">
              <select
                value={manualCard.type}
                onChange={(e) => setManualCard({ ...EMPTY_MANUAL_CARD, type: e.target.value as CardType, level: manualCard.level })}
                className="input"
              >
                <option value="flashcard">Flashcard</option>
                <option value="quiz">Quiz (multiple choice)</option>
              </select>
              <select
                value={manualCard.level}
                onChange={(e) => setManualCard({ ...manualCard, level: e.target.value as CardLevel })}
                className="input"
              >
                {CARD_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {manualCard.type === 'flashcard' ? (
              <>
                <textarea
                  value={manualCard.front}
                  onChange={(e) => setManualCard({ ...manualCard, front: e.target.value })}
                  placeholder="Front"
                  rows={2}
                  className="input"
                />
                <textarea
                  value={manualCard.back}
                  onChange={(e) => setManualCard({ ...manualCard, back: e.target.value })}
                  placeholder="Back"
                  rows={2}
                  className="input"
                />
              </>
            ) : (
              <>
                <textarea
                  value={manualCard.question}
                  onChange={(e) => setManualCard({ ...manualCard, question: e.target.value })}
                  placeholder="Question"
                  rows={2}
                  className="input"
                />
                {manualCard.choices.map((choice, choiceIdx) => (
                  <div key={choiceIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={manualCard.correct_index === choiceIdx}
                      onChange={() => setManualCard({ ...manualCard, correct_index: choiceIdx })}
                    />
                    <input
                      value={choice}
                      onChange={(e) => {
                        const nextChoices = [...manualCard.choices]
                        nextChoices[choiceIdx] = e.target.value
                        setManualCard({ ...manualCard, choices: nextChoices })
                      }}
                      placeholder={`Choice ${choiceIdx + 1}`}
                      className="input"
                    />
                  </div>
                ))}
                <textarea
                  value={manualCard.explanation}
                  onChange={(e) => setManualCard({ ...manualCard, explanation: e.target.value })}
                  placeholder="Explanation"
                  rows={2}
                  className="input"
                />
              </>
            )}

            <button type="button" onClick={saveManualCard} disabled={savingManualCard} className="btn-secondary self-start">
              {savingManualCard ? 'Saving...' : 'Add card'}
            </button>
          </div>
        </section>
      )}

      {selectedTopicId && cards.length > 0 && (
        <section className="card">
          <h2 className="font-medium text-earth-900 mb-3">Published cards</h2>
          <div className="flex flex-col gap-2">
            {cards.map((c) => (
              <div key={c.id} className="flex items-center justify-between border border-earth-200 rounded-lg px-3 py-2">
                <span className="text-sm text-earth-700 truncate mr-3">
                  {c.type === 'flashcard' ? c.front : c.question}
                </span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="badge bg-earth-100 text-earth-600">{c.level}</span>
                  <button type="button" onClick={() => deleteCard(c.id)} className="text-xs text-earth-400 hover:text-fire-600">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
