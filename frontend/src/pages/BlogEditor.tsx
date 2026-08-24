import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import apiClient from '../api/client'
import type { Post } from '../types'

const CARD = 'bg-white dark:bg-earth-100 rounded-2xl border border-earth-300 dark:border-earth-200 shadow-md p-6'
const INPUT = 'w-full border border-earth-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fire-500'

export default function BlogEditor() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(postId)

  const [post, setPost] = useState<Post | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!postId) return
    apiClient.get<Post>(`/blog/me/${postId}`).then(({ data }) => {
      setPost(data)
      setTitle(data.title)
      setContent(data.content)
    })
  }, [postId])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      if (isEditing) {
        const { data } = await apiClient.put<Post>(`/blog/me/${postId}`, { title, content })
        setPost(data)
      } else {
        const { data } = await apiClient.post<Post>('/blog/me', { title, content })
        navigate(`/blog/${data.id}/edit`, { replace: true })
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not save post')
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublish = async () => {
    if (!post) return
    setSaving(true)
    setError('')
    try {
      const nextStatus = post.status === 'published' ? 'draft' : 'published'
      const { data } = await apiClient.put<Post>(`/blog/me/${post.id}`, { status: nextStatus })
      setPost(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not update post status')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 mb-10 px-4 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-earth-900">{isEditing ? 'Edit post' : 'New post'}</h1>
        {post && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              post.status === 'published' ? 'bg-fire-50 text-fire-700' : 'bg-earth-100 text-earth-600'
            }`}
          >
            {post.status}
          </span>
        )}
      </div>

      {error && <p className="text-fire-600 text-sm">{error}</p>}

      <section className={CARD}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-earth-600 mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={INPUT}
              placeholder="Post title"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-earth-600">Content (Markdown)</label>
              <div className="flex gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setTab('write')}
                  className={`px-2 py-1 rounded-md ${tab === 'write' ? 'bg-fire-600 text-white' : 'bg-earth-100 text-earth-700'}`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setTab('preview')}
                  className={`px-2 py-1 rounded-md ${tab === 'preview' ? 'bg-fire-600 text-white' : 'bg-earth-100 text-earth-700'}`}
                >
                  Preview
                </button>
              </div>
            </div>

            {tab === 'write' ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                className={`${INPUT} font-mono`}
                placeholder="Write your post in Markdown..."
              />
            ) : (
              <div className="border border-earth-300 rounded-lg px-4 py-3 min-h-[24rem] prose prose-sm max-w-none dark:prose-invert prose-headings:text-earth-900 prose-p:text-earth-800 prose-a:text-fire-600 prose-strong:text-earth-900 prose-code:text-fire-700">
                {content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                ) : (
                  <p className="text-earth-400">Nothing to preview yet.</p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2 border-t border-earth-200">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="bg-fire-600 hover:bg-fire-700 text-white rounded-lg py-2 px-4 font-medium mt-4"
            >
              {saving ? 'Saving...' : 'Save draft'}
            </button>
            {isEditing && post && (
              <button
                type="button"
                onClick={handleTogglePublish}
                disabled={saving}
                className="text-earth-700 hover:text-earth-900 text-sm font-medium mt-4"
              >
                {post.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
