# Updating the upstream version

Lightning Jet is built from the `lightning-jet/` git submodule (no `dockerTag` in the manifest), so the upstream pin is the submodule commit recorded in this repo.

## Determining the upstream version

- **Lightning Jet** — [drneski/lightning-jet](https://github.com/drneski/lightning-jet). The latest release and the latest tag are the same; either query works. Tags carry a suffix after the version (`v1.7.0-node22`):
  ```bash
  gh release view -R drneski/lightning-jet --json tagName -q .tagName
  gh api repos/drneski/lightning-jet/tags --jq '.[0].name'
  ```
  Pin: the `lightning-jet` submodule commit (configured in `.gitmodules`, checked out under `lightning-jet/`).

## Applying the bump

- **Lightning Jet** — check out the new tag inside the submodule and stage the updated pointer:
  ```bash
  cd lightning-jet && git fetch --tags && git checkout <new tag>
  cd .. && git add lightning-jet
  ```
