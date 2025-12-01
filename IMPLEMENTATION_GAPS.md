# Implementation Gaps

Repository scan of unfinished or stubbed features to help plan follow-up sessions. Items are grouped by area with source pointers and suggested next steps.

## My Page
- Logout not wired: `src/components/mypage/menu-list.tsx`, `src/app/mypage/security/page.tsx` handlers just log/console. Hook to the existing `signOut()` server action (or `/auth/sign-out` flow) and redirect; ensure session cookies are cleared client-side.
- Account deletion missing: `src/app/mypage/security/page.tsx` only logs. Call `DELETE /api/users/me` (see userRoutes) and handle success/error UI from the confirmation modal.
- Profile edit stub: `src/app/mypage/edit/page.tsx` hardcodes nickname/email, has no avatar upload, and `handleSave` just alerts. Load current user via `api.users.me.get()`, add file input + upload to Supabase Storage (`avatars` bucket) and update via `PUT /api/users/me`.
- Stats/Activity widgets use fake data: `src/components/mypage/sections/stats-section.tsx` and `src/components/mypage/sections/activity-section.tsx` simulate delays with placeholder arrays. Replace with real endpoints (e.g., expose a `users/me/summary` and reuse `users/me/activity` with a limit) and remove hardcoded thumbnails/badges.
- Likes page uses static seed data: `src/app/mypage/likes/page.tsx` renders `likedPosts` constant. Wire to `GET /api/likes/me`, handle empty/error states, and support pagination if needed.
- Notification/theme settings are local-only: `src/app/mypage/notifications/page.tsx` and `src/app/mypage/settings/page.tsx` store toggles in component state without persistence or actual dark-mode/theme switching. Decide persistence layer (API or localStorage) and implement real theme toggling.

## Chat
- Message send and realtime are stubbed: `src/components/chat/chat-room.tsx` only pushes to local state and leaves a TODO for API send. It also ignores realtime hooks in `src/lib/hooks/use-chat-realtime.ts` / `useChatBroadcast` / `useChatPresence`. Wire `POST /api/chat/rooms/:id/messages`, add optimistic UI with rollback, and subscribe to realtime/presence so inbound messages/online users sync across clients.

## Support
- Inquiry submission not implemented: `src/app/support/inquiry/page.tsx` just logs and alerts. Add an API (e.g., `POST /api/support/inquiries` or email webhook), show pending/error states, and confirm with a toast/redirect after success.

## Possible Backend additions
- There is no exposed endpoint for dashboard stats consumed by My Page tiles; `activityService.getRecentSummary` exists but isn’t routed. Consider a `GET /api/users/me/summary` (posts/likes/trades counts) to feed the stats widget.
