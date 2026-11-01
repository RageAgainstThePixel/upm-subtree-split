# upm-subtree-split

GitHub Action to perform subtree split on Unity package to upm branch.

Splits the package folder into its own history on the `upm` branch and force pushes it to `origin`.

## How to use

### workflow

```yaml
name: upm-subtree-split
on:
  push:
    branches:
      - main
jobs:
  upm-subtree-split:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0 # Required for the full package history
      - uses: RageAgainstThePixel/upm-subtree-split@v1
        with:
          package-root: 'Packages/com.company.package' # Optional
```

### inputs

| name | description | required |
| ---- | ----------- | -------- |
| `package-root` | Path to the package root which contains `package.json`. Defaults to the single folder matching `**/Packages/com.*`. | false |
