# Lightning Jet

Lightning Jet is a command-line-only tool. It has no web UI and exposes no network interfaces — you drive it from a shell attached to the running service. You will need an SSH key configured on your StartOS server to reach that shell; see the [Start9 SSH guide](https://docs.start9.com/start-os/ssh) for setup instructions.

## Documentation

- [Lightning Jet README](https://github.com/itsneski/lightning-jet#readme) — the upstream guide to `jet` subcommands, the rebalancer, and the Telegram bot.

## What you get on StartOS

- A long-running rebalancer daemon that wakes the `jet` watchdog, the rebalancer, the HTLC logger, the background worker, and (if configured) the Telegram bot.
- The `jet` CLI, reached by attaching a shell to the running service.
- An auto-configured LND connection — the admin macaroon and TLS certificate from your LND service are mounted into Lightning Jet read-only, and the LND host, macaroon path, and cert path are pre-set in Jet's config. You do not edit those fields.

## Getting set up

1. Install **LND** first and finish its setup (wallet created and unlocked). Lightning Jet will not start usefully without an LND it can call.
2. Install Lightning Jet from the marketplace. Jet is CLI-only and begins attempting (real-sats) rebalances as soon as it is started.
3. Start the service. Wait for the **Jet Daemon** health check to report running.
4. Open a shell on your StartOS server (over SSH) and attach to the Lightning Jet container:

   ```
   start-cli package attach lightning-jet
   ```

   From the attached shell, run `jet help` to list the available subcommands.

5. Optional: run the **Configure Telegram Bot** action to paste in a BotFather token if you want Jet to send Telegram notifications.

## Using Lightning Jet

### The `jet` CLI

All day-to-day use happens from an attached shell. Common subcommands include `jet list-channels`, `jet rebalance`, `jet probes`, and `jet htlc-history`; see the upstream README for the full list and for tuning advice.

### Actions

- **Configure Telegram Bot** — paste the API token BotFather gave you when you created your Jet bot, or leave it blank to disable Telegram notifications. The token is saved to Jet's config file; the next restart of the service picks it up.

## Limitations

- Lightning Jet's internal sqlite database (under `/app/db` in the container) is not persisted across service restarts or updates. Routing history that Jet itself records will reset; LND's own data is unaffected.
- Advanced rebalancer tuning (max PPM, max instances, capacity thresholds, etc.) is not exposed through the StartOS UI. Edit `api/config.json` on the service's `main` volume directly, or use the relevant `jet` subcommands from the attached shell.
