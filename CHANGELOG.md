# Changelog

## 2.0.0 (September 19, 2021)

- Get upstream branch from `github.context.ref`. input-variable `upstream-branch` is no longer needed
- Input-variable `exclude` now accepts a multiline input:

  ```yaml
  - uses: milliHQ/gh-action-release-branch@v2.0.0
    with:
      release-branch: release
      release-tag: v1.0.0
      exclude: |
        lib/**/*
        test/**/*
  ```

## 1.1.0 - (May 04, 2021)

- Include dotfiles in delete commit ([#3](https://github.com/dealmore/gh-action-terraform-module-release/pull/3))
- Skip delete commit when files are empty ([#2](https://github.com/dealmore/gh-action-terraform-module-release/pull/2))

## 1.0.0 - (March 15, 2021)

Initial release
