# CampusCycle Meeting Notes

This document records the team meetings held during the development of the CampusCycle project, especially for Sprint 3 planning, implementation, and refinement.

---

## Meeting 1 - Sprint 3 Planning and Scope Confirmation

**Date:** [Add actual date]  
**Time:** [Add actual time]  
**Mode:** Online / In person  
**Attendees:** Nirajan Sah, Aashish Gupta, Pradip Oli

### Agenda
- review Sprint 1 and Sprint 2 completed work
- confirm Sprint 3 assessment requirements
- identify mandatory database-driven pages
- divide development tasks among team members
- confirm technology stack and implementation plan

### Discussion Summary
The team reviewed the assessment brief and confirmed that Sprint 3 must deliver a working database-driven application using Express, Pug, MySQL, and Docker. The minimum required pages identified were the listings page, listing detail page, users page, user profile page, and categories or tags page. The team also agreed that the UI should reflect the supplied Figma prototype as closely as possible while keeping the project scope manageable for academic submission.

The team discussed the current state of the repository and recognised the need to clean up the folder structure, organise routes properly, and extend the database beyond the earlier scaffold. It was agreed that the app should demonstrate realistic seeded sample data to support screenshots and final evaluation.

### Decisions Made
- keep Express, Pug, MySQL, and Docker as the core stack
- implement all required Sprint 3 pages first
- add categories and tags as part of the browsing experience
- align page layouts and components to the Figma design
- prepare the repository so all members can contribute visibly

### Task Allocation
- **Nirajan Sah:** repository setup, Docker integration, schema refinement, final merge
- **Aashish Gupta:** route handling, database queries, backend logic
- **Pradip Oli:** Pug templates, CSS styling, UI alignment to Figma

### Action Items
- refine project structure
- prepare updated schema and sample data
- start implementation of the required routes
- begin translating Figma screens into reusable layouts

---

## Meeting 2 - UI Review and Figma Alignment

**Date:** [Add actual date]  
**Time:** [Add actual time]  
**Mode:** Online / In person  
**Attendees:** Nirajan Sah, Aashish Gupta, Pradip Oli

### Agenda
- review current MVP interface
- compare implemented screens with Figma prototype
- identify mismatches in layout, styling, and page flow
- finalise image placement approach for listings and profiles

### Discussion Summary
The team reviewed the first working version of the Sprint 3 application and compared it against the provided Figma prototype screens. While the core navigation and layout were functional, several improvements were identified to better match the design language. The team agreed that the homepage, browse listings page, categories page, user profile page, and community members page all needed to reflect the lighter Figma-based styling more closely.

The team also identified an issue with broken icon or emoji rendering in an earlier version and agreed to replace those elements with cleaner category labels and image-based presentation where necessary. Additional attention was given to listing cards, hero sections, search bars, profile blocks, category cards, and spacing.

The group discussed how item and user profile images would be added. It was agreed that PNG files would be placed in dedicated uploads folders so that placeholder images could easily be replaced later without changing the full structure of the app.

### Decisions Made
- move the visual direction closer to the Figma prototype
- use a lighter interface where required by the design
- create dedicated uploads folders for item and profile images
- keep placeholders until final PNG assets are collected
- maintain Sprint 3 assessment scope while improving presentation quality

### Task Allocation
- **Nirajan Sah:** update repo structure and ensure final version runs in Docker
- **Aashish Gupta:** ensure all routes and seeded data work with the redesigned pages
- **Pradip Oli:** refine layout, colours, typography, cards, and profile screens

### Action Items
- restyle homepage and listings page
- align categories page with Figma cards and tag chips
- improve user profile and community members pages
- document image placement in the repository
- test all navigation links after UI changes

---

## Meeting 3 - Integration, Testing, and Submission Preparation

**Date:** [Add actual date]  
**Time:** [Add actual time]  
**Mode:** Online / In person  
**Attendees:** Nirajan Sah, Aashish Gupta, Pradip Oli

### Agenda
- test all implemented routes
- review seeded data and image placeholders
- confirm Docker execution
- prepare repository and evidence for Sprint 3 submission
- discuss final screenshots and report material

### Discussion Summary
The team tested the main pages of the application, including the home page, listings page, listing detail page, users page, user profile page, tags page, sign-in page, sign-up page, create listing page, and health route. The team confirmed that the essential Sprint 3 deliverables were present and that the application could be demonstrated locally using Docker.

A port conflict was encountered during Docker startup because MySQL port 3306 was already in use on the local machine. The team resolved this by removing the host-side 3306 binding from the database service since the application connects to MySQL internally through Docker networking.

The team also reviewed repository readiness for submission evidence, including screenshots of the Kanban board, contribution history, page outputs, and meeting records. It was agreed that placeholder PNG images would be gradually replaced with better visuals downloaded from the web to match the prototype more closely.

### Decisions Made
- final Docker configuration should avoid host binding conflicts where unnecessary
- repository should include meeting notes and image placement documentation
- screenshots should be taken after replacing key placeholder images
- the final README should clearly explain the project and setup steps

### Task Allocation
- **Nirajan Sah:** final repo cleanup, README, meeting notes, push latest code
- **Aashish Gupta:** final route testing and data validation
- **Pradip Oli:** final UI polish and image replacement support

### Action Items
- update README with setup and feature details
- add meeting notes into `docs/`
- replace placeholder PNG files with final visuals
- capture screenshots for Sprint 3 PDF evidence
- confirm all team members have visible GitHub contributions

---

## Meeting 4 - Final Review Before Submission

**Date:** [Add actual date]  
**Time:** [Add actual time]  
**Mode:** Online / In person  
**Attendees:** Nirajan Sah, Aashish Gupta, Pradip Oli

### Agenda
- perform final walkthrough of the app
- check visual consistency across all pages
- verify assessment requirement coverage
- confirm materials needed for Sprint 3 submission PDF

### Discussion Summary
The team carried out a final walkthrough of the project and checked whether all Sprint 3 requirements were clearly covered. Particular attention was given to the five main required database-driven page types: listings page, listing detail page, users page, user profile page, and tags/categories page. The team also confirmed that additional pages such as sign-in, sign-up, messages, and create listing improve the prototype quality without reducing focus on the core assessment requirements.

The team agreed that the final repository should demonstrate both technical functionality and stronger design quality. The group also confirmed that screenshots would be captured from the final interface and that contribution evidence from GitHub would be included in the submission.

### Decisions Made
- keep the final repo focused, clear, and submission-ready
- ensure the five required Sprint 3 page types are easy to demonstrate
- include repo screenshots, Kanban evidence, and meeting records in the PDF
- use the README to show professional documentation quality

### Final Outcome
The team confirmed that the CampusCycle Sprint 3 implementation is suitable for demonstration and repository submission, subject to the final replacement of selected placeholder images and final PDF evidence preparation.

---

## Notes

- Replace all bracketed date and time fields with your actual meeting details.
- Add lecturer, tutorial, or module references if your tutor expects them.
- If you had more meetings, continue this same format.
