<p align="center">
  <img src="icon.png" alt="Lightning Jet Logo" width="21%">
</p>

# Lightning Jet on StartOS

> Everything not listed in this document should behave the same as upstream
> Lightning Jet. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[Lightning Jet](https://github.com/itsneski/lightning-jet) automates channel rebalancing on an LND node, with a Telegram bot for notifications. It is a command-line tool: this package runs its watchdog as a service and wires it to the LND on the same server, and day-to-day use is a shell inside the container.

- **Upstream repo:** <https://github.com/itsneski/lightning-jet>
- **Wrapper repo:** <https://github.com/Start9-Community/lightning-jet-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

One image, built here.

| Property      | Value                               |
| ------------- | ----------------------------------- |
| Image         | Built from this repo's `Dockerfile` |
| Architectures | x86_64, aarch64                     |
| Command       | The watchdog, run in the foreground |

| Subcontainer        | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `lightning-jet-sub` | The only daemon — the one to `attach` to |

**The daemon is the watchdog, not the rebalancer.** It runs in the foreground and spawns the rebalancer, the HTLC logger, the worker, and the Telegram bot as its own children — so those four are supervised by it rather than by StartOS.

That is a deliberate departure from upstream's own start command, which spawns the watchdog detached and exits: running it that way would make the daemon exit on every start.

## Volume and Data Layout

One volume, mounted as a **single file**, plus a read-only view of LND's.

| Volume            | Mount Point         | Purpose                          |
| ----------------- | ------------------- | -------------------------------- |
| `main`            | Jet's `config.json` | The configuration, and only that |
| LND's `main` (ro) | `/mnt/lnd`          | LND's certificate and macaroon   |

**Only the one configuration file is mounted**, not the application directory. Mounting a volume over that directory would hide the image's own code and dependencies, so the package bind-mounts the single file instead.

The consequence is that **Jet's working database is not persisted** — it lives in the image's filesystem and is discarded on every restart. Rebalance history and channel-event history therefore do not survive a restart, which is why the retention settings bound something that is already ephemeral.

## File Models

One model, and it is the whole configuration surface.

| File          | Format | Modelled                | Written by                   |
| ------------- | ------ | ----------------------- | ---------------------------- |
| `config.json` | JSON   | Yes — `FileHelper.json` | Init, `main`, and the action |

Its fields fall into three groups:

- **Pinned.** The macaroon and certificate paths are `z.literal(...).catch(...)` — a changed value is **repaired on read**, not merely overwritten. They can only ever be the mount points of the LND dependency.
- **Resolved at start.** LND's gRPC address, written by `main`. **When LND is absent or still locked it is left unwritten** rather than defaulted, so Jet fails to connect and the health check goes red — instead of silently dialing a dead address. The reactive read heals it with one restart when LND's binding appears.
- **User-owned.** The Telegram token, the avoid list, log level, history retention, and the whole rebalancer block — maximum time and fee rates, concurrency, HTLC limits, profitability enforcement, minimum capacity, and an exclusion list.

**Most of that rebalancer block is only reachable by editing the file**, since the package exposes just one action. The defaults mirror upstream's, with one exception carried forward from the previous package generation for continuity.

Init merges the model on **every** init, so a field added in a later version picks up its default on upgrade — and so a restore from a pre-model backup materializes the file the application needs.

## Dependencies

One, and it is required.

| Dependency | Required | Health checks required | Mounted                         | Why                    |
| ---------- | -------- | ---------------------- | ------------------------------- | ---------------------- |
| LND        | Yes      | `lnd`                  | `main`, read-only at `/mnt/lnd` | The node it rebalances |

**This package uses LND's admin macaroon, and needs it.** Rebalancing calls LND's mutation RPCs, which a read-only macaroon cannot authorize — so anyone with access to this service can move funds between your channels.

LND's gRPC address is resolved over the internal bridge. LND publishes that binding only once its wallet has first been unlocked, so a Jet installed first is not broken — it fails its check until LND is ready, then heals on its own.

## Network Access and Interfaces

**None.** `setInterfaces` returns an empty array: no port is bound and no address is published.

Traffic leaves the container in two directions — gRPC to LND over the internal bridge, and, if configured, outbound to Telegram. Neither is an inbound interface.

Access is therefore SSH to the server plus an attached shell, which is where the `jet` commands are run.

## Installation and First-Run Flow

Install seeds the configuration with defaults. There is no task, no credential, and no wizard.

**LND must be running and unlocked** before Jet can do anything; installed first or second does not matter, since the address is healed in when it appears.

Once running, the watchdog starts its children and rebalancing begins under the default policy. **Rebalancing is on by default** — there is a disable switch in the configuration, but it is off, so a fresh install starts moving funds between channels according to the default fee limits as soon as LND is reachable. Review those limits before starting it if that is not what you want.

Telegram is optional and off until a token is set.

## Actions

One action.

### Configure Telegram Bot

Sets or clears the Telegram token used for notifications.

- **What it changes:** the token in the configuration.
- **Cost:** applies on restart.
- **Repeat safety:** idempotent. Submitting an empty value **clears** the token and disables notifications, which is the documented way to turn them off.
- **What happens next:** with a token set, message the bot to begin receiving notifications — the token alone does not establish the chat.

**Everything else is configured by editing the file**, from an attached shell. The rebalancer's fee limits and the avoid list have no action.

## Tasks

None. This package raises no tasks, so the service is never held on a prompt and its ordinary controls are always available.

## Health Checks

One check, on the only daemon.

| Check     | Displayed as | Method                          |
| --------- | ------------ | ------------------------------- |
| `primary` | "Jet Daemon" | The watchdog process is running |

**It checks the watchdog only, and that is deliberate.** The watchdog is responsible for respawning its four children, so as long as it is alive the service is considered healthy — a child failing and being restarted is upstream's recovery working, not something to surface as a service fault.

The consequence: **a green check does not mean rebalancing is happening.** It does not mean LND is reachable either — that shows as Jet's own logs failing to connect, and as the address being absent from the configuration.

## Backups and Restore

The `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`. In practice that is one file: the configuration.

**Nothing else is worth keeping.** The rebalance and channel-event history lives in the image's filesystem and is discarded on restart anyway, and the credentials belong to LND.

A restored instance comes back with the same policy and the same Telegram token, and re-resolves LND's address on the new server. It needs LND present and unlocked before it does anything.

## Limitations and Differences

1. **No interfaces at all.** Everything is done from an attached shell.
2. **Jet's database is not persisted.** History does not survive a restart.
3. **The admin macaroon is required**, so shell access here can move funds between your channels.
4. **Only the Telegram token has an action.** The rebalancer's policy is edited in the configuration file directly.
5. **Rebalancing is enabled by default**, under upstream's default fee limits.
6. **Mainnet only.** The macaroon path is pinned to Bitcoin mainnet.
7. **The health check observes the watchdog only**, not the work.

---

## Quick Reference for AI Consumers

```yaml
package_id: lightning-jet
image: built from ./Dockerfile
architectures:
  - x86_64
  - aarch64
subcontainers:
  - lightning-jet-sub
volumes:
  main: mounted as Jet's config.json alone # LND's main volume is read-only at /mnt/lnd
file_models:
  - config.json # the whole configuration surface
startos_managed_env_vars: [] # everything is written into config.json
dependencies:
  - lnd # required, kind: running, admin macaroon via a read-only mount
interfaces: {} # none declared
actions:
  - set-telegram-token
tasks: []
health_checks:
  - primary # displayed "Jet Daemon"; watches the watchdog, not its children
```
