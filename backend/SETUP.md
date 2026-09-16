# Enable the OpenAI portfolio assistant

The frontend is updated. The backend source and offline tests are ready. **Live LLM responses are not activated:** no API key, Cloudflare account, D1 database, or Turnstile credentials have been supplied, and no paid API calls have been tested. Until configuration is complete, the panel honestly says the assistant is unavailable and links to the résumé and projects.

The portfolio remains on GitHub Pages at `https://pradeepm18.github.io`. A separate Cloudflare Worker handles `/status` and `/chat`, keeps credentials private, and stores usage counters in D1. GitHub Pages alone cannot run the backend. Use the Cloudflare Free plan/allowances where available; hosting limits and any separate charges are outside the API allowance below.

## 1. Fund your own OpenAI API account

Go to https://platform.openai.com/settings/organization/billing/overview and start with $5 of credit. Turn automatic recharge off. Use a dedicated API project/key for this chatbot. Configure provider spending controls as an additional safeguard and include taxes/card charges in your $10 total monthly budget. Do not paste keys into chat or into the website files.

This backend pins `gpt-4.1-mini-2025-04-14`. Its documented standard rates checked on 2026-09-16 were $0.40 per million input tokens and $1.60 per million output tokens. Recheck pricing before activation and whenever changing the model.

## 2. Create the backend database

Install Node.js 24. In a terminal, enter this `backend` folder and run:

```sh
npx --yes wrangler@4.132.0 login
npx --yes wrangler@4.132.0 d1 create pradeep-portfolio-chat
```

Copy the returned database ID into `wrangler.jsonc`, replacing `REPLACE_WITH_CREATED_D1_DATABASE_ID`. This ID is not a secret. Keep `DB` as the binding name.

```sh
npx --yes wrangler@4.132.0 d1 migrations apply pradeep-portfolio-chat --remote
npx --yes wrangler@4.132.0 deploy
```

Save the real HTTPS Worker URL printed by deployment. Do not use a guessed URL. The backend stays unavailable until all secrets are configured.

## 3. Set up bot verification and backend secrets

Create a managed Turnstile widget in the Cloudflare dashboard. Allow these exact hostnames:

- `pradeepm18.github.io`
- `pradeep-muniasamy.pradeepm1899.chatgpt.site` (only if you also want the ChatGPT-hosted copy to call your backend)

The widget's **site key is public**. Its **secret key is private**. The backend verifies the token, the hostname matching the request's allowed origin, and action `portfolio-chat`. Leave verification enabled in production.

Store secrets using these commands, entering each value at the secure prompt:

```sh
npx --yes wrangler@4.132.0 secret put OPENAI_API_KEY
npx --yes wrangler@4.132.0 secret put TURNSTILE_SECRET_KEY
npx --yes wrangler@4.132.0 secret put RATE_LIMIT_SALT
```

For `RATE_LIMIT_SALT`, generate a random value of at least 32 characters with your password manager. Keep it stable; rotating it resets the per-IP identity for rate counters, though the global monthly allowance remains intact. Secrets are stored by the backend platform, not in the repository. The key is never sent to the model in its prompt.

## 4. Connect your website

Edit the PUBLIC `chat-config.js` in the website root:

```js
window.PORTFOLIO_CHAT_CONFIG = Object.freeze({
  apiBase: "YOUR_ACTUAL_HTTPS_WORKER_URL",
  turnstileSiteKey: "YOUR_PUBLIC_TURNSTILE_SITE_KEY"
});
```

Use the Worker origin without `/chat` or a trailing slash. These are public configuration values, not API credentials. Upload the updated website files to your GitHub Pages repository root and wait for publication. The hosted Sites copy also needs these same two public values to activate; share only those values if you want help updating it.

Open the assistant, complete verification, and ask “Did he work at LatentView Analytics?”. Verify an answer and source link. Requests beyond the allowance should show a limit message. Paid answer quality and real Turnstile integration still need this activation check.

## Optional: deploy through GitHub Secrets

Direct setup above is sufficient. For GitHub Actions deployment, copy `github-actions/deploy-chat.yml` to `.github/workflows/deploy-chat.yml` in the repository. Keep the `backend` folder at the repository root.

In GitHub, create an environment named **portfolio-chat** under Settings → Environments. Restrict its deployment branch to `main`; adding required reviewers is recommended if supported by your plan.

Under Settings → Secrets and variables → Actions (or the environment's secrets), add:

| Secret | Value |
|---|---|
| `OPENAI_API_KEY` | Dedicated project key |
| `TURNSTILE_SECRET_KEY` | Private widget secret |
| `RATE_LIMIT_SALT` | Random value of 32+ characters |
| `CLOUDFLARE_API_TOKEN` | Account-scoped token with Workers Scripts Edit and D1 Edit, limited to your account |

Add these Actions **variables**:

| Variable | Value |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `D1_DATABASE_ID` | ID from step 2 |

Run **Actions → Deploy portfolio chat backend → Run workflow** on `main`. This manual workflow deploys code, applies the migration, and transfers the three application secrets to Worker secret storage. It never substitutes secrets into JavaScript or creates a public artifact containing them. GitHub Secrets alone do not protect values embedded in a static build. Only trusted maintainers should be able to change/run deployment workflows. Do not run this workflow on untrusted PR code, print secrets, or upload the temporary secret file.

## Implemented controls

- Five admitted model requests per IP per rolling minute; 30 per IP per UTC day.
- 200 model requests across the entire site per UTC day.
- A conservative **$5 monthly reservation allowance**, equivalent to at most **500 attempted model requests**. Reserves $0.01 in D1 before each call, including refused model answers and uncertain failures. This is a conservative reservation policy, not a display of actual billed spend.
- Each paid request has a serialized payload limit of 16,000 UTF-8 bytes, a fixed model, no tools, no conversation history, and at most 300 output tokens. At the checked model rates, the reservation intentionally exceeds the bounded text cost with headroom. Changing these constraints or provider pricing requires reviewing the allowance. Charges for other keys, taxes, and hosting are not included.
- One atomic database statement checks all limits and reserves allowance; parallel visitors cannot bypass the check by racing. Counters are durable rather than browser-based or per-server memory. If the database fails, no model call is made.
- Twenty challenge attempts per IP per rolling minute before Turnstile, plus token/hostname/action verification before the paid-request reservation. CORS restricts browser origins but is not treated as authentication.
- Questions limited to 500 characters; body reads limited to 4 KB; fixed output format; approved citation links; rendered text never inserted as HTML.
- Only the approved public facts in `public-profile.mjs` go to OpenAI. No private chats, credentials, browsing, or internal files are available to the model. Prompt constraints reduce off-topic answers but cannot guarantee perfect grounding or prevent every off-topic response.
- API responses are requested with `store:false`. The application does not store questions or answers. OpenAI/Cloudflare may retain data under their own policies; this is not a claim of zero provider retention. D1 stores timestamps, reservation amounts, and monthly HMAC-pseudonymized IP identifiers. Old counters are deleted by a daily scheduled task.
- Upstream errors are replaced with generic messages. No automatic API retries. Missing secrets or incomplete setup fail closed. Removing the API secret or blanking `apiBase` disables the assistant.

## Tests and scope of verification

From the repository root with Node.js 24:

```sh
node --test backend/tests/worker.test.mjs
```

Fifteen offline tests cover scope filtering, missing secrets, origin checks, request sizes, challenge checks, approved sources, concurrent reservations, daily/monthly limits, UTC month rollover, and database/provider failures. They use SQLite for the real reservation SQL and mock the external providers. **No live API call, Cloudflare deployment, or paid end-to-end test has run.**

## References

- OpenAI model and prices: https://developers.openai.com/api/docs/models/gpt-4.1-mini
- OpenAI secret handling: https://developers.openai.com/api/reference/overview#authentication
- OpenAI spend controls: https://developers.openai.com/api/docs/guides/spend-limits
- Cloudflare Worker secrets: https://developers.cloudflare.com/workers/configuration/secrets/
- Cloudflare D1: https://developers.cloudflare.com/d1/get-started/
- Turnstile server validation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- GitHub Actions secrets: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets
