# upm-subtree-split

GitHub Action to perform subtree split on Unity package to upm branch.

```yaml
name: upm-subtree-split
on:
  push:
    branches:
    - main
jobs:
  upm-subtree-split:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: RageAgainstThePixel/upm-subtree-split@v1.1
```
