'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Github } from 'lucide-react'
import { motion } from 'framer-motion'
import { projects, getProjectBySlug } from '@/lib/projects'
import { Button } from '@/components/ui/Button'

export default function ProjectPage() {
  const params = useParams()
  const slug = params.slug as string
  const project = getProjectBySlug(slug)

  if (!project) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-2xl font-bold">Project Not Found</h1>
        <Link href="/projects" className="text-primary hover:underline mt-4 inline-block">
          Back to Projects
        </Link>
      </div>
    )
  }

  return (
    <div className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <span className="text-sm text-primary font-medium">{project.category}</span>
            <h1 className="text-4xl sm:text-5xl font-bold mt-2 mb-4">{project.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{project.description}</p>

            <div className="flex flex-wrap items-center gap-4">
              {project.github && (
                <Button href={project.github} variant="outline" size="sm" external>
                  <Github className="w-4 h-4 mr-2" />
                  View on GitHub
                </Button>
              )}
            </div>
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap gap-2 mb-12"
          >
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </motion.div>

          {/* Image placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="aspect-video rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 mb-12 flex items-center justify-center"
          >
            <span className="text-6xl font-bold gradient-text opacity-30">
              {project.title.charAt(0)}
            </span>
          </motion.div>

          {/* Content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="prose prose-lg dark:prose-invert max-w-none"
          >
            {project.longDescription.split('\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
                    {paragraph.replace('## ', '')}
                  </h2>
                )
              }
              if (paragraph.startsWith('- ')) {
                return (
                  <li key={index} className="text-muted-foreground">
                    {paragraph.replace('- ', '')}
                  </li>
                )
              }
              if (paragraph.trim()) {
                return (
                  <p key={index} className="text-muted-foreground">
                    {paragraph}
                  </p>
                )
              }
              return null
            })}
          </motion.article>

          {/* Related projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 pt-8 border-t border-border"
          >
            <h2 className="text-2xl font-bold mb-6">Other Projects</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {projects
                .filter((p) => p.slug !== project.slug)
                .slice(0, 2)
                .map((p) => (
                  <Link
                    key={p.slug}
                    href={`/projects/${p.slug}`}
                    className="p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-xs text-primary font-medium">{p.category}</span>
                    <h3 className="font-semibold mt-1">{p.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {p.description}
                    </p>
                  </Link>
                ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
