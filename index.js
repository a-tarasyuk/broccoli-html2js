
'use strict';

var EXTENSIONS = ['html'];

var Writer  = require('broccoli-writer'),
    HTMLmin = require('html-minifier'),
    fs      = require('fs'),
    helpers = require('broccoli-kitchen-sink-helpers'),
    mkdirp  = require('mkdirp'),
    path    = require('path');

var Utils = {

 /**
   * moduleTemplate
   * 
   * @param {String} name
   * @param {Array}  dependencies
   * 
   * @return {String}
   */
  moduleTemplate: function (name, dependencies) {
    return 'angular.module("' + name + '",' 
         +   '[' + (dependencies || []).map(function (e) { return '\'' + e + '\'' }).join(',') + ']'
         + ');';
  },

  /**
   * template
   * 
   * @param {String} name
   * @param {String} content
   * 
   * @return {String}
   */
  template: function (name, content) {
    return 'angular.module("' + name + '", []).run(["$templateCache", function ($templateCache) {' 
         +   '$templateCache.put("' + name + '", ' + content + ');'
         + '}]);';
  },

  /**
   * minify
   * 
   * @param {String} html
   * @param {Object} content
   * 
   * @return {String}
   */
  minify: function (html, options) {
    var content = HTMLmin.minify(html, options.htmlmin || {})
      .replace(/'/g, '\\\'')
      .replace(/"/g, '\\"');

    return '\'' + content + '\'';
  }
};

/**
 * HTML2JS
 *
 * @param {Object} inputTree
 * @param {Object} options
 *
 * @return undefined
 */
function HTML2JS(inputTree, options) {
  if (!(this instanceof HTML2JS)) {
    return new HTML2JS(inputTree, options);
  }

  this.inputTree    = inputTree;
  this.options      = options || {};
  this.inputFiles   = this.options.inputFiles || {};
  this.outputFile   = this.options.outputFile || {};
}

HTML2JS.prototype             = Object.create(Writer.prototype);
HTML2JS.prototype.constructor = HTML2JS;

/**
 * write
 *
 * @param {Object} readTree
 * @param {String} destDir
 *
 * @return {Object}
 */
HTML2JS.prototype.write = function (readTree, destDir) {
  return readTree(this.inputTree).then(function (srcDir) {
    helpers.assertAbsolutePaths([this.outputFile]);

    var destPathDir  = path.join(destDir, path.dirname(this.outputFile)),
        destPathFile = path.join(destDir, this.outputFile),
        files        = helpers.multiGlob(this.inputFiles, {cwd: srcDir});

      files = (files || []).filter(function (file) {
        return typeof (file) === 'string' && ~EXTENSIONS.indexOf(file.split('.').pop());
      }.bind(this));

    mkdirp.sync(destPathDir);

    if (this.options.module) {
      fs.appendFileSync(destPathFile, Utils.moduleTemplate(this.options.module, files));
    }    

    files.forEach(function (filePath) {
      var _filePath = (typeof this.options.replace === 'function') 
                        ? this.options.replace.call(null, filePath) 
                        : filePath,
          content   = Utils.minify(fs.readFileSync(srcDir + '/' + filePath, {encoding: 'utf8'}), this.options);
  
      fs.appendFileSync(destPathFile, Utils.template(_filePath, content));
    }.bind(this));

  }.bind(this));
};

module.exports = HTML2JS;