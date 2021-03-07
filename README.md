# GitHub action for releasing Terraform modules

Since Terraform does a full checkout of the GitHub repository on a `terraform init` it pulls everything that is in the repo.

Since we mostly work with monorepos that also contain large chunks of code or tests that is not used by Terraform we use this action to exclude these files from our releases.

## License

Apache-2.0 - see [LICENSE](./LICENSE) for details.
