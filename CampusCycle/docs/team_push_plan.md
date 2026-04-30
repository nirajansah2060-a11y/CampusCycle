# Who Should Push Which Files

This plan is important because individual contribution is assessed through GitHub evidence. Do not let one person push everything. Each member should create their own branch, commit their assigned files and push/merge with clear commit messages.

## Nirajan Sah Teli - DevOps, Docker, README and CI/CD

Branch: `sprint4-devops-readme`

Files to push:

- `README.md`
- `CampusCycle/README.md`
- `CampusCycle/docker-compose.yml`
- `.github/workflows/node-ci.yml`
- `CampusCycle/package.json`
- `CampusCycle/src/public/placeholders/item-placeholder.png`
- `CampusCycle/src/public/placeholders/profile-placeholder.png`
- `CampusCycle/docs/sprint4_submission_checklist.md`

Suggested commands:

```bash
git checkout -b sprint4-devops-readme
git add README.md CampusCycle/README.md CampusCycle/docker-compose.yml .github/workflows/node-ci.yml CampusCycle/package.json CampusCycle/src/public/placeholders CampusCycle/docs/sprint4_submission_checklist.md
git commit -m "ci: add sprint 4 workflow and final readme"
git push origin sprint4-devops-readme
```

## Aashish Gupta - Backend features and database

Branch: `sprint4-backend-features`

Files to push:

- `CampusCycle/db/schema.sql`
- `CampusCycle/src/routes/index.js`
- `CampusCycle/src/app.js`
- `CampusCycle/package.json`
- `CampusCycle/docs/team_push_plan.md`

Suggested commands:

```bash
git checkout -b sprint4-backend-features
git add CampusCycle/db/schema.sql CampusCycle/src/routes/index.js CampusCycle/src/app.js CampusCycle/package.json CampusCycle/docs/team_push_plan.md
git commit -m "feat: add sprint 4 login points messages recommendations and api"
git push origin sprint4-backend-features
```

## Pradip Oli - UI, responsive design and PUG pages

Branch: `sprint4-ui-responsive`

Files to push:

- `CampusCycle/src/public/style.css`
- `CampusCycle/src/views/layout.pug`
- `CampusCycle/src/views/index.pug`
- `CampusCycle/src/views/item-detail.pug`
- `CampusCycle/src/views/messages.pug`
- `CampusCycle/src/views/profile.pug`
- `CampusCycle/src/views/recommendations.pug`
- `CampusCycle/docs/sprint4_kanban_board.md`

Suggested commands:

```bash
git checkout -b sprint4-ui-responsive
git add CampusCycle/src/public/style.css CampusCycle/src/views/layout.pug CampusCycle/src/views/index.pug CampusCycle/src/views/item-detail.pug CampusCycle/src/views/messages.pug CampusCycle/src/views/profile.pug CampusCycle/src/views/recommendations.pug CampusCycle/docs/sprint4_kanban_board.md
git commit -m "style: make sprint 4 pages responsive and add recommendation views"
git push origin sprint4-ui-responsive
```

## Final merge step

After all branches are pushed, merge into `main`, then check the GitHub Actions tab. Take a screenshot of the successful workflow and the contributors/insights page.
