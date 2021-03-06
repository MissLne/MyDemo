const prodPlugins = []
if(process.env.NODE_ENV === 'production') {
  prodPlugins.push('remove')
}

module.exports = {
  "presets": [
    "@vue/cli-plugin-babel/preset"
  ],
  "plugins": [
    [
      "component",
      {
        "libraryName": "element-ui",
        "styleLibraryName": "theme-chalk"
      }
    ],
    ...prodPlugins,
    '@babel/plugin-syntax-dynamic-import'
  ]
}