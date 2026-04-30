# Sprint 4 Demo Script

Use this route order during the review. Keep the demo short and clear.

1. Open terminal and run:

```bash
cd CampusCycle
docker compose down -v
docker compose up --build
```

2. Open `http://localhost:3001/health` and say: this proves the Express app is connected to MySQL inside Docker.

3. Open `/items` and say: this is the database-driven listings page.

4. Open `/items/1` and say: this is the listing detail page. Sprint 4 adds Recommended Matches based on the same category.

5. Open `/tags` and say: this is the category/tag browsing feature required from Sprint 3.

6. Open `/users` and say: this is the member list. Sprint 4 adds community points.

7. Open `/users/6` and say: this profile shows the user's listings, categories shared, response rate and points.

8. Open `/signin` and log in with `alex@campuscycle.test` / `demo123`.

9. Open `/items/new`, create a short test listing and show that it is saved to the database.

10. Return to the user profile and show that points increase after listing creation.

11. Open `/messages` and say: this is the Sprint 4 database-backed messaging MVP.

12. Open GitHub Actions and show the successful workflow run.
