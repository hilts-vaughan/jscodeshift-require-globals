# jscodeshift-require-globals
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

# What does this do?

It'll scan your code given a file and a list of known global tokens and try and add the imports you're missing for you, based on some known mapping.
Some sane defaults are provided but are not the only choices.
