const fs = require('fs')
const path = require('path')

let entityToExamplePath = {}

// This is a simple TypeDoc plugin that checks reflections for
// external code example files, then pastes any to the reflection's
// 'example' property, which can be accessed in a custom TypeDoc
// theme.
// 
// Use typedoc with --plugin /path/to/this/plugin/directory and
// pass the plugin --examplesPath flag to specify the examples
// directory.
// 
// --examplesPath can take a comma-separated list of paths.
// If examples for the same entity are found in multiple
// example paths, the one in the earliest path will win.
// 
// Name examples in the directory after any entity that you
// want to attach a code example to. For example, if you have a
// class FooBarBaz that needs a code example, add the code
// example file FooBarBaz.js to the examples directory.
// 
// NOTE: To enable external verification/testing of the code
// examples, examples are expected to follow the format:
// 
// 1 function example(...) {\n
// 2   // example
// .   // body
// .   // ...
// N }\n
// 
// -- where the numbers indicate the line number and the line 
// starting at "function..." is unindented.
// 
// This plugin will not parse the JS code. It will treat the source
// as a string and strip the first and last lines and unindent the
// function body. That body will be wrapped in triple backticks 
// (i.e. code block) and pasted to the reflection's 'example'
// property for later use, e.g. in a custom theme's comment.hbs:
// 
// // comment.hbs
// {{#with comment}}
//   {{#if example}}
//     <h1>Example</h1>
//     {{#markdown}}{{{example}}}{{/markdown}}
//   {{/if}}
//   ...
// {{/with}}

module.exports = function(plugins, callback) {
  const app = plugins.application

  app.options.addDeclaration({
    name: 'examplesPath',
    help: 'Path to code examples',
    defaultValue: './'
  })

  app.converter.on('resolveBegin', (context) => {
    const examplesPaths = app.options.getValue('examplesPath').split(',')
    examplesPaths.reverse()
    examplesPaths.map((examplePath) => {
      const examples = fs.readdirSync(examplePath)
      const examplesFound = []
      examples.map((filename) => {
        const parsedName = path.parse(filename)
        if (parsedName.ext !== '.js') {
          return
        }
        entityToExamplePath[parsedName.name] = examplePath + '/' + filename
        examplesFound.push(filename)
      })
      console.log(`Examples found in ${examplePath}:`, examplesFound)
    })
    console.log('Final examples source:', entityToExamplePath)
  })

  app.converter.on('resolveReflection', (context, reflection) => {
    switch (reflection.kindString) {
      case 'Constructor signature':
      case 'Method': // Capture 'Call signature' instead as it has the comment
      case 'Parameter':
      case 'Type parameter':
      case 'Enumeration member':
      case 'Index signature':
      case 'Type literal':
        return
    }

    let name
    if (reflection.kindString === 'Call signature') {
      // Special case: get the name from the parent (Method)
      name = reflection.parent.getFullName()
    } else {
      name = reflection.getFullName()
    }

    const examplePathForName = entityToExamplePath[name]

    if (!examplePathForName) {
      return
    }

    const {comment} = reflection

    if (!comment) {
      console.warn('Found example for ' + name + ', but this entity has no comment. Skipping.')
      return
    }

    if (!comment.tags) {
      comment.tags = []
    }

    const file = fs.readFileSync(examplePathForName, 'utf8')

    // Expect example files to look like:
    // 
    // 1 function example(...) {\n
    // 2   // example
    // .   // body
    // .   // ...
    // N }\n
    // 
    // i.e. first line is function declaration, last line is closing brace, and 
    // middle lines are the indented function body.
    // 
    // This plugin will not parse the JS code. It will treat the source as a string
    // and strip the first and last lines and unindent the function body.
    // 
    const lines = file.split('\n')
    lines.splice(0, 1)
    lines.splice(-1, 1)
    const exampleBody = lines.map(line => line.substring(2)).join('\n')
    console.log('Applying code example to ' + name)
    reflection.comment.tags.push({
      tagName: 'example',
      paramName: '',
      text: '```\n' + exampleBody + '\n```',
    })
  })
}
