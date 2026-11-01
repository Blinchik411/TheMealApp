import { describe, expect, it } from 'vitest';
import { getYouTubeEmbedUrl } from './youtube';

describe('getYouTubeEmbedUrl', () => {
  it('correctly parses standard watch?v= URL', () => {
    const url = 'https://www.youtube.com/watch?v=1IszT_guI08';
    expect(getYouTubeEmbedUrl(url)).toBe('https://www.youtube.com/embed/1IszT_guI08');
  });

  it('correctly parses short youtu.be URL', () => {
    const url = 'https://youtu.be/1IszT_guI08';
    expect(getYouTubeEmbedUrl(url)).toBe('https://www.youtube.com/embed/1IszT_guI08');
  });

  it('correctly parses watch URL with additional query parameters', () => {
    const url = 'https://www.youtube.com/watch?v=1IszT_guI08&t=45s&feature=share';
    expect(getYouTubeEmbedUrl(url)).toBe('https://www.youtube.com/embed/1IszT_guI08');

    const urlParamsFirst = 'https://www.youtube.com/watch?feature=share&v=1IszT_guI08';
    expect(getYouTubeEmbedUrl(urlParamsFirst)).toBe('https://www.youtube.com/embed/1IszT_guI08');
  });

  it('handles already-embedded URL', () => {
    const url = 'https://www.youtube.com/embed/1IszT_guI08';
    expect(getYouTubeEmbedUrl(url)).toBe('https://www.youtube.com/embed/1IszT_guI08');
  });

  it('returns null for empty, undefined, or invalid URLs', () => {
    expect(getYouTubeEmbedUrl(undefined)).toBeNull();
    expect(getYouTubeEmbedUrl(null)).toBeNull();
    expect(getYouTubeEmbedUrl('')).toBeNull();
    expect(getYouTubeEmbedUrl('   ')).toBeNull();
    expect(getYouTubeEmbedUrl('https://example.com/video')).toBeNull();
  });
});
