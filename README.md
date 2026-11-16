# BAIT Firm Portal

A web portal for accounting firms using [BAIT](https://bait.tax) tax software. CSCI 3330 Exam 2 project. Firms can buy licenses, download releases, and submit support tickets.

## Setup

```bash
npm install
npm start
```

Open http://localhost:3000.

## Demo administrator

The Admin page is restricted to administrators. `services/dataStore.js` creates a demo administrator account:

| | |
|---|---|
| Email | `admin@bait.tax` |
| Password | `bait-admin-demo` |

Sign in at http://localhost:3000/sign-in to access **Admin**.

These credentials are for local demos only. Set `ADMIN_PASSWORD` to change the password. In Bash:

```bash
ADMIN_PASSWORD="another password" npm start
```

To populate the Admin page, register a firm, choose a plan, and file a support ticket. Then sign out and sign in as the administrator. Records reset when the server restarts.

## Layout

```
public/        static content: css, images, and browser js
views/         EJS pages
  partials/    header, navigation, and footer shared by every page
routes/        URL to controller mapping
controllers/   receive requests, return responses
middleware/    request processing, security, and error handling
services/      business rules
downloads/     placeholder build files; sent only by the download route
server.js      application entry point
```

Uses Node.js, Express, and EJS.
