const JSDOM = require('jsdom').JSDOM

const template = `
<div class="button-code-block">
  <div class="copyable-code-block"></div>
  <div class="button-row">
    <a class="code-button--copy code-button" role="button">
      copy
    </a>
  </div>
  <div class="highlight">
  </div>
</div>
`

// The generated HTML by marked does not distinguish
// code blocks (```...```) from inline code (`...`)
// except by wrapping them in a <pre>. This plugin
// adds the code-copy button HTML to <code> found in <pre>.
module.exports = function(plugins, callback) {
  const app = plugins.application

  app.renderer.on('parseMarkdown', (event) => {
    const dom = new JSDOM(event.parsedText)
    const {document} = dom.window
    document.querySelectorAll('pre > code').forEach(code => {
      const pre = code.parentElement
      const parent = pre.parentElement
      if (!parent || parent.className === 'highlight') {
        // already done for this pre
        return
      }
      const instance = new JSDOM(template)
      const instanceDocument = instance.window.document
      const block = instanceDocument.querySelector('div.button-code-block')
      parent.replaceChild(block, pre)
      const highlight = block.querySelector('div.highlight')
      highlight.appendChild(pre)
    })

    event.parsedText = dom.serialize()
  })
}
