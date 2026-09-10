import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import apiClient from '../api/client'
import type { PostSummary } from '../types'

export default function PublicBlogList() {
  const { profileId } = useParams()
  const [posts, setPosts] = useState<PostSummary[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiClient
      .get<PostSummary[]>(`/profile/${profileId}/posts`)
      .then(({ data }) => setPosts(data))
      .catch(() => setError('This blog does not exist or is not public.'))
  }, [profileId])

  if (error) return <p className="text-center mt-16 text-fire-600">{error}</p>
  if (!posts) return <p className="text-center mt-16 text-earth-700">Loading...</p>

  return (
    <div className="max-w-3xl mx-auto mt-10 mb-10 px-4 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-earth-900">Blog</h1>

      <section className="card">
        {posts.length === 0 && <p className="text-sm text-earth-500">No posts yet.</p>}
        <div className="flex flex-col divide-y divide-earth-200">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/u/${profileId}/blog/${post.slug}`}
              className="py-4 first:pt-0 last:pb-0 hover:opacity-80"
            >
              <p className="font-medium text-earth-900">{post.title}</p>
              <p className="text-xs text-earth-500 mt-1">
                {post.published_at && new Date(post.published_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
