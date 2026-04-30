# Sprint 4 Submission Checklist - CampusCycle

## Moodle submission files

- Sprint 4 presentation PowerPoint file.
- GitHub repository link.
- GitHub Project/Kanban link.
- Sprint 4 evidence/report PDF or DOCX if allowed by Moodle.
- Individual STAR reflection and module reflection, completed personally by each student.

## Web application evidence

- Docker running successfully using `cd CampusCycle && docker compose up --build`.
- `/health` route showing database connection.
- `/api/weather` route or home page weather card showing external API integration.
- Users list page.
- User profile page with community points and points activity.
- Listings page.
- Listing detail page with scored Recommended Matches.
- Tags/categories page.
- Sign-in success and sign-out success.
- Protected create-listing page after login.
- Create-listing success with MySQL insert and +10 points event.
- In-app message send success with MySQL insert and +2 points event.
- `/recommendations` advanced recommendation page after login.
- Responsive layout screenshot for mobile/tablet using browser developer tools.

## DevOps evidence

- `.github/workflows/node-ci.yml` committed.
- GitHub Actions green tick screenshot.
- `package.json` committed so CI can install exact dependencies.
- Docker Compose command working from the `CampusCycle` folder.

## Project management evidence

- GitHub Project board screenshot.
- GitHub Insights/Contributors screenshot showing all members.
- Meeting records.
- Task allocation by developer.
- Clear commit history showing each member pushed their assigned files.

## Final demo checklist

1. Start Docker.
2. Open `/health`.
3. Open home page and show weather card.
4. Open `/items` and `/items/1`.
5. Show match scores.
6. Login using `alex@campuscycle.test` / `demo123`.
7. Create a new listing.
8. Show points increase on profile.
9. Send an in-app message.
10. Show `/recommendations`.
11. Show GitHub Actions green tick.
