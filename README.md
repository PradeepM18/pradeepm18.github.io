# Pradeep Muniasamy — career portfolio

A self-contained, responsive portfolio for Pradeep Muniasamy, Applied Scientist 3 at Glance. The website uses plain HTML, CSS, and JavaScript. It needs no build tools, API keys, paid services, or backend.

## Publish on GitHub Pages for free

These steps use the GitHub account from your résumé: `PradeepM18`.

1. Sign in to GitHub and create a **public** repository named **`pradeepm18.github.io`**. If this repository already hosts a site, back up that site before replacing its files.
2. Unzip `Pradeep-Muniasamy-Portfolio.zip` on your device.
3. Upload the **contents** of the extracted folder to the repository. `index.html`, `styles.css`, `script.js`, and the `assets` folder must sit at the repository root. Do not upload just the ZIP or put the website inside another folder. Keep the included `.nojekyll` file if your file picker shows it.
4. Commit the files to the `main` branch.
5. Open **Settings → Pages → Build and deployment**. Set **Source** to **Deploy from a branch**, choose **main** and **/(root)**, then select **Save**.
6. Once GitHub finishes deploying, use **Visit site** on the Pages settings screen. Your address will be **https://pradeepm18.github.io/**. The first deployment can take several minutes.

You can also use a different repository name, such as `portfolio`. The relative asset paths work at `https://pradeepm18.github.io/portfolio/` too; select the same branch/root publishing settings.

Official guides: [Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) and [Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Open and edit locally

Open `index.html` in a browser. Navigation, expandable project details, images, article links, and the résumé link work without a server.

| File | What to edit |
| --- | --- |
| `index.html` | Name, current role, projects, papers, Medium articles, experience, and contact links |
| `styles.css` | Colors, typography, spacing, image framing, and responsive layouts |
| `script.js` | Mobile menu and footer year |
| `assets/Pradeep-Muniasamy-Resume.pdf` | Downloadable résumé |
| `assets/pradeep-portrait.jpg` | Main portrait |
| `assets/cods-best-paper.jpg` | CODS 2025 Best Paper award photo |
| `assets/umap-poster.jpg` | UMAP 2026 presentation photo |

The working Sites checkout keeps the web files under `dist/`. The downloadable ZIP places those same files at its root so GitHub Pages can serve them directly.

## Content notes

- Current title is **Applied Scientist 3** from January 2026. User-profile, weak-supervision, and conversational-memory work sits under this role; visual product search sits under Machine Learning Engineer 3 (January 2025–December 2025).
- The downloadable PDF updates the current title to Applied Scientist 3, beginning January 2026, and labels product-search work under MLE 3 (January–December 2025). Project metrics are preserved. Selected work and experience appear newest first; the separate hero metrics strip is omitted.
- Four authored Medium articles are linked. The LookSync article is published through Glance's Medium publication at `engg.glance.com`. Articles are linked, not republished.
- UMAP 2026: **Cross-Domain Cold-Start Personalization via LLM-Synthesized Structured User Profiles**, DOI `10.1145/3774935.3807905`.
- CODS 2025: **LookSync: Large-Scale Visual Product Search System for AI-Generated Fashion Looks**, arXiv `2511.00072`; Best Paper in the Demo Track, as stated in the résumé and the author's published article.
- Scale and accuracy figures are from the supplied résumé and cited published work. The 18M+ catalog figure is also stated in the February 2026 LookSync article; the older arXiv study describes 12M+.
- Unpublished paper drafts, internal service names, personal financial details, and private account information are not included.
- The UMAP and CODS conference photos are the supplied originals. CSS controls their on-page framing; the image files are unchanged. There are no trackers, external font dependencies, or contact form services.

## Add another Medium article

In `index.html`, locate the `writing-list` element. Copy one complete `writing-row` link, replace its destination, title, category, and short description, and adjust the visible number. Commit the change to update your GitHub Pages site. The article list is curated rather than fetched live.

## Sources

- Supplied `Pradeep_M_Resume_.pdf` and the current Applied Scientist 3 title provided for this portfolio.
- [LookSync paper](https://arxiv.org/abs/2511.00072)
- [UMAP paper](https://dl.acm.org/doi/10.1145/3774935.3807905)
- [Official UMAP 2026 accepted papers](https://www.um.org/umap2026/accepted-papers/)
- [LookSync article](https://engg.glance.com/from-ai-outfit-to-add-to-cart-making-ai-generated-fashion-looks-shoppable-at-scale-ac1251a47f33)
- [DINO article](https://medium.com/@pradeep.muniasamy/teaching-vision-without-labels-the-evolution-of-dino-d5d81b305ca0)
- [Segment Anything article](https://medium.com/@pradeep.muniasamy/segment-anything-a-new-era-in-promptable-image-segmentation-1b85f82b7c3c)
- [Llama article](https://medium.com/@pradeep.muniasamy/exploring-the-basics-llama-and-working-with-them-on-locally-0aa1686a1659)

## OpenAI résumé assistant — setup required

The site now has an LLM-only client. The previous downloadable local model is removed. The assistant displays an honest unavailable state until a separate backend and its credentials are configured. The portfolio, résumé, and links remain usable.

Read `backend/SETUP.md` for the complete deployment and GitHub Secrets steps. `backend/worker.mjs` includes server-enforced request limits, Turnstile checks, and a conservative $5 monthly reservation allowance. No real API keys are included. Only the public backend URL and Turnstile site key belong in `chat-config.js`.

To update GitHub Pages, upload the extracted website files at the repository root. If replacing the previous version, delete the old `models/`, `vendor/`, `semantic-worker.mjs`, `semantic-ranking.mjs`, and `model-assets.json` files; they are no longer used. The `backend/` folder is deployable source, not a backend executable by GitHub Pages. It contains only approved public facts and no credentials.

Offline security and budget checks passed. Live LLM responses require your own funded API account, a backend deployment, and real bot-verification credentials. None have been activated on your behalf.
