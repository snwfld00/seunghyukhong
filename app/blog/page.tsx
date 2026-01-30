import { getAllPosts } from '@/lib/posts'
import { BlogList } from '@/components/blog/BlogList'

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Research notes, paper reviews, and insights on Computer Vision and Deep Learning.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mt-6" />
        </div>

        <div className="max-w-3xl mx-auto">
          <BlogList posts={posts} />
        </div>
      </div>
    </div>
  )
}
