# Security Notes

## JWT rotation
- Store the active JWT secret only in environment variables, not in git.
- Rotate `server/.env` and hosting secrets together, then restart the API.
- Keep the previous secret active only for a short grace period if your deployment supports dual secrets.

## Production hardening
- Set `NODE_ENV=production`.
- Set `CLIENT_ORIGIN` to the exact frontend origin.
- Keep `server/.env` out of version control.
- Enable CI checks for build and dependency auditing.
- Review `npm audit` output regularly and rotate any exposed secrets immediately.

## Secret scanning
- Run `gitleaks detect --no-banner --source .` before merging sensitive changes.
- If a secret ever enters git history, remove it from history and rotate the secret right away.
