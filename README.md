<p align="center">
  <img src="icon.png" alt="Lightning Jet Logo" width="21%">
</p>

# Lightning Jet on StartOS

> **Upstream docs:** <https://github.com/itsneski/lightning-jet#readme>
>
> Everything not listed in this document should behave the same as upstream
> Lightning Jet. If a feature, setting, or behavior is not mentioned here,
> the upstream documentation is accurate and fully applicable.

[Lightning Jet](https://github.com/itsneski/lightning-jet) is a fully automated
channel rebalancer for LND Lightning nodes. It classifies peers based on
routing history, surfaces missed routing opportunities, detects stuck HTLCs,
and continuously rebalances channel liquidity in the background.

Lightning Jet is a **command-line-only** tool. It has no web UI. You interact
with it from a shell on your StartOS server.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Dependencies](#dependencies)
- [Actions](#actions)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property        | Value                                                            |
| --------------- | ---------------------------------------------------------------- |
| Source          | `dockerBuild` from local `Dockerfile` (no upstream Docker image) |
| Base            | `node:20-bookworm-slim`                                          |
| Upstream source | Git submodule at `lightning-jet/` pinned to upstream tag         |
| Architectures   | x86_64, aarch64                                                  |

The upstream project does not publish a Docker image. The package Dockerfile
copies the contents of the `lightning-jet/` submodule into `/app`, runs
`npm install` inside `/app`, and sets `/app` on `PATH` so `jet` is available
as a command.

**Before building**, initialize and check out the submodule:

```bash
git submodule update --init --recursive
```

The submodule is pinned by the parent repo. Update it in a separate PR when
upstream releases a new tag (see [versions.md](https://docs.start9.com/packaging/versions.html)).

---

## Volume and Data Layout

| Volume           | Mount Point            | Type                   | Purpose                                        |
| ---------------- | ---------------------- | ---------------------- | ---------------------------------------------- |
| `main`           | `/app/api/config.json` | single-file bind mount | Jet runtime config, managed by StartOS Actions |
| (LND dependency) | `/mnt/lnd`             | read-only              | LND admin macaroon and TLS cert                |

**Key paths on the `main` volume:**

- `api/config.json` — Lightning Jet's runtime configuration. Backed by a
  `FileHelper.json` FileModel and exposed to users via Actions.

The full `/app` directory (source, `node_modules`, the `jet.db` sqlite file)
is **not** mounted on a persistent volume. It lives inside the container image
and is recreated on each container rebuild. The 0.3.x package behaved the same
way — `main` was mounted at `/root`, so jet's internal db was never persisted
across restarts.

---

## Installation and First-Run Flow

| Step           | Upstream                         | StartOS                        |
| -------------- | -------------------------------- | ------------------------------ |
| Installation   | Clone repo, `npm install`        | Install from marketplace       |
| LND connection | Manual edit of `api/config.json` | Auto-configured via dependency |
| SSH access     | Manual setup                     | Uses StartOS SSH               |

**First-run steps:**

1. Install LND on StartOS.
2. Install Lightning Jet from the marketplace. Jet is CLI-only and begins
   attempting (real-sats) rebalances as soon as it is started.
3. Start the service. The `daddy` watchdog launches the rebalancer,
   htlc-logger, worker, and — if configured — the Telegram bot.
4. From a shell on your StartOS server, attach to the running container
   to use the `jet` CLI:
   ```bash
   start-cli package attach lightning-jet
   jet help
   ```
5. Optional: run the **Configure Telegram Bot** action from the StartOS UI
   to enable Jet bot notifications.

---

## Configuration Management

Lightning Jet reads `/app/api/config.json` at startup. StartOS models that
file with a `FileHelper.json` FileModel on the `main` volume and bind-mounts
it into the container. Actions read and write this FileModel; the running
container sees any changes after a restart.

### api/config.json (managed FileModel)

| Setting                           | Default                                              | Source / Purpose                                                                                                                                                                            |
| --------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `macaroonPath`                    | `/mnt/lnd/data/chain/bitcoin/mainnet/admin.macaroon` | Fixed — locked to LND mount path                                                                                                                                                            |
| `tlsCertPath`                     | `/mnt/lnd/tls.cert`                                  | Fixed — locked to LND mount path                                                                                                                                                            |
| `serverAddress`                   | resolved at runtime                                  | Set by `main.ts` to LND's gRPC address over the LXC bridge (via `sdk.host.getBridgeAddress`); left unset while LND is absent or still locked, then self-heals when the gRPC binding appears |
| `telegramToken`                   | unset                                                | Set via the **Configure Telegram Bot** action                                                                                                                                               |
| `rebalancer.minCapacity`          | `50000`                                              | Matches 0.3.x default                                                                                                                                                                       |
| `rebalancer.maxTime`              | `30`                                                 | Max minutes per rebalance attempt                                                                                                                                                           |
| `rebalancer.maxPpm`               | `650`                                                | Max PPM fee rate for manual rebalances                                                                                                                                                      |
| `rebalancer.maxAutoPpm`           | `500`                                                | Max PPM fee rate for automated rebalances                                                                                                                                                   |
| `rebalancer.maxInstances`         | `10`                                                 | Max concurrent rebalance instances                                                                                                                                                          |
| `rebalancer.maxPendingHtlcs`      | `4`                                                  | FileModel default                                                                                                                                                                           |
| `rebalancer.enforceMaxPpm`        | `false`                                              | FileModel default                                                                                                                                                                           |
| `rebalancer.enforceProfitability` | `false`                                              | FileModel default                                                                                                                                                                           |
| `rebalancer.buffer`               | `250`                                                | FileModel default                                                                                                                                                                           |
| `rebalancer.disabled`             | `false`                                              | FileModel default                                                                                                                                                                           |
| `rebalancer.exclude`              | `[]`                                                 | FileModel default                                                                                                                                                                           |
| `log.level`                       | `info`                                               | FileModel default                                                                                                                                                                           |
| `db.maxRebalanceHistoryDepth`     | `180`                                                | FileModel default                                                                                                                                                                           |
| `db.maxChannelEventsDepth`        | `180`                                                | FileModel default                                                                                                                                                                           |

Only the Telegram token is editable through the StartOS UI. Advanced
rebalancer tuning is left to upstream defaults; users who need to change
them can edit `api/config.json` directly on the `main` volume or use
`jet` subcommands where available.

Fields marked **Fixed** are enforced by the FileModel (`z.literal(...).catch(...)`).
If the file is ever edited manually to a different value, the next `merge()`
correction restores the StartOS path.

---

## Network Access and Interfaces

Lightning Jet exposes **no network interfaces**. It is a long-running
rebalancer daemon plus a CLI — no HTTP, gRPC, or peer ports.

All interaction is through an attached shell in the running container:

```bash
start-cli package attach lightning-jet
jet <subcommand>
```

---

## Dependencies

| Dependency | Required | Version           | Purpose                     |
| ---------- | -------- | ----------------- | --------------------------- |
| LND        | yes      | `>=0.20.1-beta:1` | Lightning node to rebalance |

Lightning Jet requires LND's admin macaroon to call mutation RPCs (open,
close, rebalance). The macaroon and `tls.cert` are read from `/mnt/lnd`,
which is a read-only mount of LND's `main` volume.

---

## Actions

| Action                     | Purpose                                                |
| -------------------------- | ------------------------------------------------------ |
| **Configure Telegram Bot** | Set or clear `telegramToken` for Jet bot notifications |

The action writes to the `FileHelper.json` FileModel. Since the file is
bind-mounted into the container, the next container restart picks up the
change.

---

## Backups and Restore

**Included in backup:**

- `main` volume — holds `api/config.json`.

**Restore behavior:**

- The FileModel is restored intact, preserving your rebalancer settings
  and Telegram token. Lightning Jet reconnects to LND automatically on
  startup using the LND mount.

**Note:** Lightning Jet does not store funds, channels, or keys. All
Lightning state lives in LND. Back up LND separately.

---

## Health Checks

| Check  | Display Name | Method                                                 | Messages              |
| ------ | ------------ | ------------------------------------------------------ | --------------------- |
| Daemon | Jet Daemon   | `pgrep -f service/launcher.js` inside the subcontainer | Running / Not running |

Lightning Jet does not listen on a TCP port, so a `pgrep`-based check is
used instead of `checkPortListening`. The primary daemon exec is
`node /app/service/launcher.js` — the "daddy" watchdog, run directly in
the foreground. Running through the `jet` CLI wrapper (`jet start daddy`)
would exit immediately because the CLI spawns the watchdog detached, so
we call the watchdog script itself. No standalone health checks are
registered.

---

## Limitations and Differences

1. **CLI only** — no web UI, API, or peer port. All interaction is through
   `start-cli package attach`.
2. **Ephemeral sqlite db** — `/app/db/jet.db` is not persisted across
   container rebuilds (matches the 0.3.x behavior, where `main` was mounted
   at `/root` and the db was never preserved).
3. **Admin macaroon** — the 0.3.x entrypoint `chmod +r`'d the readonly
   macaroon; in 0.4.0 the LND mount is strictly read-only, so Jet is pointed
   at `admin.macaroon` directly. This matches upstream recommendations.
4. **LND address** — resolved reactively from LND's gRPC binding over the LXC
   bridge under SDK 2.0, re-resolving automatically when it changes so a fresh
   LND install/unlock heals with one restart. It is left unset while LND is
   absent or still locked (the retired `lnd.startos`/`lnd.embassy` DNS names no
   longer resolve).
5. **No Tor-only LND** — Jet connects to LND over the internal StartOS network.

---

## What Is Unchanged from Upstream

- All `jet` CLI subcommands (`jet start`, `jet list-channels`, `jet probes`,
  `jet rebalance`, `jet htlc-history`, etc.).
- Rebalancing algorithm and policy.
- Telegram bot integration.
- Log file locations under `/tmp` inside the container.
- The `daddy` watchdog (launcher.js) supervising the rebalancer,
  htlc-logger, worker, and telegram sub-services.

---

## Quick Reference for AI Consumers

```yaml
package_id: lightning-jet
upstream: https://github.com/itsneski/lightning-jet
image:
  source: dockerBuild (local Dockerfile)
  base: node:20-bookworm-slim
architectures: [x86_64, aarch64]
volumes:
  main:
    api/config.json: managed FileModel (FileHelper.json)
  mounts:
    - /mnt/lnd: lnd dependency volume (read-only)
interfaces: []
dependencies:
  lnd:
    kind: running
    versionRange: '>=0.20.1-beta:1'
    healthChecks: [lnd]
actions:
  - set-telegram-token
health_checks:
  - primary: pgrep -f service/launcher.js (daemon ready)
backup_volumes:
  - main
fixed_config:
  macaroonPath: /mnt/lnd/data/chain/bitcoin/mainnet/admin.macaroon
  tlsCertPath: /mnt/lnd/tls.cert
  serverAddress: runtime-resolved (LND gRPC address over LXC bridge)
```
