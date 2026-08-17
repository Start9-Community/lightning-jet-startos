# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Run `launcher.js` in the foreground; never `jet start daddy`.** That command spawns the watchdog detached and exits, which makes the primary daemon exit on every start.
- **The health check watches the watchdog alone, deliberately.** `launcher.js` respawns the rebalancer, htlc-logger, worker and telegram children, so a child failing is upstream's recovery working — surfacing it here would mask that with a service fault.
- **Only `config.json` is bind-mounted, not `/app` or `/app/db`.** Mounting a volume over the app directory would hide the image's `node_modules` and JS. The consequence is that Jet's sqlite history is ephemeral; don't "fix" that by mounting the directory.
- **Import LND's host id and port from `lnd-startos/startos/interfaces`** rather than hardcoding, so a change on LND's side is a compile error here.
- **The admin macaroon is required and cannot be downgraded** — rebalancing calls LND's mutation RPCs, which a readonly macaroon rejects.
