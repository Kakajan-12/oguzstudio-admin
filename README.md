# Oguz Studio — admin panel

Next.js + Ant Design. Client-rendered panel for the API in `../backend`.

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SITE_URL
npm run dev                  # http://localhost:3002
```

Log in with an admin created by `npm run create-admin` in the backend.

## Structure

- `app/login` — sign in; the token is kept in localStorage
- `app/(panel)/*` — sections behind the login (`components/AdminShell.tsx` has the menu)
- `components/ResourcePage.tsx` — table + drawer form + drag-and-drop order + "show on site" switch, used by
  services, projects, team, brands, positions, countries
- `components/InboxPage.tsx` — contact requests and job applications: filters, status, notes
- `components/inputs.tsx` — `LocalizedInput` (RU/EN/TK tabs, dot = missing translation), `LocalizedLines`,
  `ImageInput`, `ImagesInput`
- `app/(panel)/pages` — page texts; forms are generated from the backend registry (`backend/src/pages/registry.ts`)
