#! /usr/bin/env node

/*
 * Created on Sun Jun 25 2023
 *
 * Copyright (c) 2023 ioncakephper
 */
const program = require('commander');
const {
    appLog,
    buildSidebar,
    loadConfigurationFile,
    loadOutlineSidebars,
} = require('../lib');
const path = require('path');
const { saveDocument} = require('file-easy');
const { globSync } = require('glob')
const {isEmpty} = require("lodash")
const hbsr = require('hbsr')

let { name, version, description } = require("../package.json");

let {INFO} = {
    "INFO": "INFO"
}
program
    .name(name)
    .description(description)
    .version(version)

    .command("build", { isDefault: true })
    .argument('[inputPattern...]', 'pattern for outline file', [])
    .description("build documentation files and sidebar structure file for Docusaurus-based sites")
    .option('-c, --config <filename>', 'name of the configuration file', `${name}.json`)
    .option('-d, --docs <path>', 'path to documentation files root folder', 'docs')
    .option('-s, --sidebar <filename>', 'name (optional path) of the sidebar structure file', 'sidebars.js')
    .option('-t, --templates <path>', 'path to topic and heading templates', `${path.join(__dirname, '..', 'templates')}`)
    .option('-v, --verbose', 'log progress messages')


    .action((inputPattern, options) => {

        let defaultOptions = {
            files: [
                "*.outline.yml",
                "*.outline.yaml",
                "__outlines__/**/*.yaml",
                "__outlines__/**/*.yml",
            ]
        }
        options = {
            ...defaultOptions,
            ...options,
            ...loadConfigurationFile(options.config)
        }
        appLog(INFO, `Processed configuration file: ${options.config}`, options)

        

        /* This code block is responsible for gathering the file patterns provided as command line arguments
        or using the default file patterns from the options. It then uses the `globSync` function to find
        all the files that match the patterns. The found files are stored in the `allFiles` array. */
        let patterns = (!isEmpty(inputPattern) ? inputPattern : options.files);
        let allFiles = []
        patterns.forEach(pattern => {
            let localFiles = globSync(pattern);
            localFiles.forEach(f => {
                allFiles.push(f)
            })
        })        
        allFiles = allFiles.filter(p => !isEmpty(p.trim()));

        let files = []
        allFiles.forEach(item => {
            if (!files.includes(item)) {
                files.push(item)
            }
        })
        appLog(INFO, `Outline outline names: ${JSON.stringify(files, null, 4)}`, options)

        let docSidebarDefs = [];
        for (const outlineFilename of files) {
            let localSidebarDefs = loadOutlineSidebars(outlineFilename)
            localSidebarDefs.forEach(item => {
                docSidebarDefs.push(item)
            })
        }

        let allSidebars = {};
        for (const sidebarDef of docSidebarDefs) {

            let {label} = sidebarDef;
            allSidebars[label] = buildSidebar(sidebarDef, options)
        }
        appLog(INFO, `Sidebars created: ${JSON.stringify(Object.keys(allSidebars), null, 4)}`, options)

        hbsr.options.template_path = options.templates;
        let content = hbsr.render_template('sidebars', {content: `${JSON.stringify(allSidebars, null, 4)}`})

        saveDocument(options.sidebar, content)
        appLog(INFO, `Created sidebar file: ${options.sidebar}`, options)

    });

// program.parse("node sk3 help build".split(" "))
// program.parse("node sk3 ../docusaurus-projects/doc-sample/several-prods.outline.yml -d ./website/docs -s ./website/sidebars.js --verbose".split(" "))
program.parse("node sk3 *.outline.yml __outlines__/**/*.yml --verbose".split(" "))
// program.parse()
