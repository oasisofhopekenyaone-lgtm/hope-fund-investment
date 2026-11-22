# Hope Fund Investment deployment starter

This starter provides deposit receipt submission and administrator review only.

## Deploy
1. Upload all five files in this folder to the root of the GitHub repository.
2. In Render, select **New → Blueprint** and connect `oasisofhopekenyaone-lgtm/hope-fund-investment`.
3. Choose branch `main` and Blueprint file `render.yaml`.
4. Review the plan and apply the Blueprint.
5. Set a unique admin password of at least 16 characters in Render's Environment settings before using the admin page.

Deposit page: `/`
Admin review page: `/admin.html`

## Important limitations
This starter stores deposit submissions and allows manual verification/rejection. It does **not** credit member balances, provide investment maturity/withdrawal workflows, or certify Safaricom callbacks. Callback data is only stored for review. Do not accept public deposits until payment reconciliation, callback authenticity, access controls, audit logs, backup/restore, and security testing are implemented.
