const fs = require('fs')
const path = require('path')

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'blog')
const OUTPUT_FILE = path.join(__dirname, '..', 'lib', 'posts.ts')
const TAG_RULES_FILE = path.join(__dirname, '..', 'lib', 'tag-rules.json')

// Load tag rules from shared JSON file
const TAG_RULES = JSON.parse(fs.readFileSync(TAG_RULES_FILE, 'utf-8'))

function parseFrontmatter(content) {
  // Normalize line endings
  content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)

  if (!match) {
    return { metadata: {}, content: content }
  }

  const frontmatter = match[1]
  const body = match[2]

  const metadata = {}
  frontmatter.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) return

    const key = line.slice(0, colonIndex).trim()
    let value = line.slice(colonIndex + 1).trim()

    // Handle arrays like tags: [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(v => v.trim().replace(/['"]/g, ''))
    } else {
      value = value.replace(/^['"]|['"]$/g, '')
    }
    metadata[key] = value
  })

  return { metadata, content: body.trim() }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, '') // Keep letters, numbers, spaces, Korean, hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

// Auto-generate tags based on content keywords
function generateTags(content, title) {
  const text = (title + ' ' + content).toLowerCase()
  const tags = []

  for (const rule of TAG_RULES) {
    for (const keyword of rule.keywords) {
      if (text.includes(keyword)) {
        if (!tags.includes(rule.tag)) {
          tags.push(rule.tag)
        }
        break
      }
    }
  }

  return tags.slice(0, 5) // Limit to 5 tags
}

function generatePosts() {
  // Create content/blog directory if it doesn't exist
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true })
    console.log('Created content/blog directory')
  }

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'))

  if (files.length === 0) {
    console.log('No markdown files found in content/blog/')
    // Create empty posts array
    const output = `export interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  author: string
  content: string
}

export const posts: Post[] = []

export function getPostBySlug(slug: string): Post | null {
  return posts.find((post) => post.slug === slug) || null
}

export function getAllPosts(): Post[] {
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
`
    fs.writeFileSync(OUTPUT_FILE, output)
    return
  }

  const posts = files.map(filename => {
    const filePath = path.join(CONTENT_DIR, filename)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { metadata, content } = parseFrontmatter(fileContent)

    // Slug from filename (URL-safe)
    const rawName = filename.replace(/\.(md|mdx)$/, '')
    const slug = slugify(rawName)

    // Title: from frontmatter or filename (without extension)
    const title = metadata.title || filename.replace(/\.(md|mdx)$/, '').replace(/_/g, ' ')

    // Date: from frontmatter or file modification time
    let date = metadata.date
    if (!date) {
      const stats = fs.statSync(filePath)
      date = stats.mtime.toISOString().split('T')[0]
    }

    // Excerpt: only from frontmatter (no auto-generation)
    const excerpt = metadata.excerpt || ''

    // Tags: from frontmatter or auto-generate based on content
    let tags = []
    if (Array.isArray(metadata.tags) && metadata.tags.length > 0) {
      tags = metadata.tags
    } else {
      tags = generateTags(content, title)
    }

    return {
      slug,
      title,
      date,
      excerpt,
      tags,
      author: metadata.author || 'SeungHyuk Hong',
      content: content
    }
  })

  // Sort by date descending
  posts.sort((a, b) => new Date(b.date) - new Date(a.date))

  const output = `export interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  author: string
  content: string
}

export const posts: Post[] = ${JSON.stringify(posts, null, 2)}

export function getPostBySlug(slug: string): Post | null {
  return posts.find((post) => post.slug === slug) || null
}

export function getAllPosts(): Post[] {
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
`

  fs.writeFileSync(OUTPUT_FILE, output)
  console.log(`Generated ${posts.length} posts to lib/posts.ts`)
}

generatePosts()
