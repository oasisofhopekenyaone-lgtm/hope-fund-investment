# Deploy Hope Fund deposit app

This package can be deployed to Render, but a user-owned Render account and domain/HTTPS are required. I cannot publish to an account without authorized access.

## Render manual deploy
1. Upload this folder to a GitHub repository (private recommended).
2. In Render, choose **New > Blueprint** and select the repo containing `render.yaml`.
3. Render will provision the Node service, persistent disk, and a generated admin password environment variable. After creation, set `ADMIN_PASSWORD` to a unique password of at least 16 characters.
4. Open the service URL. Deposit page is `/`; admin review page is `/admin`.
5. Keep the service URL and admin password private; rotate the password before use.

## Payment status caution
The C2B callback endpoint stores callback payloads, but this starter has not been production-certified. It does not verify Safaricom callbacks cryptographically, reconcile the callback account reference against members, or credit a member ledger. Do not treat a callback or receipt submission as sufficient to release/credit funds until those safeguards are implemented and tested. The member receipt submission is pending manual verification.
