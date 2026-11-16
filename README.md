# BAIT Firm Portal

A web portal for accounting firms using [BAIT](https://bait.tax) tax software. CSCI 3330 Exam 2 project. Firms can buy licenses, download releases, and submit support tickets. Administrators can view accounts and licenses and update ticket status.

Uses Node.js, Express 5, and EJS. Data is stored in memory and resets to the seed data on restart.

## Setup

Requires Node.js 20 or later.

```bash
npm install
npm start
```

Open http://localhost:3000. Set `PORT` to use a different port.

## Pages

| Page | URL | Access |
|---|---|---|
| Home | `/` | everyone |
| Plans | `/plans` | everyone; signed-in firms can view prices and choose a plan |
| Releases | `/releases` | everyone; only a firm with an active license can download |
| Support | `/support` | a signed-in account |
| My Account | `/account` | a signed-in account |
| Admin | `/admin` | the administrator |
| Register, Sign in | `/register`, `/sign-in` | everyone |

Pages share the header, navigation, and footer in `views/partials/`. Account links depend on the signed-in user.

## Business requirements

| # | Requirement | Files |
|---|---|---|
| 1 | A firm registers with a name, email, password, and preparer count. Sign-in uses email and password. | `services/firmService.js` (rules, password hash through `services/passwords.js`), `controllers/authController.js`, `routes/authRoutes.js`, `middleware/session.js`, `middleware/auth.js`, `views/register.ejs`, `views/sign-in.ejs` |
| 2 | A firm can choose one active license plan. Plans have a price per preparer and a seat limit. | `services/licenseService.js`, `controllers/planController.js`, `routes/planRoutes.js`, `views/plans.ejs`; the preparer count and the license history are on My Account (`controllers/accountController.js`, `views/account.ejs`) |
| 3 | Everyone can read the release notes. Only a firm with an active license can download a build. | `services/releaseService.js`, `controllers/releaseController.js`, `routes/releaseRoutes.js`, `views/releases.ejs`, `downloads/` |
| 4 | A firm can submit and track its own bug reports or change requests. Each ticket has a type, return type, form, and description. | `services/ticketService.js`, `controllers/supportController.js`, `routes/supportRoutes.js`, `views/support.ejs` |
| 5 | The administrator can view all firms, licenses, and tickets. Tickets move from Open to In progress to Shipped. Shipped tickets require a published release. | `services/adminService.js`, `ticketService.moveTicket`, `controllers/adminController.js`, `routes/adminRoutes.js`, the `requireAdmin` guard in `middleware/auth.js`, `views/admin.ejs` |

## Data objects

The classes are in `services/objects/`. `services/dataStore.js` holds the collections in memory.

| Object | Fields | Created or updated by |
|---|---|---|
| `Firm` | firmId, name, email, passwordHash, preparerCount, role | the Register form (`firmService.registerFirm`); the preparer form on My Account |
| `Plan` | planId, name, seatLimit, pricePerSeat, returnTypes, efileIncluded | seed data (Solo, Practice, and Enterprise); `Plan.priceFor` calculates prices and `Plan.hasRoomFor` checks seat limits |
| `License` | licenseId, firmId, planId, startDate, expiresOn, status | `licenseService.choosePlan`: a new license starts and the old one expires |
| `Release` | version, releaseDate, notes, returnTypesAdded, downloadFile | seed data; read by the Releases page and by the Shipped rule |
| `Ticket` | ticketId, firmId, type, returnType, form, description, status, createdOn, shippedIn | the Support form (`ticketService.fileTicket`); `ticketService.moveTicket` changes the status |

The Register form creates a `Firm`; the Support form creates a `Ticket`.

## Layout

```
public/        static content: css, images, and browser js
views/         EJS pages
  partials/    header, navigation, and footer shared by every page
routes/        URL to controller mapping
controllers/   receive requests, return responses
middleware/    request processing, security, and error handling
services/      business rules
  objects/     the five classes
downloads/     placeholder build files; sent only by the download route
server.js      application entry point
```

Routes, controllers, views, and services are separate. Data objects and storage are in `services/`.

- **Routes** connect URLs to controllers and run access checks and validation.
- **Controllers** call services and return pages or redirects. Errors go to `next(err)` through `try`/`catch`.
- **Services** check business rules and return results. Unexpected errors are thrown.
- **Middleware**: `security.js` (Helmet headers and a Content Security Policy), `session.js` (the session cookie and one-time messages), `auth.js` (`requireSignIn`, `requireAdmin`), `validate.js` (form field checks), `requestLogger.js`, and `errorHandlers.js` (the 404 page and the central error handler).

## Demo accounts

### Administrator

`services/dataStore.js` creates a demo administrator account:

| | |
|---|---|
| Email | `admin@bait.tax` |
| Password | `bait-admin-demo` |

Sign in at http://localhost:3000/sign-in to access **Admin**.

These credentials are for local demos only. Set `ADMIN_PASSWORD` to change the password. In Bash:

```bash
ADMIN_PASSWORD="another password" npm start
```

### Firm

Use **Register** to create a firm account with a name, valid email address, password of at least 8 characters, and preparer count. No email is sent. Accounts reset on restart.

## Walkthrough

1. Open Plans and Releases as a visitor. Personalized prices and downloads require sign in.
2. Register a firm with 4 preparers. The Plans page now shows your price; the Solo plan (1 seat) is not available.
3. Choose the Practice plan. Open Releases and download a build (downloads are text placeholders for installers).
4. Open Support and file a ticket. Open My Account to see the license, the license history, and the ticket. Try to set 11 preparers: the Practice plan has 10 seats, so the app refuses.
5. Sign out. Sign in as the demo administrator and open Admin. Select **Start work** on the ticket, then choose a release and select **Mark shipped**.
6. Sign in as the firm again. Support shows the ticket as Shipped with its release.

## Security notes

- Passwords are stored as salted scrypt hashes.
- The session cookie uses `httpOnly` and `SameSite=Lax`. Sign-in and sign-out create a new session ID.
- Helmet sets security headers. Scripts and styles load only from this site.
- The server validates form fields. EJS escapes user values.
- A firm sees only its own license and tickets. Download and Admin routes enforce access checks on the server.
