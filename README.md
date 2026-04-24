# SwollenHippo Coffee - Employee Time Clock

A production-ready employee time clock app built with Node.js, Express, MariaDB, Bootstrap 5, and vanilla JavaScript.

## Stack
- Frontend: HTML, CSS, Bootstrap 5, Vanilla JavaScript
- Backend: Node.js + Express
- Database: MariaDB with `mysql2/promise`
- Auth: PIN-based login with bcrypt hash verification
- API: RESTful JSON

## Project Structure
- `/routes`
- `/controllers`
- `/db`
- `/middleware`
- `/public`

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
3. Initialize MariaDB schema:
   ```bash
   mysql -u <user> -p < db/schema.sql
   ```
4. Create an admin user with bcrypt hash (see `db/schema.sql` comments).
5. Start server:
   ```bash
   npm run dev
   ```
6. Open:
   `http://localhost:3000`

## API Endpoints

### Auth
- `POST /api/auth/login`
  - Body: `{ "pin": "1234" }`
- `GET /api/auth/me`

### Time
- `POST /api/time/toggle`
- `GET /api/time/me`
- `GET /api/time/status`

### Admin
- `POST /api/admin/employees`
- `GET /api/admin/employees`
- `GET /api/admin/entries`

> All protected routes require `Authorization: Bearer <token>`.

## Response Shape
```json
{
  "success": true,
  "message": "text",
  "data": []
}
```
