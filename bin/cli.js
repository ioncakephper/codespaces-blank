const program = require('commander');
const {
    buildSidebar,
    loadOutlineSidebars,
    loadConfigurationFile,
} = require('../lib');
const { saveDocument} = require('file-easy');
const { globSync } = require('glob')

let { name, version, description } = require("../package.json");

program 
    .name(name)
    .description(description)  
    .version(version)

    .command("build", { isDefault: true })
    .description("build documentation files and sidebar structure file for Docusaurus-based sites")
    .option('-c, --config <filename>', 'name of the configuration file', `${name}.json`)
    .option('-d, --docs <path>', 'path to documentation files root folder', 'docs')
    .option('-s, --sidebar <filename>', 'name (optional path) of the sidebar structure file', 'sidebars.js')
    // .option('--defaultExtension <extension>', 'default last extension of the outline file', '.yml')
    .option('-v, --verbose', 'log progress messages')


    .action((options) => {

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
        let files = []
        options.files.forEach(pattern => {
            let localFiles = globSync(pattern);
            localFiles.forEach(f => {
                files.push(f)
            })
        })
    
        let docSidebarDefs = [];
        for (const outlineFilename of files) {
            let localSidebarDefs = loadOutlineSidebars(outlineFilename)
            localSidebarDefs.forEach(item => {
                docSidebarDefs.push(item)
            })
        }
        // console.log(JSON.stringify(docSidebarDefs, null, 4))
    
        let allSidebars = {};
        for (const sidebarDef of docSidebarDefs) {
    
            let {label} = sidebarDef;
            allSidebars[label] = buildSidebar(sidebarDef, options)
        }
    
        let content = `module.exports = ${JSON.stringify(allSidebars, null, 4)}`;
        // console.log(content)
        // 
        saveDocument(options.sidebar, content)
    
    });

// program.parse("node skelo help build".split(" "))
// program.parse("node skelo ".split(" "))
program.parse() 
 