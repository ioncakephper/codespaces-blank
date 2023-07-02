---
sidebar_label: Visual Studio Code Updates
---

# Visual Studio Code Updates

Items are ordered by version in descending order. The recent version appears first. Each sidebar item appears as Month Year, e.g. "January 2023", and links to a filename derived from product version. For example, release notes about version 1.19 which was released in February 2023 are found in v1-19.md

* Label: {{month}} {{yyyy}}
* Filename: v{{version}}
* Title: {{month}} {{year}} (version {{version}})

```md
---
sidebar_label: January 2023
---

# January 2023 (version 1.19)

Welcome to the January 2023 release of Visual Studio Code. There are many updates in this version that we hope you'll like, some of the key highlights include:

## Accessibility

### Verbosity Settings

### Settings Editor


## Workbench

### Readonly Mode

### Windows UNC host allowlist improvements

## Editor

## Terminal
```

The `updates.outline.yml`:

```yml
sidebars:
    - updatesSidebar:
        path: updates
        order:
            by: id
            direction: desc
        items:
            - December 2022:
                frozen: exists
                id: v1-16
            - January 2023:
                frozen: exists
                id: v1-19
            
```
