# Dev Notes

- Data fetching preference: use Next.js **Server Components** for loading data whenever possible, and avoid client-side fetching unless interactivity requires it.
- Quick checklist for next session:
  - QA flows: profile edit (avatar upload + save), account deletion, logout, likes/activity/stats data, support inquiry submission, chat send + realtime/presence, theme toggle persistence.
  - Consider pagination for likes/activity if needed and add graceful empty/error states.
  - If needed, move notification settings persistence to backend; currently localStorage only.
