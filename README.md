# Leonida Ledger — GTA 6 Trophy Guide & Tracker

[![make.fun competition](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01/)
[![make.fun rank](https://make.fun/badge/gta6-trophy-guide-01/intan151/gta6-trophy-guide-leonida-v4/rank.svg)](https://make.fun/c/gta6-trophy-guide-01/)
[![make.fun reward](https://make.fun/badge/gta6-trophy-guide-01/intan151/gta6-trophy-guide-leonida-v4/reward.svg)](https://make.fun/c/gta6-trophy-guide-01/)

An offline web app that guides and tracks all **55 PlayStation 5 trophies of Grand Theft Auto VI** — the official list, a roadmap to the platinum, and a guide to every trophy in our own words, with its sources.

## What it does

- **Tracker** — every trophy with its official name, description and grade (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden on PSN). Tick trophies off as you earn them; progress and per-trophy notes are saved in the browser (localStorage) and can be **exported to a file and imported back**.
- **Filters** — by grade, by kind (story, mission, side strand, collectible, activity, challenge, crime, money, secret), missable-only, not-yet-earned-only, and free-text search. Keyboard: `/` focuses search, `1`/`2`/`3` switch views, `s` toggles spoiler mode.
- **Spoiler mode** — hides the names, descriptions and guides of story and mission trophies until you earn them.
- **Roadmap to the platinum** — five stages in order (story, side strands, collectibles, activities, money and cleanup), each with its earned count, built from the official descriptions.
- **Missables page** — the 5 flagged one-time moments, with an honest note: nothing in the official descriptions confirms a trophy that can never be earned again, so the flags mark moments to do the first time they appear.
- **A guide for every trophy** — what to do, where, and when it can be missed, in our own words. Each guide cites its sources: the official list on Exophase and PSNProfiles, and says plainly where a place or step is not yet checked in the game.

## Sources

Trophy names, descriptions, grades, hidden flags and PSN count targets come from the official PlayStation 5 list as published on [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi), which agree on every entry. Guides are original writing drawn from those descriptions — never copied from another guide. No Rockstar logo or official artwork is used.

## Run it

Static files, no build step, no network requests at run time — open `app/index.html` through any static server:

```sh
node serve.ts
# then open http://localhost:8080
```

## Hand it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

- `app/index.html` — the guide's single page
- `app/css/style.css` — the ledger look (paper, coral accent)
- `app/data/trophies.json` — the 55 trophies with guide, tip, kind, missable flag, PSN target and sources
- `app/data/roadmap.json` — the five-stage roadmap to the platinum
- `app/js/main.js` — boot, routing, events, keyboard shortcuts
- `app/js/store.js` — localStorage progress, export and import
- `app/js/filters.js` — filters and the spoiler rule
- `app/js/views.js` — list, guide pane, roadmap, missables and settings rendering
- `main.ts` — the entry program; `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged

## License

MIT — see [LICENSE](LICENSE).
