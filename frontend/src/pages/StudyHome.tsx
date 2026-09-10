import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/client'
import type { StudyCategory, StudyTopic } from '../types'

export default function StudyHome() {
  const [categories, setCategories] = useState<StudyCategory[]>([])
  const [topicsByCategory, setTopicsByCategory] = useState<Record<string, StudyTopic[]>>({})
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    apiClient.get<StudyCategory[]>('/study/categories').then(({ data }) => setCategories(data))
  }, [])

  const toggleCategory = async (categoryId: string) => {
    if (activeCategory === categoryId) {
      setActiveCategory(null)
      return
    }
    setActiveCategory(categoryId)
    if (!topicsByCategory[categoryId]) {
      const { data } = await apiClient.get<StudyTopic[]>(`/study/categories/${categoryId}/topics`)
      setTopicsByCategory((prev) => ({ ...prev, [categoryId]: data }))
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 mb-10 px-4 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-earth-900">Study</h1>

      {categories.length === 0 && (
        <p className="text-earth-500 text-sm">No categories yet. An admin needs to create one first.</p>
      )}

      <div className="flex flex-col gap-3">
        {categories.map((category) => (
          <section key={category.id} className="card">
            <button
              type="button"
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between text-left"
            >
              <span className="font-medium text-earth-900">{category.name}</span>
              <span className="text-earth-400 text-sm">{activeCategory === category.id ? '−' : '+'}</span>
            </button>

            {activeCategory === category.id && (
              <div className="mt-4 flex flex-col gap-2">
                {(topicsByCategory[category.id] ?? []).length === 0 && (
                  <p className="text-earth-400 text-sm">No topics in this category yet.</p>
                )}
                {(topicsByCategory[category.id] ?? []).map((topic) => (
                  <div
                    key={topic.id}
                    className="flex items-center justify-between border border-earth-200 rounded-lg px-4 py-2.5"
                  >
                    <span className="text-earth-800 text-sm">{topic.name}</span>
                    <div className="flex gap-3">
                      <Link to={`/study/${topic.id}`} className="link text-sm">
                        Flashcards
                      </Link>
                      <Link to={`/study/${topic.id}/quiz`} className="link text-sm">
                        Quiz
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
