/*
 * Created on Sun Jun 25 2023
 *
 * Copyright (c) 2023 ioncakephper
 */
const { existsSync, readFileSync } = require('fs');
const yamljs = require('yamljs')
const path = require('path')
const hbsr = require('hbsr')
const { isArray, isString, isObject, isEmpty, isNull, isUndefined, isBoolean } = require('lodash')
const { saveDocument, slug } = require('file-easy')

const { INFO } = {
    "INFO": "INFO"
}

/**
 * The function logs a message if the verbose parameter is true.
 * @param type - The type of log message (e.g. "error", "warning", "info").
 * @param message - The message parameter is a string that represents the log message that needs to be
 * printed.
 */
function appLog(type, message, { verbose }) {
    if (verbose) {
        console.log(message)
    }
}

/**
 * The function builds a category object with a label and items, and sets a parent path option.
 * @param item - The `item` parameter is an object that represents a category in a sidebar. It has the
 * following properties:
 * @param [options] - `options` is an object that contains additional configuration options for the
 * `buildCategory` function. It has a default value of an empty object `{}`. The function uses object
 * destructuring to merge the default options with any options passed in as an argument.
 * @returns The function `buildCategory` is returning an object with three properties: `type`, `label`,
 * and `items`. The `type` property is set to the string "category", the `label` property is set to the
 * value of `item.label`, and the `items` property is set to the result of calling the
 * `buildSidebarItems` function with `item.items` and `options
 */
function buildCategory(item, options = {}) {
    options = {
        ...options,
        ...{ parentPath: path.join(options.parentPath, item.path || '') }
    }
    let isAutoIndex = isUndefined(item.autoindex) ? false : (isBoolean(item.autoindex) ? item.autoindex : false)
    if (isAutoIndex) {
        let result = {
            type: "category",
            label: item.label,
            items: buildSidebarItems(orderItems(item.items, item.order), options),
            link: {
                type: "generated-index",
                title: item.title || item.label,
                description: item.description || item.brief
            }
        }
        appLog(INFO, `Created autoindex category: ${JSON.stringify(result), null, 4}`, options)
        return result;
    }

    let isIndex = isUndefined(item.index) ? false : isString(item.index)
    if (isIndex) {
        let indexItem = {
            label: item.label,
            id: item.index,
            hidden: true,
            frozen: "exists",
            path: getSluggedPath(item.label)
        }
        item.items.unshift(indexItem);
        let result = {
            type: "category",
            label: item.label,
            items: buildSidebarItems(orderItems(item.items, item.order), options),
            link: {
                type: "doc",
                id: path.join(getSluggedPath(item.path), getSluggedPath(item.label), slug(item.index)).replace(/\\/ig, '/'),
                description: item.description || item.brief
            }
        }

        appLog(INFO, `Created category with index file: ${JSON.stringify(result), null, 4}`, options)
        return result;
    }
    let result = {
        type: "category",
        label: item.label,
        items: buildSidebarItems(orderItems(item.items, item.order), options)
    }
    appLog(INFO, `Created standard category: ${JSON.stringify(result, null, 4)}`, options)
    return result;
}


/**
 * The function builds headings for a given list of items with a specified level and options.
 * @param items - an array of items to be turned into headings
 * @param [level=2] - The level parameter specifies the heading level to be generated. By default, it
 * is set to 2, which means that the function will generate H2 headings. However, it can be changed to
 * any other integer value to generate headings of different levels.
 * @param [options] - An object containing additional options for the function. It has a default value
 * of an empty object if not provided.
 * @returns The function `buildHeadings` returns a string that contains HTML headings based on the
 * input `items` array. The headings are generated using a Handlebars template called "heading" and are
 * nested based on the order of the items in the array. The level of the headings can be specified
 * using the `level` parameter, and additional options can be passed in using the `options` parameter.
 */
function buildHeadings(items, level = 2, options = {}) {

    items = items.map(item => normalizeItem(item));
    return items.map(item => {


        hbsr.options.template_path = options.templates;
        return hbsr.render_template('heading', {
            ...item,
            ...{
                prefix: "#".repeat(level),
                itemHeadings: buildHeadings(orderItems(item.items, item.order), level + 1, options)
            }
        })

    })
        .join("\n")
}


/**
 * The function builds a sidebar based on the provided definition and options.
 * @param sidebarDef - an object that defines the structure of a sidebar in a documentation website. It
 * contains information such as the items to be displayed in the sidebar and whether the sidebar is
 * autogenerated or not.
 * @param options - An object containing additional options for building the sidebar. It can include
 * the following properties:
 * @returns an array of sidebar items, either autogenerated or manually defined, based on the input
 * parameters. If the `autogenerated` property is true, it returns an array with a single object
 * containing the `type` property set to `"autogenerated"` and the `dirName` property set to the value
 * of `sidebarDef.autogenerated`. Otherwise, it generates a normal sidebar by calling the
 */
function buildSidebar(sidebarDef, options) {
    let { items, autogenerated, order } = sidebarDef;

    if (autogenerated) {
        return [{ type: "autogenerated", dirName: `${sidebarDef.autogenerated}` }]
    }

    // Generate normal sidebar. Initiate parentPath with sidebar's path attribute or space.
    options = {
        ...options,
        ...{ parentPath: sidebarDef.path || '' }
    }
    items = orderItems(items, order)
    return buildSidebarItems(items, options);

}

/**
 * The function sorts an array of objects based on a specified property and direction.
 * @param [items] - An array of objects representing items to be sorted.
 * @param order - The `order` parameter is an object that specifies how the `items` array should be
 * sorted. It has two properties:
 * @returns The function `orderItems` is returning a sorted array of items based on the `by` property
 * of the `order` object and the `direction` property (which defaults to "asc" if not provided). If the
 * `order` parameter is not an object, the function returns the original `items` array.
 */
function orderItems(items = [], order) {
    if (!isObject(order)) {
        return items;
    }
    let { by, direction } = order;
    direction = direction || "asc";

    return items.sort((a, b) => {
        let s = direction === "asc" ? 1 : -1;

        let r;
        if (a[by] < b[by]) return r = -1 * s;
        if (a[by] > b[by]) return r = 1 * s;
        return 0

    })
}

/**
 * The function loads and normalizes a YAML file containing sidebar items for an outline.
 * @param outlineFilename - The parameter `outlineFilename` is a string that represents the filename of
 * a YAML file containing an outline of a document or a website. This function loads the outline from
 * the file and returns an array of normalized sidebar items.
 * @returns The function `loadOutlineSidebars` is returning an array of sidebar items that have been
 * normalized. The sidebar items are loaded from a YAML file specified by the `outlineFilename`
 * parameter. If the file cannot be loaded or does not exist, an empty array is returned.
 */
function loadOutlineSidebars(outlineFilename) {
    let body = yamljs.load(outlineFilename) || { sidebars: [] }
    let items = body.sidebars || [];
    items = items.map(item => normalizeItem(item));
    return items;
}

/**
 * The function loads a configuration file and returns its contents as a JSON object, or an empty
 * object if the file does not exist.
 * @param configurationFilename - The parameter `configurationFilename` is a string that represents the
 * name or path of the configuration file that needs to be loaded.
 * @returns If the `configurationFilename` file does not exist, an empty object `{}` is returned.
 * Otherwise, the contents of the file are parsed as JSON and returned as an object.
 */
function loadConfigurationFile(configurationFilename) {
    if (!existsSync(configurationFilename)) {
        return {}
    }
    // Reads the configuration file and converts it to a vaguely valid Syncthing
    let r = JSON.parse(readFileSync(configurationFilename, "utf-8"));
    if (!isObject(r)) {
        throw new Error("Incorrect configuration: it should be an object");
    }
    return r;
}

/**
 * The function normalizes an input item object by adding a label property if it doesn't exist, mapping
 * any nested items or headings, and ensuring the items property exists even if empty.
 * @param item - The `item` parameter is a variable that can be of type string or object. It represents
 * an item that needs to be normalized. The function `normalizeItem` takes this item and returns a
 * normalized version of it.
 * @returns The function `normalizeItem` returns a normalized version of the input `item`. The
 * normalized version is an object with a `label` property and may also have `items` and `headings`
 * properties. If the input `item` is a string, it is converted to an object with a `label` property.
 * If the input `item` is an object without a `label` property
 */
function normalizeItem(item) {
    item = (typeof item === 'string') ? { label: item } : item;
    if (typeof item === "object") {
        let hasLabel = Object.keys(item).includes("label")
        // Convert item to a normal item. This is the inverse of normalizeItem ()
        if (!hasLabel) {
            let label = Object.keys(item)[0];
            let attr = item[label];
            item = {
                ...{ label: label }
            }
            if (isArray(attr)) {
                item = {
                    ...{ label: label },
                    ...{ items: attr.map(e => normalizeItem(e)) }
                }
            } else {
                item = {
                    ...item,
                    ...attr
                }
            }
        }
    }

    item = {
        ...{ items: [] },
        ...item,
    }

    if (item.headings) {
        if (!isArray(headings)) {
            throw new Error("Unexpected item type. Expected item type: array")
        }
        item = {
            ...item,
            ...{ headings: item.headings.map(e => normalizeItem(e)) }
        }


    }

    if (item.items) {
        item = {
            ...item,
            ...{ items: item.items.map(e => normalizeItem(e)) }
        }
    }

    return item;
}

/**
 * The function builds a sidebar menu from a list of items and options.
 * @param [items] - An array of objects representing the items to be included in the sidebar. Each
 * object can have a "label" property and either a "href" property (for a link) or an "items" property
 * (for a category with sub-items).
 * @param [options] - An object that contains optional parameters for the function. It can have the
 * following properties:
 * @returns The function `buildSidebarItems` returns an array of objects that represent the items in a
 * sidebar. The items can be of two types: `link` or `category`. If an item has a `href` property, it
 * is of type `link` and its `label` and `href` properties are returned. If an item does not have a
 * `href` property but has an `
 */
function buildSidebarItems(items = [], options = {}) {
    return items.map(item => {
        if (Object.keys(item).includes('href')) {
            return {
                type: "link",
                label: item.label,
                href: item.href,
            }
        }
        if (isEmpty(item.items)) {
            let { hidden } = item;
            let isHidden = isUndefined(hidden) ? false : (isBoolean(hidden) ? hidden : false)
            let topic = buildTopic(item, options);
            return !isHidden ? topic : null
        }

        return buildCategory(item, options);
    })
        .filter(item => !isNull(item));
}


/**
 * The function builds a topic and returns its path.
 * @param item - The `item` parameter is an object that represents a topic. It likely contains
 * properties such as `title`, `description`, `path`, and `id`.
 * @param [options] - `options` is an optional object parameter that can be passed to the `buildTopic`
 * function. It contains additional configuration options that can be used to customize the behavior of
 * the function. If no `options` object is provided, an empty object will be used as the default value.
 * @returns the `topicBasename` variable, which is a string representing the path to the topic document
 * that was created using the `createTopicDocument` function.
 */
function buildTopic(item, options = {}) {

    let parentPath = getSluggedPath(options.parentPath);
    let itemPath = getSluggedPath(item.path)
    let itemBasename = slug(getItemId(item))
    let topicBasename = path.join(parentPath, itemPath, itemBasename)

    let frozen = item.frozen || '';
    let isFrozen;
    switch (frozen.trim().toLowerCase()) {
        case "locked":
            isFrozen = true;
            break;
        case "exists":
            isFrozen = existsSync(path.join(options.docs, topicBasename + '.md'));
            break;
        default:
            isFrozen = false;
    }
    if (!isFrozen) {
        createTopicDocument({ topicBasename, item, options })
    }
    return topicBasename.replace(/\\/ig, '/');
}

/**
 * The function creates a Markdown document for a given topic with specified options and saves it to a
 * specified directory.
 */
function createTopicDocument({ topicBasename, item, options }) {

    hbsr.options.template_path = options.templates;
    let topicContent = hbsr.render_template('topic', {
        ...item,
        ...{ title: item.title || item.label },
        ...{ slug: getSluggedPath(item.slug) },
        ...{ itemHeadings: buildHeadings(orderItems(item.headings || [], item.order), 2, options) }
    })

    let topicFilename = path.join(options.docs, topicBasename + ".md")
    saveDocument(topicFilename, topicContent)
    appLog(INFO, `Created topic file: ${topicFilename}`, options)
}




/**
 * The function takes a path string and returns a slugged version of it.
 * @param [pathString] - The pathString parameter is a string that represents a file path. It can
 * contain one or more directory names separated by forward slashes (/).
 * @returns The function `getSluggedPath` returns a string that is the input `pathString` with each
 * segment of the path slugified (converted to a URL-friendly format) and joined back together with
 * forward slashes. If the input `pathString` is not a string or an array, an error is thrown.
 */
function getSluggedPath(pathString = '') {
    let parts = (isString(pathString)) ? pathString.trim().split('/') : pathString;
    if (!isArray(parts)) {
        throw new Error("Incorrect path string type")
    }
    return parts
        .map(p => {
            return p.startsWith('.') ? p : slug(p)
        }
        )
        .join('/')
}

/**
 * The function returns the id property of an item object, or the label property if id is not defined.
 * @param item - The "item" parameter is an object that represents an item in a list or collection. It
 * may have an "id" property or a "label" property, or both. The function "getItemId" returns the value
 * of the "id" property if it exists, or the value of the
 * @returns The function `getItemId` returns the `id` property of the `item` object if it exists,
 * otherwise it returns the `label` property.
 */
function getItemId(item) {
    return item.id || item.label;
}


module.exports = {
    appLog,
    buildCategory,
    buildHeadings,
    buildSidebar,
    buildSidebarItems,
    buildTopic,
    createTopicDocument,
    getItemId,
    getSluggedPath,
    loadConfigurationFile,
    loadOutlineSidebars,
    normalizeItem,
}