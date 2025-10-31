# upm-subtree-split

GitHub Action to perform subtree split on Unity package to upm branch.

```yaml
name: upm-subtree-split
on:
  push:
    branches: [main]
jobs:
  upm-subtree-split:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v5
    - uses: RageAgainstThePixel/upm-subtree-split@v1
      with:
        package-root: Packages/com.company.package-name/package.json
        tag-branch: true
```

## inputs

| name | description | required |
| ---- | ----------- | -------- |
| package-root | Path to the package root which contains package.json. Defaults to `**/Packages/**/package.json` glob search. | false |
| tag-branch | Whether to tag the branch after split with the package version. | false |
