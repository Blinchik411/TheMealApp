import { getYouTubeEmbedUrl } from '@/shared/lib';
import { Video } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface MealVideoSectionProps {
  youtubeUrl?: string;
  title: string;
}

export const MealVideoSection = ({ youtubeUrl, title }: MealVideoSectionProps) => {
  const t = useTranslations('MealDetails');
  const embedUrl = getYouTubeEmbedUrl(youtubeUrl);

  if (!embedUrl) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 print:hidden">
      <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
        <Video className="size-6 text-red-500" />
        <span>{t('cookingVideo')}</span>
      </div>
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border">
        <iframe
          src={embedUrl}
          title={t('videoIframeTitle', { title })}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      </div>
    </div>
  );
};
