# CampusCycle

CampusCycle is a database-driven campus resource sharing platform designed for students to share, borrow, swap, and discover useful academic and everyday items on campus. The application is built with **Express**, **Pug**, **MySQL**, and **Docker**, and its interface is aligned closely with the supplied **Figma prototype** while still satisfying the **Sprint 3 assessment requirements**.

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
- Option 1: Run with Docker

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
- The application uses a seeded MySQL database. The schema includes:
-- users
-- listings
-- tags
-- listing_tags

#### The database is initialised from:
- db/schema.sql
