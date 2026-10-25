# J.A.R.V.I.S vision (user, 2026-10-25)

Verbatim from the user's first message when starting J.A.R.V.I.S:

> This is a new repo with a finance tracker, the repo will effectively become a repo for a personal assistant to my life, I want this project to be a financial tracker (monthly spend, pension, loans, statement import to see if I'm spending against what I plan etc.), an integration of calendar / todo maybe? a meal planner - so being able to add meals me and my part likes and then form a shopping list that I could import to a shopping app like tesco, we've just bought a house so a planner as an extension of the financial tracker but for things of the house like reno of the kitchen. bathroom and garden which having a view of the progress and things like that would be cool, I'd also like to get to the point of being able to connect to these like statement bills of electric / gas - see smart controls of lights, temp meters etc. - this will all be hosted in the cloud somewhere were I and my partner can log in

Follow-up decisions in the same session:

- The `src/finance-tracker` code copied into this repo is the version to build on; the standalone `RhysJohn/finance-tracker` repo is the old one.
- Restructure into `src/app` with Nuxt layers (see `docs/decisions/0001-one-nuxt-app-with-a-layer-per-domain.md`).
- Structure the project knowledge as an LLM-maintained wiki, with agent files that make the changes.
