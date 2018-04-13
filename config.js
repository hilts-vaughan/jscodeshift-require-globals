const isGlobal = require('nuclide-format-js/lib/common/utils/isGlobal');
const jscs = require('jscodeshift');

const permissiveLooseRequire = [
    // Handle general generic requires, e.g: `Backbone = require('Backbone');` with almost no restrictions to make things easier
    {
      searchTerms: [jscs.VariableDeclaration],
      filters: [
        path => {
            return true
        }
      ],
      comparator: (node1, node2) =>  0 // we don't care about the order, we can use something to fix this later,
                                         // such as eslint or require re-ordering scripts to fix this, not the job of this script
    }
  ];

module.exports = permissiveLooseRequire;