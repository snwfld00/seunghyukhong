import { Hero } from '@/components/home/Hero'
import { About } from '@/components/home/About'
import { Skills } from '@/components/home/Skills'
import { FeaturedProjects } from '@/components/home/FeaturedProjects'
import { RecentPosts } from '@/components/home/RecentPosts'
import { Contact } from '@/components/home/Contact'
import { getAllPosts } from '@/lib/posts'

export default function Home() {
  const recentPosts = getAllPosts().slice(0, 1)

  return (
    <>
      <Hero />
      <About />
      <Skills />
      <FeaturedProjects />
      <RecentPosts posts={recentPosts} />
      <Contact />
    </>
  )
}
