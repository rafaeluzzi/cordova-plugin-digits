#!/usr/bin/env node

'use strict';

// This hook automates this:
// https://github.com/eface2face/cordova-plugin-iosrtc/blob/master/docs/Building.md

var
  fs = require("fs"),
  path = require("path"),

  COMMENT_KEY = /_comment$/;


// Helpers

// Returns the project name
function getProjectName(protoPath) {
  var
    cordovaConfigPath = path.join(protoPath, 'config.xml'),
    content = fs.readFileSync(cordovaConfigPath, 'utf-8');

  return /<name>([\s\S]*)<\/name>/mi.exec(content)[1].trim();
}

// Drops the comments
function nonComments(obj) {
  var
    keys = Object.keys(obj),
    newObj = {},
    i = 0;

  for (i; i < keys.length; i += 1) {
    if (!COMMENT_KEY.test(keys[i])) {
      newObj[keys[i]] = obj[keys[i]];
    }
  }

  return newObj;
}

// Array.includes() polyfill
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    var O = Object(this);
    var len = parseInt(O.length, 10) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1], 10) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {
        k = 0;
      }
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
        (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}

// Starting here

module.exports = function(context) {
  var
    xcode = context.requireCordovaModule('xcode'),
    projectRoot = context.opts.projectRoot,
    projectName = getProjectName(projectRoot),
    xcconfigPath = path.join(projectRoot, '/platforms/ios/cordova/build.xcconfig'),
    xcodeProjectName = projectName + '.xcodeproj',
    xcodeProjectPath = path.join(projectRoot, 'platforms', 'ios', xcodeProjectName, 'project.pbxproj'),
    xcodeProject;

  // Checking if the project files are in the right place
  if (!fs.existsSync(xcodeProjectPath)) {
    debugerror('an error occurred searching the project file at: "' + xcodeProjectPath + '"');

    return;
  }
  debug('".pbxproj" project file found: ' + xcodeProjectPath);

  if (!fs.existsSync(xcconfigPath)) {
    debugerror('an error occurred searching the project file at: "' + xcconfigPath + '"');

    return;
  }
  debug('".xcconfig" project file found: ' + xcconfigPath);

  xcodeProject = xcode.project(xcodeProjectPath);

  // Showing info about the tasks to do
  debug('adding linker flag "-lz":');

  // Massaging the files

  // "project.pbxproj"
  // Parsing it
  xcodeProject.parseSync();
  var configurations, buildSettings;

  configurations = nonComments(xcodeProject.pbxXCBuildConfigurationSection());
  // Adding or changing the parameters we need
  Object.keys(configurations).forEach(function(config) {
    buildSettings = configurations[config].buildSettings;
    var linkerFlag = '"-lz"';
    if (buildSettings.OTHER_LDFLAGS === undefined) {
      buildSettings.OTHER_LDFLAGS = []
    }
    var existingFlags = (buildSettings.OTHER_LDFLAGS === undefined ? [] : buildSettings.OTHER_LDFLAGS);
    if (!existingFlags.includes(linkerFlag)) {
      existingFlags.push(linkerFlag);
    }
  });

  // Writing the file again
  fs.writeFileSync(xcodeProjectPath, xcodeProject.writeSync(), 'utf-8');
  debug('file correctly fixed: ' + xcodeProjectPath);
};


function debug(msg) {
  console.log('cordova-plugin-digits [INFO] ' + msg);
}


function debugerror(msg) {
  console.error('cordova-plugin-digits [ERROR] ' + msg);
}
