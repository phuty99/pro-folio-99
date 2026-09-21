import { useEffect, useRef, useState, type FormEvent } from 'react'
import { FiMessageCircle, FiSend, FiX } from 'react-icons/fi'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import apiClient from '../api/client'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const MAX_QUESTION_LENGTH = 500
const MAX_HISTORY = 7

const SUGGESTIONS = [
  'Summarize his experience',
  'What is his strongest tech stack?',
  'Which projects has he built?',
]

export default function AskCvChat({ profileId, name }: { profileId: string; name: string }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading, open])

  const ask = async (question: string) => {
    const text = question.trim()
    if (!text || loading) return

    const history = messages.slice(-MAX_HISTORY)
    setMessages([...messages, { role: 'user', content: text }])
    setInput('')
    setError('')
    setLoading(true)
    try {
      const { data } = await apiClient.post<{ answer: string }>(`/profile/${profileId}/ask`, {
        messages: [...history, { role: 'user', content: text }],
      })
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }])
    } catch (err: any) {
      // Drop the unanswered question so user/assistant turns keep alternating for the next request.
      setMessages((prev) => prev.slice(0, -1))
      setInput(text)
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    ask(input)
  }

  const shortName = name.trim().split(/\s+/).pop() || 'me'

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-primary fixed bottom-5 right-5 z-40 rounded-full px-5 py-3 shadow-lg"
      >
        <FiMessageCircle size={18} />
        Ask about {shortName}
      </button>
    )
  }

  return (
    <section
      aria-label={`Ask about ${name}`}
      className="fixed bottom-5 right-5 z-40 flex h-[32rem] max-h-[calc(100vh-2.5rem)] w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-earth-300 bg-white shadow-xl dark:border-earth-200 dark:bg-earth-100 sm:w-96"
    >
      <header className="flex items-center justify-between border-b border-earth-200 px-4 py-3">
        <div>
          <h2 className="text-sm font-black text-earth-900">Ask about {shortName}</h2>
          <p className="text-xs text-earth-500">AI answers based on this profile only</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close chat"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-earth-600 hover:bg-earth-200"
        >
          <FiX size={18} />
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.length === 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-earth-700">
              Hi! I can answer questions about {shortName}&apos;s experience, skills and projects. Try:
            </p>
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => ask(suggestion)}
                className="self-start rounded-full border border-earth-300 px-3 py-1.5 text-left text-xs text-earth-800 hover:border-fire-400 hover:text-fire-600"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {messages.map((message, i) =>
          message.role === 'user' ? (
            <p key={i} className="max-w-[85%] self-end whitespace-pre-line rounded-2xl rounded-br-sm bg-fire-600 px-3 py-2 text-sm text-white">
              {message.content}
            </p>
          ) : (
            <div
              key={i}
              className="prose prose-sm max-w-[90%] self-start rounded-2xl rounded-bl-sm bg-earth-200 px-3 py-2 dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-a:text-fire-600 prose-p:text-earth-900 prose-li:text-earth-900 prose-strong:text-earth-900"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          )
        )}

        {loading && <p className="self-start rounded-2xl bg-earth-200 px-3 py-2 text-sm text-earth-600">Thinking...</p>}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p role="alert" className="mx-4 mb-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-earth-200 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={MAX_QUESTION_LENGTH}
          placeholder="Ask a question..."
          aria-label="Your question"
          className="input"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send question"
          className="btn-primary h-9 w-9 shrink-0 !p-0"
        >
          <FiSend size={16} />
        </button>
      </form>
    </section>
  )
}
