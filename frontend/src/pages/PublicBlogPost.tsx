import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import apiClient from '../api/client'
import type { Post } from '../types'

const CARD = 'bg-white dark:bg-earth-100 rounded-2xl border border-earth-300 dark:border-earth-200 shadow-md p-6'

export default function PublicBlogPost() {
  const { profileId, slug } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiClient
      .get<Post>(`/profile/${profileId}/posts/${slug}`)
      .then(({ data }) => setPost(data))
      .catch(() => setError('This post does not exist or is not public.'))
  }, [profileId, slug])

  if (error) return <p className="text-center mt-16 text-fire-600">{error}</p>
  if (!post) return <p className="text-center mt-16 text-earth-700">Loading...</p>

  return (
    <div className="max-w-3xl mx-auto mt-10 mb-10 px-4 flex flex-col gap-4">
      <Link to={`/u/${profileId}/blog`} className="text-sm text-fire-600 hover:text-fire-700 font-medium self-start">
        ← Back to blog
      </Link>

      <section className={CARD}>
        <h1 className="text-2xl font-semibold text-earth-900">{post.title}</h1>
        {post.published_at && (
          <p className="text-xs text-earth-500 mt-1 mb-6">{new Date(post.published_at).toLocaleDateString()}</p>
        )}
        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-earth-900 prose-p:text-earth-800 prose-a:text-fire-600 prose-strong:text-earth-900 prose-code:text-fire-700">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
      </section>
    </div>
  )
}
