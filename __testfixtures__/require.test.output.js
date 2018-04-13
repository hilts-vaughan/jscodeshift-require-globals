const Backbone = require('Backbone');
const $ = require('jquery');
const moment = require('moment');
const _ = require('underscore');

class Compiler extends Backbone.Object {
    constructor() {
        this.seed = _.random();
    }

    compile(sourceString) {
        // Use moment here to make sure moment is picked up as a global token if you are using this
        const date = moment().now();

        const compiledSource = Babel.Core.Compile(sourceString)
        this.trigger('compiled:source', compiledSource)

        // Print the time
        console.log(`Finished compiling at ${moment().now} and began at ${date}`)

        // Comments are ignored, i.e: jQuery (I won't be imported)   
    }

    display() {
        // Make sure jQuery can be picked up
        $.dialog.display("Success!");
    }
}

// Not listed in the global token, so it should not appear in the output at all
// since we don't have it listed there
class SomeView extends Marionette.ItemView {
    constructor() {
        // do something here
    }
}