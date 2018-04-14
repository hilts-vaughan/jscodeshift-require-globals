# jscodeshift-require-globals
**Blog Post to learn more:** [vaughanhilts.me](http://vaughanhilts.me/2018/04/13/automating-adding-missing-require-statements-for-globals-using-jscodeshift.html)

A JSCodeShift to help you import your globals that you've been misusing and then bring them into the code. 

If you've ever run into code like this:

```

class Parser {
   hasSomeValidToken() {
      const allowedTokens = ['do', 'change', 'something else']
      return _.any(allowedTokens, this.tokensAllowed);
   }
}

```
... for example, where `_` is global and missing -- you may want to run this tool. Linters are generally unhappy about this and many bundlers that
are used nowadays won't be very happy with it either. 

# What's the quick pitch?

It's not going to fix all your missing requires. But if you have code that is using something over and over, such as `Backbone` and you have chosen not to use `require('Backbone')` everywhere -- this can help you clean up that mess if you need to start moving towards something like Webpack and need the `import` statements sorted out. 

# What does this do?

It'll scan your code given a file and a list of known global tokens and try and add the imports you're missing for you, based on some known mapping. There are very few defaults provides because this is going to be very project dependant. However, adding imports across 100s of files if your project is quite large can be painful and scanning for them is going to be anything but easy.

So, this tool will help you speed some of this along.

To get an idea, consider the following input:

```
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
}

// Not listed in the global token, so it should not appear in the output at all
// since we don't have it listed there
class SomeView extends Marionette.ItemView {
    constructor() {
        // do something here
    }
}
```

... there's quite a few globals in here that have not been imported. After we run this with the following `globals.json`:

```
{
    "Backbone": "Backbone",
    "_": "underscore",
    "moment": "moment",
    "$": "jquery",
    "jQuery": "jquery"
}
```

... then we end up with something like:

```
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
```

Things to note:

1. Comments were ignored -- so you don't import things that were not `Identifier`'s -- something a little harder to do (or a lot harder) with just a regexp

2. You get context -- and you can organize your imports after the fact.

# How do I use it?

1. You will need to install `jscodeshift`, you can get it from `npm` if you want by using `npm install -g jscodeshift` or if you are using `yarn`, you can get it there instead as well.
2. Check this out or get the NPM module -- and then run it. 
3. You can include a set of global prefixes in a JSON format by doing something like this:

```
{
    "Backbone": "Backbone",
    "_": "underscore",
    "moment": "moment",
    "$": "jquery",
    "jQuery": "jquery"
}
```

... and then passing it in as an option. You can run the command like so, assuming you have checked out this repo and then need to run the command:

`jscodeshift input.js -t jscodeshift-require-globals/index.js --globals=/run/data/globals.json`

... and your imports will be fixed based on the config you have provided. Once you are done, you should also run as a follow up something like [`rm-require`](https://github.com/cpojer/js-codemod/blob/master/transforms/rm-requires.js) when are you done as a follow up to remove extra imports and to organize them.

Then, review the diff and commit it. Happy saving labour!

# I found a bug!

1. If it just imported more than was needed, this is probably not a bug. It is expected you can run something through `rm-require` after to clean things up -- this is laser focused to keep things simple. 

2. Make sure you are using your own `global.json` for your own needs -- the example one is not even close to enough to get most projects sorted out.

3. Still have a problem? File and issue. 
