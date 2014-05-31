
'use strict';

var Writer   = require('broccoli-writer'),
    _HTML2JS = require('./lib/html2js');

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
  this.inputFiles   = this.options.inputFiles || [];
  this.outputFile   = this.options.outputFile || '';
  this.singleModule = this.options.singleModule || false;
  this.module       = this.options.module || '';

  _HTML2JS.validate(this.options);
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
    _HTML2JS.generate(this, srcDir, destDir);
  }.bind(this));
};

module.exports = HTML2JS;