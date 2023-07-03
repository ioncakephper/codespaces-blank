# create-docusaurus-skeleton

## How to build documentation skeleton

1. Create project folder and `cd` to id.

```shell
mkdir my-project
cd my-project
```

2. Create documentation outline file: `my-project.outline.yml`

```yml
sidebars:
    - tutorialSidebar:
        autobrief: true
        items:
            - Overview:
                headings:
                    - Features
                    - "What's new"
                    - Our customers:
                        - Customer C
                        - Customer A
                        - Customer B
            - Getting started:
                - Installation
                - Usage
                - Quick demo
```

3. Create Docusaurus site in `website` folder

```shell
npx create-docusaurus@latest website classic
```

4. Build documentation skeleton with `create-docusaurus-skeleton`

```shell
cd website
npx create-docusaurus-skeleton ../my-project.outline.yml --verbose
```
5. Run Docusaurus development server and open the browset at https://localhost:3000

```shell
npm start
```

## Sidebars.js

```js
let sidebars = {
    "tutorialSidebar": [
        "overview",
        "installation",
        "usage",
        "quick-demo"
    ]
}
module.exports = sidebars;
```

## Topic files

* `website/docs/overview.md`

```md
---
sidebar_label: Overview
---

# Overview

Randomly generated text appears here...

## Features

Randomly generated text appears here...

## What's new

Randomly generated text appears here...

## Our customers

Randomly generated text appears here...

### Company C

Randomly generated text appears here...

### Company A

Randomly generated text appears here...

### Company B

Randomly generated text appears here...

```

* `website/docs/installation.md`

```md
---
sidebar_label: Installation
---

# Installation

Randomly generated text appears here...

```


* `website/docs/usage.md`

```md
---
sidebar_label: Usage
---

# Usage

Randomly generated text appears here...

```


* `website/docs/quick-demo.md`

```md
---
sidebar_label: Quick demo
---

# Quick demo

Randomly generated text appears here...

```

## Outline properties

| Name | Type | Description | Default
|------|------|-------------|--------
| sidebar | Array<string\|object> | Array of sidebar definitions | 
| label | string | Text to show in sidebar | 
| path  | string | path where topic is generated. The path is relative to parent item's path. The top default parent path is `docs`
| id | string | topic basename | slugified value of label
| slug | string | path to associate to item |
| headings | Array<string\|object> | Headings to include on topic page
| order | Object: {by: (label\|id); direction?: (asc\|desc)} | Indicates how items of a category or headings in a topic are ordered. | When by is specified, direction is asc by default
| items | Array<string\|object>| List of items in a category or sub-headings of heading
| frozen |||
| hidden | boolean | | false
| autofolder | boolean | | false
| autoindex | boolean | | false
| autobrief | boolean | | false
| index | | |
| brief | string | | 
| title | string | | value of label

## Build Skelosaurus skeleton documentation

1. `skeleton.outline.yml` has the documentation outline.
2. Run `npm run build-doc`


