import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import apiClient from '../api/client'
import type { Post } from '../types'

const TOOLBAR_BTN = 'px-2 py-1.5 rounded-md text-xs font-medium bg-earth-100 hover:bg-earth-200 text-earth-800'

const TOOLBAR_ACTIONS = [
  { label: 'B', title: 'Bold', kind: 'wrap' as const, before: '**', after: '**', placeholder: 'bold text' },
  { label: 'I', title: 'Italic', kind: 'wrap' as const, before: '*', after: '*', placeholder: 'italic text' },
  { label: '</>', title: 'Inline code', kind: 'wrap' as const, before: '`', after: '`', placeholder: 'code' },
  { label: 'H2', title: 'Heading', kind: 'line' as const, prefix: '## ' },
  { label: '"', title: 'Quote', kind: 'line' as const, prefix: '> ' },
  { label: '•', title: 'Bullet list', kind: 'line' as const, prefix: '- ' },
  { label: '1.', title: 'Numbered list', kind: 'line' as const, prefix: '1. ' },
  { label: '🔗', title: 'Link', kind: 'wrap' as const, before: '[', after: '](https://)', placeholder: 'link text' },
  { label: '{ }', title: 'Code block', kind: 'wrap' as const, before: '```\n', after: '\n```', placeholder: 'code here' },
]

export default function BlogEditor() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(postId)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [post, setPost] = useState<Post | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
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

  const applyWrap = (before: string, after: string, placeholder: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.slice(start, end) || placeholder
    const nextContent = content.slice(0, start) + before + selected + after + content.slice(end)
    setContent(nextContent)
    requestAnimationFrame(() => {
      textarea.focus()
      const selStart = start + before.length
      textarea.setSelectionRange(selStart, selStart + selected.length)
    })
  }

  const applyLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const lineStart = content.lastIndexOf('\n', start - 1) + 1
    const nextContent = content.slice(0, lineStart) + prefix + content.slice(lineStart)
    setContent(nextContent)
    requestAnimationFrame(() => {
      textarea.focus()
      const pos = start + prefix.length
      textarea.setSelectionRange(pos, pos)
    })
  }

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
    <div className="max-w-6xl mx-auto mt-10 mb-10 px-4 flex flex-col gap-6">
      <Link to="/blog" className="link text-sm self-start">
        ← Back to My Blog
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-earth-900">{isEditing ? 'Edit post' : 'New post'}</h1>
        {post && (
          <span
            className={`badge ${post.status === 'published' ? 'bg-fire-50 text-fire-700' : 'bg-earth-100 text-earth-600'}`}
          >
            {post.status}
          </span>
        )}
      </div>

      {error && <p className="text-fire-600 text-sm">{error}</p>}

      <section className="card">
        <div className="flex flex-col gap-4">
          <div>
            <label className="field-label">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Post title"
            />
          </div>

          <div>
            <label className="field-label">Content (Markdown)</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {TOOLBAR_ACTIONS.map((action) => (
                <button
                  key={action.title}
                  type="button"
                  title={action.title}
                  aria-label={action.title}
                  onClick={() =>
                    action.kind === 'wrap'
                      ? applyWrap(action.before, action.after, action.placeholder)
                      : applyLinePrefix(action.prefix)
                  }
                  className={TOOLBAR_BTN}
                >
                  {action.label}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                className="input font-mono"
                placeholder="Write your post in Markdown..."
              />
              <div className="border border-earth-300 rounded-lg px-4 py-3 overflow-y-auto max-h-[32rem] prose prose-sm max-w-none dark:prose-invert prose-headings:text-earth-900 prose-p:text-earth-800 prose-a:text-fire-600 prose-strong:text-earth-900 prose-code:text-fire-700">
                {content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                ) : (
                  <p className="text-earth-400">Nothing to preview yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-earth-200">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="btn-primary mt-4"
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
