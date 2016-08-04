// var Promise = require('bluebird');
var fileUtils = require('./fileUtils');

var SmartSass = {};

SmartSass.cacheDir = "cacheDir";

/**
 * Get list of files that should be compiled by sass
 * @param sourcePatterns
 * @param targetDirectoryRoot
 */
SmartSass.smartSass = function(sourcePatterns, targetDirectoryRoot){

    // README:
    // I use mock data, so I replace real paths with my own
    sourcePatterns = "sourceDir";
    targetDirectoryRoot = "targetDir";

    _log("---------------------------");
    _log("Source Directory: ", sourcePatterns);
    _log("Target Directory: ", targetDirectoryRoot);

    var filesWhichNeedSass = _getCandidates(sourcePatterns, targetDirectoryRoot);

    _log("File list to compile: ", filesWhichNeedSass);
    _log("---------------------------");

    return filesWhichNeedSass;
};

/**
 * Root method
 * @param sourcePatterns
 * @param targetDirectoryRoot
 * @private
 */
function _getCandidates(sourcePatterns, targetDirectoryRoot) {

    var sourceFileNames = _getFileNamesFromSource(sourcePatterns);

    // pre-compile files
    var precompiledFiles = _precompileFiles(sourceFileNames, sourcePatterns);

    // compare files with cached version
    var candidates = _compareFiles(precompiledFiles, sourcePatterns, targetDirectoryRoot);

    // update cache
    _updateCache(precompiledFiles, sourcePatterns);

    return candidates;
}

/**
 * Returns all sass/scss file names from given directory (without Partials)
 * @param {String} sourcePatterns - source directory
 * @return {Array} file names, doesn't include partials
 * @private
 */
function _getFileNamesFromSource(sourcePatterns) {
    // fetch sass/scss file names that don't start with _ symbol
    // we aren't interested in files that haven't their own compiled representation

    var blackFilter = /^_/; // '_somePartial'
    var fileNames = fileUtils.readFileNames(sourcePatterns, blackFilter);

    _log("Source file names (sass, scss): ", fileNames);

    return fileNames;
}

/**
 * Returns all css file names from target directory
 * @param {String} sourcePatterns - source directory
 * @param {String} targetDirectoryRoot - target directory
 * @return {Array} file names
 * @private
 */
function _getFileNamesFromTarget(targetDirectoryRoot, sourcePatterns) {
    var dirPath = targetDirectoryRoot + "/" + sourcePatterns;
    var fileNames = fileUtils.readFileNames(dirPath);

    _log("Existing Target file names (css): ", fileNames);

    return fileNames;
}

/**
 * Returns all cached pre-compiled sass/scss file names from given directory
 * @param {String} sourcePatterns - source directory
 * @return {Array} file names
 * @private
 */
function _getFileNamesFromCache(sourcePatterns) {
    var dirPath = _getCachePath(sourcePatterns);
    var fileNames = fileUtils.readFileNames(dirPath);

    _log("Cached file names (pre-compiled versions): ", fileNames);

    return fileNames;
}

/**
 * Get cache directory path by source files directory
 * @param {String} sourcePatterns - source directory
 * @return {String} path
 */
function _getCachePath(sourcePatterns) {
    return SmartSass.cacheDir + "/" + sourcePatterns;
}

/**
 * Prepare pre-compiled version for each file name
 * @param {Array} fileNames - file names from source directory
 * @param {String} sourcePatterns - source directory
 * @return {Array} files
 * @private
 */
function _precompileFiles(fileNames, sourcePatterns) {

    var files = [];
    fileNames.forEach(function(fileName) {

        // pre-compile file
        var file = _precompile(fileName, sourcePatterns);

        files.push({
            name: fileName,
            content: file
        });
    });

    return files;
}

/**
 * Find and Concatenate all dependencies of given file into one file
 * @param {String} fileName - file name from source directory
 * @param {String} sourcePatterns - source directory
 * @return {String} file content
 * @private
 */
function _precompile(fileName, sourcePatterns) {

    var precompiledFile = "";
    var fileContent = fileUtils.readFileContent(fileName, sourcePatterns);

    if (!fileContent) {
        return precompiledFile;
    }

    // find all names of partials that used by the sass file
    var dependencies = _analyzeFileForDependencies(fileContent);

    _log("Dependencies for file: ", fileName, " are: ", dependencies);

    var partialsContent = [];
    dependencies.forEach(function(partialName) {
        // I suppose partials are allowed to import another partials...
        // So we need to analyze their content too, and repeat content loading recursively.
        var content = _precompile(partialName, sourcePatterns);
        partialsContent.push(content);
    });

    var allParts = partialsContent.concat(fileContent);
    precompiledFile = _composeFileContent(allParts);

    _log("--- Pre-compiled File ---");
    _log("name: ", fileName);
    _log("content: ");
    _log(precompiledFile);

    return precompiledFile;
}

/**
 * Find all sass/scss dependencies for given file
 * @param {String} fileContent - file content
 * @return {Array} dependencies - names of all sass/scss files
 * @private
 */
function _analyzeFileForDependencies(fileContent) {

    var dependencies = [];

    // Actually we are interested only in @import tags because this is the only way to split sass file to several parts.
    // It’s also possible to import multiple files in one @import:
    // @import "rounded-corners", "text-shadow";

    var importRegexp = /\@import [^\n\r]*/gi;   // @imports .... till end of row. scss doesn't contain ';'
    var imports = fileContent.match(importRegexp);

    if (!imports) {
        return dependencies;
    }

    // README:
    // We are looking only for sass partials.
    // So we need to ignore the follow cases:
    //  - the file’s extension is .css.
    //  - the filename begins with http://.
    //  - the filename is a url().
    //  - the @import has any media queries.

    // Let's assume I have filtered the result and imports now are containing only sass partials

    // ...

    //  Extract partials names
    var namesRegexp = /[\'\"][^\'\"]*[\'\"]/g;  // '...', or "..."

    var fileNames = imports.map(function(importStr) {
        var names = importStr.match(namesRegexp);

        // clear trailing ' or " symbols
        var cleanedNames = names.map(function(name) {
            return name.substring(1, name.length - 1);
        });

        return cleanedNames;
    });

    // fileNames is array of arrays. Reduce it to one-dimensional
    fileNames.forEach(function(array) {
       array.forEach(function(name) {
           dependencies.push(name);
       }) ;
    });

    return dependencies;
}

/**
 * Concatenate all parts into one big file.
 * @param {Array} fileContents
 * @returns {string}
 * @private
 */
function _composeFileContent(fileContents) {

    // normalize file contents: reduce spaces, tabs, empty lines, etc.
    var normalizedContents = fileContents.map(function(content) {

        // README:
        // I assume there is a npm module that can do it well.
        // Let's assume I have used it here :)

        // ...

        return content;
    });

    var oneBigFile = normalizedContents.join("\n");

    return oneBigFile;
}

/**
 * Get file names that should be compiled into css
 * @param {Array} precompiledFiles - array contains objects with .name and .content
 * @param {String} sourcePatterns - source directory
 * @param targetDirectoryRoot - target directory
 * @returns {Array} fileNamesWithDifferences
 * @private
 */
function _compareFiles(precompiledFiles, sourcePatterns, targetDirectoryRoot) {

    var fileNamesWithDifferences = [];

    var targetFileNames = _getFileNamesFromTarget(targetDirectoryRoot, sourcePatterns);
    var cachedFileNames = _getFileNamesFromCache(sourcePatterns);

    var cachePath = _getCachePath(sourcePatterns);

    for (var i = 0; i < precompiledFiles.length; i++) {
        var fileName = precompiledFiles[i].name;

        // file never was compiled
        if (targetFileNames.indexOf(fileName) === -1) {
            fileNamesWithDifferences.push(fileName);
            _log("File: ", fileName, " never was compiled. Add it to list");
            continue;
        }

        // file isn't in cache
        if (cachedFileNames.indexOf(fileName) === -1) {
            _log("File: ", fileName, " is not in cache. Add it to list");
            fileNamesWithDifferences.push(fileName);
            continue;
        }

        // compare with cache
        var cachedContent = fileUtils.readFileContent(fileName, cachePath);
        if (precompiledFiles[i].content !== cachedContent) {
            _log("File: ", fileName, " is different from cached version. Add it to list");
            fileNamesWithDifferences.push(fileName);
        }
    }

    return fileNamesWithDifferences;
}

/**
 * Cache pre-compiled files
 * @param precompiledFiles
 * @param sourcePatterns
 * @private
 */
function _updateCache(precompiledFiles, sourcePatterns) {
    var cachePath = _getCachePath(sourcePatterns);

    // clear previous
    fileUtils.clearDirectory(cachePath);

    // save files
    precompiledFiles.forEach(function(file) {
        fileUtils.saveFile(file.name, file.content, cachePath);
    });
}

function _log(){
    console.log.apply(this,arguments);
}

module.exports = SmartSass;