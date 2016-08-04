// README:
// I would use in the follow npm modules for real solution
// var Promise = require('bluebird');
// var fs = require('fs-extra');
// var glob = require('glob');
// var path = require('path');

var mockData = require('./mockData');

var FileUtils = {};

/**
 * Returns file names from given directory and filters out file names that match blackFilter
 * @param {String} dirPath - directory path
 * @param {Object} blackFilter - regular expression
 * @returns {Array} fileNames
 */
FileUtils.readFileNames = function(dirPath, blackFilter) {
    // read all fileNames in directory, except files match the blackFilter
    // reduce files' extension (.sass, .scss, .css, etc)

    // README:
    // I use mock data

    var fileNames = mockData[dirPath];

    if (blackFilter) {
        fileNames = fileNames.filter(function(name) {
            return !blackFilter.test(name);
        });
    }

    return fileNames;
};

FileUtils.readFileContent = function(fileName, dirPath) {

    // README:
    // I use mock data
    // Here also should be treatment for files starts with _:
    // 'fileName' or '_fileName'

    var fileContent = mockData[dirPath + "/" + fileName];
    return fileContent;
};

FileUtils.saveFile = function(fileName, fileContent, dirPath) {

};

FileUtils.clearDirectory = function(dirPath) {

};

module.exports = FileUtils;