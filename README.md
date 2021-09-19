# GitHub action for releasing Terraform modules

Since Terraform does a full checkout of the GitHub repository on a `terraform init` it pulls everything that is in the repo.

Since we mostly work with monorepos that also contain large chunks of code or tests that is not used by Terraform we use this action to exclude these files from our releases.

## Usage

```yaml
name: Release

on:
  workflow_dispatch:
    inputs:
      tag:
        description: 'Tag'
        required: true

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      # Do a full checkout (all branches)
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0

      - uses: milliHQ/gh-action-release-branch@v2.0.0
        with:
          release-branch: release
          release-tag: ${{ github.event.inputs.tag }}
          exclude: |
            lib/**/*
            test/**/*
```

## License

Apache-2.0 - see [LICENSE](./LICENSE) for details.
