# Hope Fund Investment deposit starter

This is a runnable Node/Express deposit-submission app with SQLite storage, receipt duplicate protection, a pending deposit review API, and a Daraja C2B v2 confirmation endpoint.


## Start locally
1. Install Node.js 18+.
2. Copy `.env.example` to `.env` and set a long unique `ADMIN_PASSWORD` (also set variables in your shell or use dotenv if desired).
3. Run `npm install`, then `ADMIN_PASSWORD='your-long-password' npm start`.
4. Open http://localhost:3000.


## Admin APIs
- `GET /api/admin/deposits` with header `x-admin-password: YOUR_PASSWORD`
- `POST /api/admin/deposits/:id/verify` with same header
- `POST /api/admin/deposits/:id/reject` with same header


## Safaricom callback
After deploying to a public HTTPS host, register the C2B Confirmation URL `https://YOUR_DOMAIN/api/daraja/c2b/confirmation` and a validation endpoint if external validation is enabled for your shortcode. This sample callback stores confirmed callback receipts. Production needs robust webhook authenticity strategy, account-reference reconciliation, audit logs, rate limiting, admin UI, HTTPS hosting, backups, and security review. The callback currently uses account reference `47715` as default and does not post deposits into member balances. Do not accept real public deposits until deployment and verification controls are complete.


## Administrator identity
The displayed administrator name is **Elias Wandimi Mathenge**. Admin actions are currently password-protected; this name is a display identity and is not a separate username-based login.
