/**
 * Converts various YouTube URL formats (standard, short youtu.be, embed, with query params)
 * into a safe embed URL for iframes.
 */
export function getYouTubeEmbedUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  // Regex captures standard 11-character YouTube video ID
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+?&v=))([\w-]{11})/,
  );

  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
}
