'use client'

import { motion } from 'framer-motion'
import { FileText, ExternalLink, BookOpen } from 'lucide-react'
import { publications, getPublicationsByYear } from '@/lib/publications'

export default function PublicationsPage() {
  const publicationsByYear = getPublicationsByYear()
  const years = Object.keys(publicationsByYear).map(Number).sort((a, b) => b - a)

  return (
    <div className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Publications</h1>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mt-6" />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-16 max-w-lg mx-auto"
        >
          <div className="text-center p-4 rounded-xl bg-card border border-border">
            <div className="text-3xl font-bold text-primary">{publications.length}</div>
            <div className="text-sm text-muted-foreground">Publications</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-card border border-border">
            <div className="text-3xl font-bold text-primary">{years.length}</div>
            <div className="text-sm text-muted-foreground">Years</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-card border border-border">
            <div className="text-3xl font-bold text-primary">3</div>
            <div className="text-sm text-muted-foreground">Conferences</div>
          </div>
        </motion.div>

        {/* Publications by Year */}
        <div className="max-w-4xl mx-auto">
          {years.map((year, yearIndex) => (
            <motion.div
              key={year}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * yearIndex }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-primary" />
                {year}
              </h2>
              <div className="space-y-6">
                {publicationsByYear[year].map((pub, pubIndex) => (
                  <motion.article
                    key={pub.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * pubIndex }}
                    className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{pub.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {pub.authors.map((author, i) => (
                            <span key={author}>
                              {author === 'SeungHyuk Hong' ? (
                                <span className="font-medium text-primary">{author}</span>
                              ) : (
                                author
                              )}
                              {i < pub.authors.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </p>
                        <p className="text-sm text-primary font-medium mb-4">{pub.venueFull}</p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {pub.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {pub.venue}
                        </span>
                      </div>
                    </div>

                    {/* Links */}
                    {pub.link && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <a
                          href={pub.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Paper
                        </a>
                      </div>
                    )}
                  </motion.article>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
