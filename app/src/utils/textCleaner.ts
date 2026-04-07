/**
 * Clean text for TTS — remove URLs, markdown, special chars
 * so the voice reads naturally
 */
export function cleanForTts(text: string): string {
  let clean = text

  // Remove URLs
  clean = clean.replace(/https?:\/\/[^\s)]+/g, '')

  // Remove markdown headers (# ## ###)
  clean = clean.replace(/^#{1,6}\s+/gm, '')

  // Remove markdown bold/italic (**text**, *text*, __text__, _text_)
  clean = clean.replace(/\*{1,3}(.*?)\*{1,3}/g, '$1')
  clean = clean.replace(/_{1,3}(.*?)_{1,3}/g, '$1')

  // Remove markdown links [text](url) → keep text
  clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  // Remove markdown images ![alt](url)
  clean = clean.replace(/!\[([^\]]*)\]\([^)]+\)/g, '')

  // Remove markdown code blocks ```...```
  clean = clean.replace(/```[\s\S]*?```/g, '')

  // Remove inline code `text` → keep text
  clean = clean.replace(/`([^`]+)`/g, '$1')

  // Remove markdown list markers (- * + 1.)
  clean = clean.replace(/^[\s]*[-*+]\s+/gm, '')
  clean = clean.replace(/^[\s]*\d+\.\s+/gm, '')

  // Remove HTML tags
  clean = clean.replace(/<[^>]+>/g, '')

  // Remove standalone special chars that shouldn't be read
  clean = clean.replace(/[#→←↑↓|~^]/g, '')

  // Remove multiple spaces/newlines
  clean = clean.replace(/\n{3,}/g, '\n\n')
  clean = clean.replace(/ {2,}/g, ' ')

  // Trim
  clean = clean.trim()

  return clean
}
