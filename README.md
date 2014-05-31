# broccoli-html2js 

Converts AngularJS templates to JavaScript

### Installation
```shell
nmp install broccoli-html2js 
```

### Options
#### inputFiles
Type: `Array`  
Default: `[]`

Source files (supports `html`, `jade`)

#### outputFile
Type: `String`  
Default: `''`

Output file (supports `js`, `coffee`)

#### replace
Type: `Function`  
Default: `undefined`

Function that will apply for each filepath

```js
replace: function (filepath) {
  return filepath.replace(/\.jade/g, '.html');
}
```

#### module
Type: `String`  
Default: `''`

Parent module name

#### singleModule
Type: `Boolean`  
Default: `false`

Wraps all templates in a single module.

#### htmlmin
Type: `Object`  
Default: `{}`

See more options on https://github.com/kangax/html-minifier

### Example
```js
templates = html2js(tree, {
  inputFiles: ['*.html', '*.jade'],
  outputFile: '/templates.js'      // or templates.coffee
});
```
### Release History

0.0.3 - Add support for CoffeeScript, Jade, option `singleModule` (for placing all templates in a single module).

0.0.2 - Small changes

0.0.1 - Init project
