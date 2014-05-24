# broccoli-html2js 

Converts AngularJS templates to JavaScript

#### Installation
```js
nmp install broccoli-html2js 
```
#### Example
```js
templates = html2js(tree, {
  module: 'Bookmarks.views',     // optional
  replace: function (path) {     // optional 
    return path;
  },
  htmlmin: {},                  // optional (see more options on https://github.com/kangax/html-minifier)
  inputFiles: ['*.html'],       // required
  outputFile: '/templates.js'   // required
});
```
#### Options
...

#### Todo
...
