# Contributing

## Building and Development

See the [StartOS Packaging Guide](https://docs.start9.com/packaging/) for complete environment setup and build instructions.

### Quick Start

```bash
# Initialize the upstream lightning-jet submodule
git submodule update --init --recursive

# Install dependencies
npm ci

# Build universal package
make
```

The Dockerfile copies the contents of the `lightning-jet/` git submodule into the
image, so the submodule must be checked out before running `make`. Updating
upstream Lightning Jet is done by bumping the submodule commit.

## How to Contribute

1. Fork the repository and create a branch from `master`
2. Make your changes
3. Open a pull request to `master`
