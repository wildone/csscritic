window.isWebkit = navigator.userAgent.indexOf("WebKit") >= 0;
window.ifNotInWebkitIt = function(text, functionHandle) {
    if (! window.isWebkit) {
        return it(text, functionHandle);
    } else {
        safeLog('Warning: "' + text + '" is disabled on this platform');
    }
};
window.safeLog = function (msg) {
    if (window.console && window.console.log) {
        window.console.log(msg);
    }
};

window.csscriticTestHelper = (function () {
    var module = {},
        tempPath = null,
        tempPathCounter = 0;

    var loadImage = function (url, successCallback, errorCallback) {
        var image = new window.Image();

        image.onload = function () {
            successCallback(image);
        };
        image.onerror = errorCallback;
        image.src = url;
    };

    module.loadImageFromUrl = function (url, successCallback) {
        loadImage(url, successCallback, function () {
            safeLog("Error loading image " + url + " in test", url);
        });
    };

    module.testImageUrl = function (url, callback) {
        loadImage(url, function () {
            callback(true);
        }, function () {
            callback(false);
        });
    };

    module.getFileUrl = function (filePath) {
        var fs = require("fs");

        return "file://" + fs.absolute(filePath);
    };

    function tempPathName () {
        return "/tmp/csscriticTest." + Math.floor(Math.random() * 10000) + "/";
    }

    var createMainTempPath = function () {
        var fs = require("fs"),
            path = tempPathName();

        while (fs.exists(path)) {
            path = tempPathName();
        }

        fs.makeDirectory(path);
        return path;
    };

    module.createTempPath = function () {
        var fs = require("fs"),
            tempSubPath;

        if (tempPath === null) {
            tempPath = createMainTempPath();
        }
        tempSubPath = tempPath + '/' + tempPathCounter + '/';
        tempPathCounter += 1;
        fs.makeDirectory(tempSubPath);
        return tempSubPath;
    };

    return module;
}());
