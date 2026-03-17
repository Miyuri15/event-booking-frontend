# Frontend

This is the Next.js frontend for a product-style Event Booking web application. It includes a public landing page, polished authentication, a signed-in product shell, and a backend-connected account flow.

## Included Routes

- `/` landing page
- `/auth` login and registration
- `/dashboard` signed-in dashboard
- `/explore` event discovery page
- `/bookings` booking portal
- `/payments` payment portal
- `/notifications` notification center
- `/tickets` ticket hub
- `/account` account settings page

## Folder Structure

```text
frontend/
|-- app/
|   |-- auth/
|   |   `-- page.js
|   |-- account/
|   |   `-- page.js
|   |-- dashboard/
|   |   `-- page.js
|   |-- bookings/
|   |   `-- page.js
|   |-- explore/
|   |   `-- page.js
|   |-- payments/
|   |   `-- page.js
|   |-- notifications/
|   |   `-- page.js
|   |-- tickets/
|   |   `-- page.js
|   |-- globals.css
|   |-- layout.js
|   `-- page.js
|-- components/
|   |-- AppShell.js
|   |-- ConfirmationModal.js
|   `-- AuthGuard.js
|-- lib/
|   |-- api.js
|   `-- auth.js
|-- .env.example
|-- .env.local
|-- .gitignore
|-- jsconfig.json
|-- next.config.mjs
|-- package.json
`-- README.md
```

## Environment

The frontend is configured to connect to the backend user-service with:

```env
NEXT_API_BASE_URL=http://localhost:8080
```

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Notes

- Authentication state is stored in `localStorage`.
- Register, login, fetch profile, update profile, and delete account are connected to the backend user-service.
- Notifications page is ready to connect to the notification-service and falls back to preview data if the service is not running yet.
- Dashboard, explore, bookings, payments, and tickets are built as product-style pages and are ready to connect to future event, booking, and payment APIs.
