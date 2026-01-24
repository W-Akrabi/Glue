export function extractMentions(comment: string): string[] {
  const mentions = new Set<string>();
  const regex = /@([a-zA-Z0-9._-]+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(comment)) !== null) {
    if (match[1]) {
      mentions.add(match[1]);
    }
  }
  return Array.from(mentions);
}
