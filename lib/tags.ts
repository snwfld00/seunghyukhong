import tagRules from './tag-rules.json'

interface TagRule {
  keywords: string[]
  tag: string
}

const TAG_RULES: TagRule[] = tagRules

/**
 * Generate tags based on content using keyword matching
 * @param content - The text content to analyze (title + description + body)
 * @param maxTags - Maximum number of tags to return (default: 5)
 */
export function generateTags(content: string, maxTags: number = 5): string[] {
  const text = content.toLowerCase()
  const tags: string[] = []

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

  return tags.slice(0, maxTags)
}

/**
 * Get all available tag names from rules
 */
export function getAllAvailableTags(): string[] {
  return TAG_RULES.map(rule => rule.tag)
}

/**
 * Check if a tag exists in the rules
 */
export function isValidTag(tag: string): boolean {
  return TAG_RULES.some(rule => rule.tag === tag)
}

/**
 * Suggest tags for given content (returns tags with match info)
 */
export function suggestTags(content: string): { tag: string; matchedKeyword: string }[] {
  const text = content.toLowerCase()
  const suggestions: { tag: string; matchedKeyword: string }[] = []

  for (const rule of TAG_RULES) {
    for (const keyword of rule.keywords) {
      if (text.includes(keyword)) {
        suggestions.push({ tag: rule.tag, matchedKeyword: keyword })
        break
      }
    }
  }

  return suggestions
}
