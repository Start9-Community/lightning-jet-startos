# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Bugs and feature requests are GitHub issues on this repo** — file them as you find them.
Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **Run `launcher.js` in the foreground; never `jet start daddy`.** That command spawns the watchdog detached and exits, which makes the primary daemon exit on every start.
- **The health check watches the watchdog alone, deliberately.** `launcher.js` respawns the rebalancer, htlc-logger, worker and telegram children, so a child failing is upstream's recovery working — surfacing it here would mask that with a service fault.
- **Only `config.json` is bind-mounted, not `/app` or `/app/db`.** Mounting a volume over the app directory would hide the image's `node_modules` and JS. The consequence is that Jet's sqlite history is ephemeral; don't "fix" that by mounting the directory.
- **Import LND's host id and port from `lnd-startos/startos/interfaces`** rather than hardcoding, so a change on LND's side is a compile error here.
- **The admin macaroon is required and cannot be downgraded** — rebalancing calls LND's mutation RPCs, which a readonly macaroon rejects.
