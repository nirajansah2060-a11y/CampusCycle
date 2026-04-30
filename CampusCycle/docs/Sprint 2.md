# CampusCycle - Sprint 2 README

CampusCycle is a database-driven campus resource-sharing platform designed for students to share, borrow, swap, gift, and discover useful academic and everyday items on campus. The project follows the module theme **Sharing, Exchange and Building Community**.

Sprint 2 focused on turning the Sprint 1 idea into a clearer software plan. This included refining requirements, improving user stories, planning the database design, preparing page designs and organising the development tasks for Sprint 3.

---

## Project Overview

CampusCycle helps students reduce costs and support sustainability by allowing them to reuse resources already available within the student community. Students can share textbooks, lecture notes, calculators, lab equipment, kitchenware, bikes and other useful items.

The system is designed to encourage:

- student collaboration
- affordable access to resources
- reuse and sustainability
- community-based exchange
- easier discovery of campus items

Sprint 2 did not focus mainly on coding the final application. Instead, it focused on design, planning and preparation for implementation.

---

## Sprint 2 Scope

The Sprint 2 scope included:

- refining project requirements
- improving user stories
- identifying MVP features
- planning database structure
- preparing initial ERD design
- reviewing UI/UX direction
- planning Pug page templates
- preparing routes for Express
- creating a development task breakdown
- updating GitHub Project/Kanban board
- preparing the team for Sprint 3 coding

---

## Sprint 2 Objectives

The main objectives of Sprint 2 were:

1. Confirm the final MVP direction.
2. Convert the Sprint 1 idea into clearer technical requirements.
3. Define the main database entities and relationships.
4. Prepare page and route planning.
5. Allocate development responsibilities.
6. Prepare the GitHub Project board for implementation.
7. Ensure the project was ready for Sprint 3 development.

---

## Refined User Stories

### Browse Listings

As a student, I want to browse available campus resources so that I can find items I need for study or daily life.

### View Listing Details

As a student, I want to view detailed information about a listing so that I can decide whether to request it.

### View User Profiles

As a student, I want to view the profile of the item owner so that I can understand who is sharing the resource.

### Browse Categories

As a student, I want to browse by category or tag so that I can quickly find relevant items.

### Create a Listing

As a logged-in student, I want to create a listing so that I can share, lend, swap or gift an item.

### Send a Message

As a logged-in student, I want to message another student about an item so that I can arrange collection or ask questions.

### Receive Recommendations

As a logged-in student, I want to see recommended resources so that I can discover relevant items more easily.

### Earn Points

As a student, I want to earn points for useful activity so that my contribution to the community is visible.

---

## Planned MVP Features

The Sprint 2 planned MVP included:

- home page
- browse listings page
- listing detail page
- users list page
- user profile page
- tags/categories page
- sign-in page
- sign-up page
- create listing page
- basic messaging
- basic matching/recommendations
- points system
- responsive interface
- MySQL database
- Docker development environment

---

## Planned Database Design

The Sprint 2 database design included the following main tables:

### users

Stores student account and profile information.

Planned fields:

- id
- name
- email
- password_hash
- department
- bio
- avatar_url
- badge_label
- points
- joined_label
- created_at

### listings

Stores resources shared by students.

Planned fields:

- id
- owner_id
- primary_tag_id
- title
- description
- exchange_type
- price
- condition_label
- status
- location
- response_note
- cover_image_url
- created_at

### tags

Stores categories and searchable tags.

Planned fields:

- id
- name
- slug
- description
- icon_label
- accent_color

### listing_tags

Stores the many-to-many relationship between listings and tags.

Planned fields:

- listing_id
- tag_id

### listing_images

Stores extra images for listings.

Planned fields:

- id
- listing_id
- image_url
- sort_order

### messages

Stores messages between students.

Planned fields:

- id
- sender_id
- receiver_id
- listing_id
- body
- created_at

### point_events

Stores points activity history.

Planned fields:

- id
- user_id
- event_type
- points_awarded
- description
- created_at

---

## Planned Database Relationships

The planned database relationships were:

- one user can create many listings
- one listing belongs to one user
- one tag can be the primary category for many listings
- one listing can have many tags
- one tag can belong to many listings
- one listing can have many images
- one user can send many messages
- one user can receive many messages
- one message can optionally relate to one listing
- one user can have many point events

---

## Planned Routes

The planned Express routes were:

```bash
GET /
GET /items
GET /items/:id
GET /items/new
POST /items/new
GET /users
GET /users/:id
GET /tags
GET /tags/:id/items
GET /signin
POST /signin
GET /signup
POST /signup
POST /signout
GET /messages
POST /messages
GET /recommendations
GET /health
GET /api/weather
```

---

## Planned Page Templates

The planned Pug templates included:

```bash
layout.pug
index.pug
items.pug
item-detail.pug
users.pug
profile.pug
tags.pug
tag-items.pug
signin.pug
signup.pug
create-listing.pug
messages.pug
recommendations.pug
404.pug
includes/mixins.pug
```
---

## Sprint 2 Deliverables

- refined user stories
- MVP feature list
- route planning
- database design
- ERD planning
- page/template planning
- GitHub Project task planning
- team responsibility allocation
- meeting records
- preparation for Sprint 3 implementation

---

## Next Sprint Plan

In Sprint 3, the team planned to start application development using:

```bash
Express
Pug
MySQL
Docker
```

The Sprint 3 implementation was expected to include the minimum required database-driven pages:

- users list page
- user profile page
- listings page
- listing detail page
- tags/categories page

---
