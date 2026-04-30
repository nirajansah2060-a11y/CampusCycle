# Sprint 4 Implementation Status

All Sprint 4 checklist items requested by the module brief are covered in this final code package.

| Requirement | Implemented? | File / route evidence |
|---|---:|---|
| User login | Yes | `POST /signin`, `POST /signout`, session middleware in `src/app.js`, protected `/items/new` and `/messages` |
| Basic matching algorithm | Yes | `calculateMatchScore()` in `src/routes/index.js`, shown on `/items/:id` |
| User points or ratings | Yes | `users.points` field, profile/users display points |
| Advanced ratings or points system | Yes | `point_events` table records account, listing and message point events; profile shows activity |
| In-app messaging | Yes | `GET /messages` and `POST /messages` read/write MySQL messages |
| Advanced matching algorithm / recommendations | Yes | `/recommendations` page and `scoreUserRecommendation()` function |
| External API | Yes | `getCampusWeather()`, `/api/weather`, home weather card using Open-Meteo API with fallback |
| Docker containers | Yes | `docker-compose.yml` runs app and MySQL containers |
| GitHub Action | Yes | `.github/workflows/node-ci.yml` |
| Responsive design | Yes | `src/public/style.css` media queries for 1100px, 900px, 760px and 560px breakpoints |

## Important demo routes

- `/health`
- `/api/weather`
- `/items`
- `/items/1`
- `/users`
- `/users/6`
- `/tags`
- `/signin`
- `/items/new`
- `/messages`
- `/recommendations`

## Demo login

Use any seeded account with password `demo123`, for example:

- `alex@campuscycle.test` / `demo123`
- `sarah@campuscycle.test` / `demo123`
