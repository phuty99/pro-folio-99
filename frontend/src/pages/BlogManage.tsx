import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/client'
import type { PostSummary } from '../types'

const STATUS_BADGE: Record<PostSummary['status'], string> = {
  draft: 'bg-earth-100 text-earth-600',
  published: 'bg-fire-50 text-fire-700',
}

export default function BlogManage() {
  const [posts, setPosts] = useState<PostSummary[] | null>(null)
  const [error, setError] = useState('')

  const loadPosts = async () => {
    const { data } = await apiClient.get<PostSummary[]>('/blog/me')
    setPosts(data)
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const handleDelete = async (postId: string) => {
    setError('')
    try {
      await apiClient.delete(`/blog/me/${postId}`)
      setPosts((prev) => prev?.filter((p) => p.id !== postId) ?? null)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not delete post')
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 mb-10 px-4 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-earth-900">My Blog</h1>
        <Link to="/blog/new" className="btn-primary">
          + New post
        </Link>
      </div>

      {error && <p className="text-fire-600 text-sm">{error}</p>}

      <section className="card">
        {posts === null && <p className="text-sm text-earth-500">Loading...</p>}
        {posts?.length === 0 && <p className="text-sm text-earth-500">No posts yet. Write your first one!</p>}
        <div className="flex flex-col divide-y divide-earth-200">
          {posts?.map((post) => (
            <div key={post.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-earth-900 truncate">{post.title || 'Untitled'}</p>
                  <span className={`badge shrink-0 ${STATUS_BADGE[post.status]}`}>
                    {post.status}
                  </span>
                </div>
                <p className="text-xs text-earth-500 mt-1">
                  Updated {new Date(post.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Link to={`/blog/${post.id}/edit`} className="link text-sm">
                  Edit
                </Link>
                <button type="button" onClick={() => handleDelete(post.id)} className="link text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
