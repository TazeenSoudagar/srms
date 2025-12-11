**I am planning to go on an extensive 3 months performance improvement plan to enhance my current skills in Backend- Laravel, Filament, SQL and leverage additional skills in HTML, CSS, Javascript, React js, Microservices (node.js) etc to make my way into full stack development. I have planned to build a service management application and enhance it to it's utmost stable, maintainable, and clean version, to improve learning with each step. I will be able to lean 5 days a week spending hrs as specified on each day, it might differ as per work load at the workplace. I have this below plan prepared which can be enhanced as per some additional features maybe even integrating AI or bots in the future stages.**



**below is the plan**

**3-Month PIP With a Full Application Build.**



**App: Service Request Management System (SRMS)**



**A Service Request Management System where users can raise service requests, track status, communicate via comments, attach files, and admins can handle/assign/close requests.**





**MONTH 1 - Build a Module in Backend (Laravel) and Front End (React JS)**



**Goal: A fully working backend system with all rules, APIs, and functionalities implemented.**



**WEEK 1: Project Setup \& User System**



**1. Understand the full project scope and create a high-level implementation plan covering all requirements.**



**· Create optimised ER diagram with all the relationships and references**



**· Understand the folder structure and follow the standard rules to create.**



**2. Create the basic application skeleton**



**· Set up a fresh project Repository on Git hub**



**· Organize main files and folders**



**· Make sure the app (backend and front end) runs on your local machine**



**3. Create the database tables**



**· Think through what information needs to be stored**



**· Create tables for users, roles, service requests, comments, attachments**



**· Ensure the fields make sense**



**· Follow the standard database rules for naming**



**· Think of Indexing, primary, foreign and other type of key**



**4. Create user login \& role system**



**· Create pages/APIs to allow login with security/encryption**



**· Create 3 roles:**



**1. Client**



**2. Support Engineer**



**3. Admin**



**· Make sure each role has role-based access for the screen/api (e.g., client cannot close tickets)**







**5. Create a simple user management system**



**· Add a way to create new users**



**· Add a way to assign roles**



**· Add a way to view the list of users**



**· Create API for these.**





**Reviewer checks:**



**· App runs, folder structure clean, no unused files.**



**· Tables exist, naming is clear, relationships are correctly set.**



**· Different users can log in and see only what they should see.**



**· Users create, view, edit all work.**





**WEEK 2: Learn React Fundamentals**



**Learn basics:**



**· What components are**



**· How data is passed from one part of UI to another**



**· How to handle user input**



**· How to call backend APIs**



**· How to move between screens**



**Reviewer checks: She can demonstrate simple examples of components and API calls.**





**WEEK 3: Build Main Screens and Service Request Module (Core Feature)**



**1. Build screens**



**· Login**



**· Develop screens for user creation and role assignment.**



**2. Create the “service request” feature**



**This is the main part of the app. A service request means: someone (client) needs help with something.**



**What to build:**



**· A screen/API to create a new request: client**



**· A screen/API to view all requests: Admin all requests, client and support assigned requests**



**· A screen/API to update, close or delete a request: support**



**· A screen/API to assign a request to a support engineer: admin**



**2. Add filters to find requests easily**



**Examples:**



**· By request status (Open / In Progress / Closed): all**



**· By date: all**



**· By assigned engineer:admin**



**3. Add rules to prevent wrong actions**



**Examples:**



**· Clients can't close requests**



**· Only assigned engineer can update it**



**· Admins can see all requests**



**Reviewer checks:**



**· Can create, view, update, delete, assign service requests.**



**· Filter works. List changes based on chosen filter.**



**· Unauthorized actions are blocked.**





**WEEK 4: Build screens for service request**



**Build screens:**



**· Dashboard (table of service requests)**



**· Create Request and view the created request**



**· Create an Admin view with functionality to assign pending requests to support engineers.**



**· Support Engineer Display screen and status update/close option**



**· Request Details/list of actions taken**



**Reviewer checks: Screens load cleanly and connect to backend APIs.**







**--------------------------------------------------------------------------------------------------------------**









**MONTH 2 – Advanced Features, Integration, and Finalization**





**WEEK 1: Comments, Activity Tracking \& File Attachments**



**1. Add comments to each request**



**· Clients and engineers should be able to comment**



**· Comments should show who wrote them and when**



**2. Track every important activity**



**Every important action should leave a trail:**



**· Request created**



**· Assigned to engineer**



**· Status changed**



**· Comment added**



**This will help during debugging and code review.**



**3. File upload**



**Enable attachments such as:**



**· Screenshots**



**· Documents**



**· PDFs**



**Reviewer checks:**



**· Comments appear cleanly and in order.**



**· Activity list visible in request details.**



**· File can be uploaded, downloaded, and removed safely.**





**WEEK 2: Integration \& Error Handling**



**Combine everything:**



**· Develop UI screens to integrate with the implemented APIs.**



**· Make all UI screens talk to backend**



**· Show friendly error messages**



**· Show success messages**



**· Use proper loading indicators**



**Reviewer checks: Real data flows from UI to backend and back without errors.**





**WEEK 3: Finalize Backend, Write Tests \& Cleanup**



**1. Write basic tests**



**Tests should check:**



**· Login works**



**· Creating a request works**



**· Comments work**



**· Permissions work**



**2. Prepare API documentation**



**Explain:**



**· What each API does**



**· What data it expects**



**· What it returns**



**3. Clean up code \& get it reviewed**



**· Remove unused code**



**· Add comments where needed**



**· Improve naming**



**· Organize folders properly**



**Reviewer checks:**



**· Tests run green successfully.**



**· Documentation is readable and matches the working APIs.**



**· Code looks neat, understandable, and organized.**





**WEEK 4: Improvements \& Small UI Polishing**



**· Improve arrangement of fields**



**· Add pagination**



**· Add search box**



**· Ensure basic responsiveness**



**Reviewer checks: Ensure the UI is intuitive, responsive, and user-friendly.**











**MONTH 3 - NodeJS Microservice + Final Integration**



**Goal: Add a small, separate service + finalize entire project.**



**WEEK 1: Learn NodeJS Basics**



**Understand:**



**· How a simple server works**



**· How to create routes**



**· How to return basic data**



**· How to call another service**



**Reviewer checks: She can run a simple NodeJS route and return a response.**





**WEEK 2: Build One Microservice**



**Choose ONE of these:**



**Option A: Generate a Simple Report**



**· Count requests by status (Open, Closed, etc.)**



**· Send back a summary that Laravel can display**



**Option B: Export CSV**



**· Export service requests into a downloadable CSV file**



**Option C: Notification Service**



**· A small service that receives a message and prints/logs a notification**



**Reviewer checks: Microservice runs independently and responds correctly.**





**WEEK 3: Connect Laravel to NodeJS**



**· Laravel calls the NodeJS service**



**· NodeJS sends back a result**



**· Result is shown in React (small UI section)**



**Reviewer checks: End-to-end integration works smoothly.**







**WEEK 4: Final Cleanup, Documentation, Demo**



**· Clean up all code**



**· Add a README file explaining how to run everything**



**· Prepare demo script**



**· Present the entire system to tech lead**



**Reviewer checks: Project runs perfectly following README instructions.**





**Must Have:**



**1) Setup a GitHub Board and create tasks.**



**2) Each task added in GitHub must have full description of feature/task.**



**3) Unit Test scenarios are must for each feature/module.**



**4) Must follow the best practices for PR \& APIs.**



**5)**





**FINAL DELIVERABLE AT END OF PIP**



**A complete, integrated SRMS system with:**



**· Backend: Full Laravel API system**



**· Frontend: React UI covering all major flows**



**· Microservice: NodeJS with one moderate feature**



**· Tests: Backend basic test suite**



**· Documentation: Clear and readable**



**· Code Quality: Organized, consistent, neat**



**· Evidence of learning and improvement**



**Daily Report Template (MS Teams):**



**· Date:**



**· Tasks Completed:**



**· Tasks Pending:**



**· Blockers (if any):**



**· Learnings for the Day:**



**Monthly Email Report:**



**· Summary of deliverables**



**· Skill assessment**



**· Code review metrics**



**· What improved?**



**· Next month’s improvements?**



**It can be enhanced, but following this I have created a mono-repo in github named srms with folders as srms-backend, srms-front-end, srms-node-js**



**below is the Readme which I have added to project**

**## Service Request Management System (SRMS)**



**SRMS is a full‑stack Service Request Management System built as a structured learning and performance improvement project. It allows clients to raise service requests, support engineers to work on them, and admins to manage users, roles, and overall request flow.**



**## Tech Stack**



**- \*\*Backend\*\*: Laravel (API only, PSR‑12, `declare(strict\_types=1);`, PestPHP tests), Filament for Admin panel**

**- \*\*Frontend\*\*: React + TypeScript (SPA)**

**- \*\*Microservice\*\*: Node.js + Express (reporting service)**

**- \*\*Database\*\*: MySQL**

**- \*\*Docs \& Standards\*\*: Feature-based structure, Requests/Resources, activity logging, and strict coding conventions based on the latest \[Laravel documentation](https://laravel.com/docs/12.x).**



**## Core Features (Planned)**



**- \*\*Authentication \& Roles\*\***

  **- Secure login with API tokens/sessions.**

  **- Roles: Client, Support Engineer, Admin.**

**- \*\*Service Requests\*\***

  **- Create, view, update, assign, and close requests.**

  **- Status, priority, due dates, and unique request numbers.**

**- \*\*Comments \& Attachments\*\***

  **- Threaded comments on requests with author and timestamps.**

  **- File uploads (screenshots, PDFs, documents) via polymorphic `media`.**

**- \*\*Activity Logs\*\***

  **- Central `activity\_logs` table capturing key actions (create, assign, status change, comments, etc.).**

**- \*\*Reporting Microservice\*\***

  **- Node.js service that aggregates request counts by status for dashboards.**



**## Monorepo Structure**



**- `backend/` – Laravel API project.**

**- `front-end/` – React + TypeScript SPA.**

**- `node-service/` – Node.js + Express reporting microservice.**

**- `docs/` – ERD, architecture, API docs, learning and mistakes log.**



**## Getting Started (High Level)**



**1. \*\*Clone the repo\*\***



  

   **git clone <your-repo-url> srms**

   **cd srms**

   **2. \*\*Backend (Laravel) – to be implemented\*\***



   **- Install dependencies with Composer.**

   **- Configure `.env` for MySQL.**

   **- Run migrations and seeders.**

   **- Start the Laravel development server.**



**3. \*\*Frontend (React + TS) – to be implemented\*\***



   **- Install dependencies with your package manager.**

   **- Configure API base URL.**

   **- Start the dev server.**



**4. \*\*Node Service (Express) – to be implemented\*\***



   **- Install dependencies.**

   **- Configure environment variables.**

   **- Start the microservice server.**



**Detailed step‑by‑step setup instructions will be added as each module is implemented.**



**## Development Guidelines**



**- Follow PSR‑12 and Laravel best practices with strict typing.**

**- Organize code by \*\*feature\*\* (e.g. `Users`, `ServiceRequests`, `Comments`).**

**- Every API:**

  **- Has a dedicated Request and Resource class.**

  **- Is covered by at least one Pest test.**

  **- Is documented in `docs/api/`.**

**- Capture \*\*daily learnings, mistakes, and improvements\*\* in `docs/logs/`.**



**I want you to be my mentor, guiding me with the best practices, correcting my mistakes, making me learn new things as they are updated in the specific tech stacks, I want to log the learnings, best practices followed, and lessons learnt for the daily documentations. Assume you are a full-stack developer with expertise in Laravel, Filament, PHP, SQL, React.js, HTML, CSS, JS, TS, node.js, and also best use of AI and it's utmost implementations. I want you to guide me through this entire journey of 3 months helping me become a capable full stack developer. So I want you to create this as a global rule, whatever I have mentioned in this prompt, so that I don't have ot repeat it again and again to you, I also want you to help me create daily plans to fulfill this 3 months goal. We can even finish it earlier if i complete early and take up enhancements in the remaining time. So along with creating a global rule for you for this, I also want you to document all of this, to remember and refer in the future. I have initialized a laravel project in srms-backend and also created an ER diagram for the proejct, with reference to service management system. The primary keys will be the id column in all of these tables. So suggest anything you have in mind and let's proceed with my Performance improvement plan.**

 



