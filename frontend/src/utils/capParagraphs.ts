export const MAX_SECTION_PARAGRAPHS = 3;

export function capParagraphs<T>(paragraphs: T[] | undefined | null, max = MAX_SECTION_PARAGRAPHS): T[] {
  return (paragraphs || []).slice(0, max);
}
