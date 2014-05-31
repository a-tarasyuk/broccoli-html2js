var HTMLmin   = require('html-minifier'),
    fs        = require('fs'),
    jade      = require('jade'),
    mkdirp    = require('mkdirp'),
    path      = require('path'),
    multiGlob = require('broccoli-kitchen-sink-helpers').multiGlob;

var INPUT_EXTENSIONS  = ['html', 'jade'],
    OUTPUT_EXTENSIONS = ['js', 'coffee'];

var HTML2JS = {

  template: {
    /**
     * module
     * 
     * @param {String} name
     * @param {Array}  dependencies
     * 
     * @return {String}
     */
    module: function (name, dependencies) {
      return 'angular.module("' + name + '",' 
          +    '[' + (dependencies || []).map(function (e) { return '\'' + e + '\'' }).join(',') + ']'
          +  '); \n';
    },

    header: {
      js: function (name) {
        return 'angular.module("' + name + '", []).run(["$templateCache", function ($templateCache) { \n';
      },

      coffee: function (name) {
        return 'angular.module("' + name + '", []).run(["$templateCache", ($templateCache) -> \n'; 
      }
    },

    footer: {
      js: function () {
        return '}]); \n';
      },

      coffee: function () {
        return '  true \n ]) \n';
      }
    },

    content: function (name, content, type) {
      return '  $templateCache.put("' + name + '", ' + content + ')' + ((type === 'js') ? ';' : '') + '\n';
    },
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
  },

  /**
   * toHTML
   *
   * @param {String} content
   *
   * @return {String}
   */
  toHTML: function (content) {
    return jade.render(content, {});
  },

  /**
   * isJade
   * 
   * @param {String} file
   * 
   * @return {Boolean}
   */
  isJade: function (file) {
    return file.split('.').pop() === 'jade';
  },

  /**
   * isAbsolutePaths
   *
   * @params {Array} paths
   *
   * @return {Boolean}
   */
  isAbsolutePaths: function (paths) {
    for (var i = 0, len = paths.length; i < len; i++) {
      if (paths[i][0] !== '/') {
        return false;
      }
    }

    return true;
  },

  /**
   * validate
   * 
   * @param {Object} options
   * 
   * @return undefined
   */
  validate: function (options) {
    var isValidInputExtensions = function (file) {
      return ~INPUT_EXTENSIONS.indexOf(file.split('.').pop());
    };

    if (!Array.isArray(options.inputFiles) || !options.inputFiles.length) {
      throw new Error('"inputFiles" required and can not be empty');
    }

    if (!options.inputFiles.every(isValidInputExtensions)) {
      throw new Error('"inputFiles" is not valid');
    }       

    if (!options.outputFile || typeof (options.outputFile) !== 'string' || !options.outputFile.length) {
      throw new Error('"outputFile" required and can not be empty');
    }
    
    if (!this.isAbsolutePaths([options.outputFile])) {
      throw new Error('Output path must be absolute');
    }

    if (!~OUTPUT_EXTENSIONS.indexOf(options.outputFile.split('.').pop())) {
      throw new Error('"outputFile" is not valid');
    }

    if (options.singleModule && (typeof (options.singleModule) !== 'boolean')) {
      throw new Error('"singleModule" is not valid (must be boolean value only)'); 
    }

    if (options.module && (typeof (options.module) !== 'string')) {
      throw new Error('"module" is not valid (must be string value only)');
    }

    if (options.singleModule && !options.module) {
      throw new Error('if "singleModule" equals true, "module" must not be empty');
    }
  },

  /**
   * generate
   *
   * @param {HTML2JS} _HTML2JS
   * 
   * @return {String}
   */
  generate: function (_HTML2JS, srcDir, destDir) {
    var destPathDir    = path.join(destDir, path.dirname(_HTML2JS.outputFile)),
        destPathFile   = path.join(destDir, _HTML2JS.outputFile),
        files          = multiGlob(_HTML2JS.inputFiles, {cwd: srcDir}),
        options        = _HTML2JS.options,
        targetType     = destPathFile.split('.').pop(),
        isSingleModule = function () {
          return options.module && options.singleModule === true;
        },
        replace        = function (filePath) {
          return (typeof options.replace === 'function') 
              ? options.replace.call(null, filePath) 
              : filePath;
        }

    mkdirp.sync(destPathDir);

    if (isSingleModule()) {
      fs.appendFileSync(destPathFile, this.template.header[targetType](options.module));
    } else if (options.module) {
      fs.appendFileSync(destPathFile, this.template.module(options.module, files.map(replace)));
    }

    files.forEach(function (filePath) {
      var _filePath = replace(filePath),
          _content  = fs.readFileSync(srcDir + '/' + filePath, {encoding: 'utf8'});

      if (this.isJade(filePath)) {
        _content = this.toHTML(_content);
      }

      _content = this.minify(_content, options);

      if (isSingleModule()) {
        fs.appendFileSync(destPathFile, this.template.content(_filePath, _content, targetType));
      } else {
        fs.appendFileSync(destPathFile, this.template.header[targetType](_filePath));
        fs.appendFileSync(destPathFile, this.template.content(_filePath, _content, targetType));
        fs.appendFileSync(destPathFile, this.template.footer[targetType]());
      }
    }.bind(this));

    if (isSingleModule()) {
      fs.appendFileSync(destPathFile, this.template.footer[targetType]());
    }
  }
}

module.exports = HTML2JS;