import { routing } from '@/shared/config/i18n';
import createMiddleware from 'next-intl/middleware';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames, skipping internal files, static assets, etc.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
