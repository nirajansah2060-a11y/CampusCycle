# CampusCycle

CampusCycle is a database-driven campus resource sharing platform designed for students to share, borrow, swap, and discover useful academic and everyday items on campus. The application is built with **Express**, **Pug**, **MySQL**, and **Docker**, and satisfies the **Sprint 3 assessment requirements**.

## Project Overview

The aim of CampusCycle is to support a more sustainable and collaborative campus environment by allowing students to circulate textbooks, notes, lab equipment, calculators, bikes, kitchenware, and other useful items instead of purchasing new ones. The system helps reduce waste, lower student costs, and encourage peer-to-peer exchange within the university community.

This Sprint 3 version focuses on a working database-driven MVP with core user, listing, and category functionality. The project includes listings, user profiles, category browsing, detail pages, authentication-style demo screens, and a create listing workflow prototype.

## Sprint 3 Scope

This implementation covers the main Sprint 3 requirements:

- database-driven Express application
- MySQL integration
- Docker-based environment
- users list page
- user profile page
- listings page
- listing detail page
- tags/categories page
- working navigation and UI based on the Figma prototype
- seeded sample data for demonstration

## Tech Stack

- **Backend:** Node.js, Express
- **Templating Engine:** Pug
- **Database:** MySQL
- **Containerisation:** Docker, Docker Compose
- **Styling:** Custom CSS
- **Version Control:** Git and GitHub


## Setup Instructions
- Run with Docker

```bash
docker compose down -v
docker compose up --build
```

Then open:

http://localhost:3000

#### Use these demo credentials for the sign-in prototype:

- alex@campuscycle.test / admin
- sarah@campuscycle.test / admin
- marcus@campuscycle.test / admin

#### Database
The application uses a seeded MySQL database. The schema includes:

-- users
-- listings
-- tags
-- listing_tags

#### The database is initialised from:
- db/schema.sql

---

## Team Members
Replace this section with your final team details if needed.

- Nirajan Sah - Project coordination, integration, repository management
- Aashish Gupta - Backend and route logic
- Pradip Oli - Frontend templates and styling

---

### Sprint 3 Deliverables Covered
This repository supports the following Sprint 3 submission evidence:

- implemented user stories
- working database-driven MVP
- Docker environment
- MySQL schema
- GitHub repository activity
- Kanban/project tracking
- meeting records
- design implementation aligned with the Figma prototype
  
#### Current Limitations
This version is a Sprint 3 prototype and not a full production platform. The following are prototype-level features:

- sign in and account creation are demo implementations
- messaging is UI-level and not real-time
- image upload is simplified for academic demonstration
- advanced moderation and campus verification are not fully implemented

#### Future Improvements

- full authentication and authorisation
- real-time messaging
- image upload persistence
- campus email verification
- save or favourite listings
- exchange history
- moderation dashboard
- better accessibility testing
- responsive refinements for smaller devices

---
  
### Repository
```bash
https://github.com/nirajansah2060-a11y/CampusCycle
```

---

## License
This project is developed for academic submission purposes.
