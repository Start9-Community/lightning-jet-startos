# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (architecture, for developers and LLMs) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Package id is `lightning-jet`.** It is a command-line-only tool — it exposes no network interfaces (`setInterfaces` returns `[]`) and has no web UI; users drive it from a shell attached to the running service.
- **It is a hard dependent of `lnd`.** `startos/utils.ts` imports `gRPCHostId` / `gRPCInterfaceId` from `lnd-startos/startos/interfaces` and resolves LND's gRPC endpoint over the LXC bridge (`sdk.host.get` with `packageId: 'lnd'`), then `main.ts` pins that `host:port` into Jet's `api/config.json` (`serverAddress`) before the daemon starts. LND's admin macaroon and `tls.cert` are read off a read-only dependency mount at `/mnt/lnd`.
- **Config lives in `api/config.json`** on the `main` volume, managed by the `jetConfig` FileModel (`startos/fileModels/config.json.ts`). Only that single file is bind-mounted into `/app` — the rest of `/app` (and Jet's ephemeral sqlite under `/app/db`) comes from the image and is not persisted.

## Inspecting a running install

To run a command inside the service's container (read its generated config, grep app logs), use `start-cli package attach lightning-jet -n lightning-jet-sub -- <cmd>`. Select the subcontainer by **name** with `-n` (the name passed to `SubContainer.of` in `main.ts` — here `lightning-jet-sub`) or by image with `-i`. Note: `-s/--subcontainer` matches the internal **Guid**, not the name, so passing a name to `-s` fails with "no matching subcontainers".
