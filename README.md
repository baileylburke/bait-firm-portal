# BAIT Firm Portal

A web portal for accounting firms using [BAIT](https://bait.tax) tax software. CSCI 3330 Exam 2 project. Firms can buy licenses, download releases, and submit support tickets.

## Setup

```bash
npm install
npm start
```

Open http://localhost:3000.

## Layout

```
public/        static content: css, images, and browser js
views/         EJS pages
  partials/    header, navigation, and footer shared by every page
routes/        URL to controller mapping
controllers/   receive requests, return responses
middleware/    request processing, security, and error handling
services/      business rules
server.js      application entry point
```

Uses Node.js, Express, and EJS.
