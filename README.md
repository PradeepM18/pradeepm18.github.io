# Pradeep Muniasamy — career portfolio

A self-contained, responsive portfolio for Pradeep Muniasamy, Applied Scientist 3 at Glance. The website uses plain HTML, CSS, and JavaScript. It needs no build tools, API keys, paid services, or backend.

Link - https://pradeepm18.github.io

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
