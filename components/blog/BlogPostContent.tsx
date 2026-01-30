'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, Link2, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDate } from '@/lib/utils'
import type { Post } from '@/lib/posts'

interface BlogPostContentProps {
  post: Post
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/blog/${post.slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Process inline formatting (bold, code, links, images)
  const processInline = (text: string): string => {
    // Images: ![alt](url)
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg my-4 max-w-full" />')
    // Links: [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>')
    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">$1</code>')
    return text
  }

  // Simple markdown rendering
  const renderContent = (content: string) => {
    const lines = content.split('\n')
    const elements: React.ReactNode[] = []
    let inList = false
    let listItems: string[] = []

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside mb-4 space-y-2 text-muted-foreground">
            {listItems.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: processInline(item) }} />
            ))}
          </ul>
        )
        listItems = []
      }
      inList = false
    }

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      // Image only line
      if (trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)) {
        flushList()
        const match = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
        if (match) {
          elements.push(
            <figure key={index} className="my-8">
              <img
                src={match[2]}
                alt={match[1]}
                className="rounded-lg max-w-full mx-auto shadow-lg border border-border/50"
                style={{ maxHeight: '500px', objectFit: 'contain' }}
              />
              {match[1] && (
                <figcaption className="text-center text-sm text-muted-foreground mt-3 italic">
                  {match[1]}
                </figcaption>
              )}
            </figure>
          )
        }
        return
      }

      if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
        flushList()
        elements.push(
          <h2 key={index} className="text-2xl font-bold mt-10 mb-4 text-foreground">
            {trimmed.replace('# ', '')}
          </h2>
        )
      } else if (trimmed.startsWith('## ')) {
        flushList()
        elements.push(
          <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
            {trimmed.replace('## ', '')}
          </h2>
        )
      } else if (trimmed.startsWith('### ')) {
        flushList()
        elements.push(
          <h3 key={index} className="text-xl font-bold mt-6 mb-3">
            {trimmed.replace('### ', '')}
          </h3>
        )
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        inList = true
        listItems.push(trimmed.replace(/^[-*] /, ''))
      } else if (trimmed.startsWith('> ')) {
        flushList()
        elements.push(
          <blockquote
            key={index}
            className="border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded-r-lg text-muted-foreground mb-6"
            dangerouslySetInnerHTML={{ __html: processInline(trimmed.replace('> ', '')) }}
          />
        )
      } else if (trimmed) {
        flushList()
        elements.push(
          <p key={index} className="text-muted-foreground leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: processInline(trimmed) }} />
        )
      }
    })

    flushList()
    return elements
  }

  return (
    <div className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <article className="max-w-3xl mx-auto">
          {/* Back button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">{post.title}</h1>
            {post.excerpt && (
              <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
            )}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.date)}</span>
              </div>
            </div>
          </motion.header>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="prose prose-lg dark:prose-invert max-w-none"
          >
            {renderContent(post.content)}
          </motion.div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16 pt-8 border-t border-border"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                If you found this article helpful, consider sharing it with others.
              </p>
              <button
                onClick={copyLink}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </motion.footer>
        </article>
      </div>
    </div>
  )
}
