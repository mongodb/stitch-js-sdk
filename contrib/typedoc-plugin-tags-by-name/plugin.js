
// This TypeDoc plugin adds a `tagsByName` property to reflections
// with comments. `tagsByName` is an object where the keys are
// the tag names and the values are objects of the following shape:
// {
//   name: name of the tag
//   prettyName: human-readable name with correct capitalization and pluralization
//    if found in the default config or the one specified by --tagPrettyNameConfigPath
//   tags: array of CommentTags
// }
// @param tags are not included.
// 

let prettyNameConfig = {
  'example': ['Example', 'Examples'],
  'see': 'See Also',
}

function addPrettyNamesToTags(tagsByName) {
  for (let name in tagsByName) {
    const prettyName = prettyNameConfig[name]
    if (!prettyName) {
      continue
    }

    const entry = tagsByName[name]

    if (typeof prettyName === 'string') { // No plural
      entry.prettyName = prettyName
      continue
    }

    if (!Array.isArray(prettyName)) {
      console.warn(`Ignoring invalid entry for ${name} in tagPrettyNameConfig:`, prettyName)
      continue
    }

    if (prettyName.length === 1) {
      entry.prettyName = prettyName[0]
      continue
    }

    if (prettyName.length !== 2) {
      console.warn(`Ignoring invalid entry for ${name} in tagPrettyNameConfig: expected array length of 1 (['singular']) or 2 (['singular', 'plural']), got`, prettyName)        
    }

    const usePlural = entry.tags.length > 1
    entry.prettyName = prettyName[usePlural ? 1 : 0]
  }
}

module.exports = function(plugins, callback) {
  const app = plugins.application

  app.options.addDeclaration({
    name: 'tagPrettyNameConfigPath',
    help: 'Path to tag pretty name configuration json',
    defaultValue: undefined
  })

  app.converter.on('resolveBegin', (context) => {
    const prettyNameConfigPath = app.options.getValue("tagPrettyNameConfigPath")
    if (!prettyNameConfigPath) {
      console.log('--tagPrettyNameConfigPath unspecified. Using default config:', prettyNameConfig)
      return
    }
    prettyNameConfig = JSON.parse(fs.readFileSync(prettyNameConfigPath))
    console.log('Loaded tag pretty name config:', prettyNameConfig)
  })

  app.converter.on('resolveReflection', (context, reflection) => {
    const {comment} = reflection

    if (!comment) {
      return
    }

    const {tags} = comment

    if (!tags) {
      return
    }

    const tagsByName = {}

    for (let i in tags) {
      const tag = tags[i]
      const name = tag.tagName

      if (name === 'param') {
        continue
      }

      if (!tagsByName[name]) {
        tagsByName[name] = {
          name,
          tags: []
        }
      }
      tagsByName[name].tags.push(tag)
    }

    addPrettyNamesToTags(tagsByName)

    comment.tagsByName = tagsByName
  })
}
