import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/waitlist(.*)',
  '/api/sessions(.*)', // Добавить для CRUD API
  '/history(.*)'  // Добавить для history page
]);

const isProtectedRoute = createRouteMatcher([
  '/chat(.*)',
  '/history(.*)',
  '/api/chat(.*)'
]);

// Явно создаём middleware функцию
const middleware = clerkMiddleware((auth, req) => {
  // Protect chat and history routes
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

// Экспортируем как default
export default middleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
