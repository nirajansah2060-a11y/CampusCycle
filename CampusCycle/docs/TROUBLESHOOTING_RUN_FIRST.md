# Run-first troubleshooting

## Current error fixed

If your terminal says:

```text
Error: Cannot find module './db'
Require stack:
- /app/src/app.js
```

that means `CampusCycle/src/db.js` was missing from the folder Docker used. This fixed version includes `src/db.js` and also removes the bind mount from `docker-compose.yml`.

## Run commands

```bash
cd CampusCycle
docker compose down -v --remove-orphans
docker builder prune -f
docker compose build --no-cache
docker compose up
```

Open:

```text
http://localhost:3001
```

## Demo login

```text
alex@campuscycle.test
demo123
```
