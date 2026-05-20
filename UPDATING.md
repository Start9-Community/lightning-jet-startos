# Updating the upstream version

Lightning Jet is built from the `lightning-jet/` git submodule (no `dockerTag` in the manifest), so the upstream pin is the submodule commit recorded in this repo.

## Determining the upstream version

- **Lightning Jet** — [itsneski/lightning-jet](https://github.com/itsneski/lightning-jet). The latest release and the latest tag are the same; either query works:
  ```bash
  gh release view -R itsneski/lightning-jet --json tagName -q .tagName
  gh api repos/itsneski/lightning-jet/tags --jq '.[0].name'
  ```
  Pin: the `lightning-jet` submodule commit (configured in `.gitmodules`, checked out under `lightning-jet/`).

## Applying the bump

- **Lightning Jet** — check out the new tag inside the submodule and stage the updated pointer:
  ```bash
  cd lightning-jet && git fetch --tags && git checkout v<new version>
  cd .. && git add lightning-jet
  ```
