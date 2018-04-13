const fs = require('fs')
const imports = require('jscodeshift-imports');
const permissiveRequireConfig = require('./config.js')

/**
 * This is used for importing required files from some global package token list. The list is hard-coded into this file for now for testing but we will
 * need to load it from another source at some point.
 */

let DEFAULT_GLOBAL_TOKEN_MAPPING_LIST = {
    '_': 'lodash'
}

const checkIdentifierForImportListing = (importListing, identifier) => {
    if(!importListing.hasOwnProperty(identifier)) {
        return false;
    }

    const item = importListing[identifier];
    return item != null;
}


module.exports = function(fileInfo, api, options) {
    const originalSource = fileInfo.source;

    const {jscodeshift} = api;
    const {statement} = jscodeshift.template;

    // Get the global config if possible
    const configPath = options && options instanceof Object && options.globals || DEFAULT_GLOBAL_TOKEN_MAPPING_LIST;
    const config = JSON.parse(fs.readFileSync(configPath))

    const plugins = imports.createPlugins(permissiveRequireConfig);

    jscodeshift.registerMethods({
      addBasicImport: plugins.addImport,
    });

    const requiredImportTokens = new Set();
    let builder = jscodeshift(fileInfo.source);
    builder.find(jscodeshift.Identifier)
    .forEach(path => {
        const identifier = path.node.name;
        const isGlobalToken = checkIdentifierForImportListing(config, identifier);
        if(isGlobalToken) {
            requiredImportTokens.add(identifier);
        }
    })

    // // Need to assign the builder to get the right output
    let newBuilder = jscodeshift(originalSource);
    requiredImportTokens.forEach((tokenIdentifier) => {
        // TODO: I seriously tried to get the `addImport` working but it was not working after many attempts
        // it looks like it's broken inside of an newer version of jscodeshift. I'll revisit this later
        // since for this project string injection at the right point is enough.
        
        const requireStatement = `const ${tokenIdentifier} = require('${config[tokenIdentifier]}');`;
        newBuilder.get().node.program.body.unshift(requireStatement);  

        // This is the old plugin I tried to use and it did not work, you can revisit later if needed
    //     newBuilder.addBasicImport(statement`
    //     var A0 = require('A0');
    //   `);
    });

    return newBuilder.toSource();
}