# IPT 2026 Backend API

Node.js + Express + MySQL backend for the Angular Authentication System.

## Requirements
- Node.js 18+
- XAMPP (for local MySQL)

## Setup

1. **Start XAMPP** → start Apache and MySQL

2. **Create the database** in phpMyAdmin (http://localhost/phpmyadmin):
   - Click "New" → Database name: `ipt2026_db` → Create

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Configure environment** — `.env` is already set up for XAMPP defaults.
   Edit if your MySQL has a password.

5. **Start the server**:
   ```bash
   npm start
   ```

6. **Verify it's running**:
   - API: http://localhost:4000
   - Swagger Docs: http://localhost:4000/api-docs

## Email Verification (Development)
When no SMTP credentials are set, the app uses **Ethereal** (fake SMTP).
Check the terminal console for a preview URL like:
```
📧 Preview URL: https://ethereal.email/message/...
```
Open that URL to see the verification email.

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /accounts/authenticate | Login |
| POST | /accounts/register | Register |
| POST | /accounts/verify-email | Verify email |
| POST | /accounts/refresh-token | Refresh JWT |
| POST | /accounts/revoke-token | Logout |
| POST | /accounts/forgot-password | Request password reset |
| POST | /accounts/validate-reset-token | Validate reset token |
| POST | /accounts/reset-password | Reset password |
| GET | /accounts/ | Get all accounts (Admin) |
| GET | /accounts/:id | Get account by ID |
| POST | /accounts | Create account (Admin) |
| PUT | /accounts/:id | Update account |
| DELETE | /accounts/:id | Delete account (Admin) |
