const {saveDocument, slug} = require("file-easy");
const hbsr = require('hbsr')

products = [
    {
        label: "Getting started"
    },
    {label: "Account and profile"},
]
products.forEach(product => {
    let label = product.label;
    let productOutlineContent = hbsr.render_template('product-outline', {label})
    let productOutlineFilename = `${slug(label)}.outline.yml`
    saveDocument(productOutlineFilename, productOutlineContent)
})

// generate outline for docs

let docsOutlineContent = hbsr.render_template('docs-outline', {products: products.map(p => {
    return {
        ...p,
        ...{
            path: slug(p.label)
        },
    } 
})})
saveDocument("docs.outline.yml", docsOutlineContent);

let productOutlineFilenames = products.map(product => {
    let {label} = product;
    return `${slug(label)}.outline.yml`
})  
productOutlineFilenames.push('docs.outline.yml')
saveDocument("docs-config.json", JSON.stringify({
    files: productOutlineFilenames
}, null, 4))
let command = `skelo -c docs-config.json`;
console.log(command)

 

