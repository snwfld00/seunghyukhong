import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPostBySlug, getAllPosts } from '@/lib/posts'
import { BlogPostContent } from '@/components/blog/BlogPostContent'

interface PageProps {
  params: Promise<{ slug: string }>
}

// 정적 생성을 위한 경로 생성
export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const post = getPostBySlug(decodedSlug)

  if (!post) {
    notFound()
  }

  return <BlogPostContent post={post} />
}
