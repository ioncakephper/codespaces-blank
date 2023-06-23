---
sidebar_label: Usage
---

# Usage

How to use as CLI or `npx` command

## Run `skelo` as CLI


**`1.`** Create folder and `cd` to it.

```bash
mkdir my-project
cd my-project
```


**`2.`** Install `docusaurus`:

```bash
npx create-docusaurus@latest website classic
```

:::info
Installs `docusaurus` in `my-project/website` folder
:::

**`3.`** Install `skelo` globally

```bash
npm i -g skelo
skelo -h # check it is available globally
```

**`4.`** Create outline file `my-project.outline.yml`

```yml title=my-project.outline.yml
sidebars:
    - tutorialSidebar:
        - Overview
        - Getting started:
            - Features
            - Usage
```

**`5.`** Create documentation files and sidebar structure with `skelo` CLI

```bash
skelo my-project.outline.yml -d website/docs -s website/sidebars.js
```

**`6.`** Launch `docusaurus` development server

```bash
cd website
npm run start
```






## Run `skelo` as `npx` command







