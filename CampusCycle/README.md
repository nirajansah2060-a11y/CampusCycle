# CampusCycle Sprint 3 Figma-aligned prototype

CampusCycle is a database-driven campus resource sharing platform built with Express, Pug, MySQL, and Docker. This version aligns the web app more closely to the supplied Figma prototype while keeping the Sprint 3 assessment requirements in scope.

## What is included

- Home / browse landing page
- Listings page with search and filters
- Listing detail page with gallery
- Categories page
- Category filtered listing page
- Community members page
- User profile page
- Sign in page
- Create account page
- Create listing page with PNG upload support
- Demo messages page
- Docker + MySQL setup
- Seeded placeholder images and profile photos

## Sprint 3 requirement coverage

Required database-driven pages from the brief are implemented:

- `/users`
- `/users/:id`
- `/items`
- `/items/:id`
- `/tags`
- `/tags/:id/items`

Additional prototype routes:

- `/signin`
- `/signup`
- `/items/new`
- `/messages`
- `/health`

## Run the project

```bash
docker compose down -v
docker compose up --build
```

Then open:

```text
http://localhost:3000
```

## Demo login

Use any seeded email with password `admin`.

Examples:

- `alex@campuscycle.test`
- `sarah@campuscycle.test`
- `marcus@campuscycle.test`

## Image replacement

A full image placement guide is included here:

- `docs/IMAGE-PLACEMENT.md`

You can either:

- replace the placeholder PNG files directly in the `src/public/uploads/` folders, or
- upload new item images from `/items/new`

## Important note

This project is suitable for Sprint 3 presentation and prototype demonstration. Real messaging, production authentication, and moderation workflows would normally be expanded in a later sprint.
