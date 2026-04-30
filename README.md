# CampusCycle

CampusCycle is a database-driven campus resource sharing platform designed for students to share, borrow, swap, gift, message, and discover useful academic and everyday items on campus. The application is built with **Express**, **Pug**, **MySQL**, and **Docker**, and now satisfies the main **Sprint 4 MVP requirements** including login, recommendations, messaging, points, Docker execution, and GitHub Actions CI/CD.
---

## Project Overview

CampusCycle aims to support a more sustainable and collaborative campus environment by allowing students to circulate textbooks, notes, lab equipment, calculators, bikes, kitchenware, and other useful items instead of purchasing new ones. The system helps reduce waste, lower student costs, and encourage peer-to-peer exchange within the university community.

The Sprint 4 version extends the Sprint 3 database-driven MVP into a more complete application. Students can now sign in, create listings, earn community points, send messages about listings, view recommended matches, and access a campus weather API feature for pickup planning.
---

## Sprint 4 Scope

This implementation covers the main Sprint 4 requirements:

- database-driven Express application
- MySQL integration
- Docker-based environment
- GitHub Actions CI workflow
- user login and sign-out
- protected routes for creating listings, messaging, and recommendations
- users list page
- user profile page
- listings page
- listing detail page
- tags/categories page
- create listing functionality
- basic matching algorithm on listing detail pages
- recommended matches page
- user points system
- point events history
- database-backed in-app messaging
- conversation grouping by user and listing
- external weather API route
- responsive UI and improved Sprint 4 interface
- seeded sample data for demonstration

---

## Tech Stack

- **Backend:** Node.js, Express
- **Templating Engine:** Pug
- **Database:** MySQL
- **Containerisation:** Docker, Docker Compose
- **CI/CD:** GitHub Actions
- **Styling:** Custom CSS
- **Version Control:** Git and GitHub

---

## Setup Instructions
### Run with Docker

Open a terminal in the main `CampusCycle` folder and run:

```bash
docker compose down -v --remove-orphans
docker compose build --no-cache
docker compose up
```

Then open:

`http://localhost:3001`

---

### Health Check
To confirm the server and database are running, open:

`http://localhost:3001/health`

#### Expected response:
```bash
{
  "status": "ok",
  "db": true,
  "service": "CampusCycle"
}
```
---

## Demo Credentials

Use these demo student accounts:
`
alex@campuscycle.test / demo123
sarah@campuscycle.test / demo123
marcus@campuscycle.test / demo123
elena@campuscycle.test / demo123
`
----

## Database

The application uses a seeded MySQL database. The Sprint 4 schema includes:

- users
- listings
- tags
- listing_tags
- listing_images
- messages
- point_events

## Main Relationships

One user can create many listings.
One listing belongs to one user.
One tag can be the primary category for many listings.
Listings and tags have a many-to-many relationship through listing_tags.
One listing can have many listing images.
One user can send many messages.
One user can receive many messages.
One message can optionally relate to one listing.
One user can have many point events.

- The database is initialised from:

```bash
db/schema.sql
```

---

### Team Members

- Nirajan Sah Teli: Docker setup, GitHub Actions, repository management, README, documentation, final integration
- Aashish Gupta: Backend route logic, database queries, authentication, points, messaging, recommendations, API integration
- Pradip Oli: Pug templates, CSS styling, responsive UI, sign-in page redesign, messages interface, profile/listing page polish

## Sprint 4 Deliverables Covered

This repository supports the following Sprint 4 submission evidence:

- working MVP web application
- user login
- create listing functionality
- basic matching algorithm
- recommended matches page
- user points system
- database-backed messaging
- external API integration
- Docker environment
- GitHub Actions workflow
- MySQL schema and seeded data
- GitHub repository activity
- GitHub Project/Kanban board tracking
- meeting records
- responsive UI and final presentation screenshots

## Current Limitations

This version is an academic Sprint 4 MVP and not a full production platform. The following features could be improved in a future version:

- password security could be upgraded from simple hashing to bcrypt
- campus email verification is not fully implemented
- messaging is database-backed but not real-time
- image upload is simplified for academic demonstration
- moderation and reporting tools are not fully implemented
- user ratings are not implemented because the Sprint 4 version uses a points system instead
- advanced AI-based recommendations are not implemented
- full accessibility testing should be completed before production use

---

## License

This project is developed for academic submission purposes.

