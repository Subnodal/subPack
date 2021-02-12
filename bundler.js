const { fstat } = require("fs");
/*
    subPack

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

const https = require("https");
const fs = require("fs");
const path = require("path");

function isUrl(path) {
    return path.startsWith("http://") || path.startsWith("https://");
}

exports.bundle = function(rootDirectory, pathsToBundle) {
    var resolvedPathsToBundle = pathsToBundle.map(function(a) {
        if (typeof(a) != "string") {
            console.warn(`Could not resolve path ${String(a)}`);

            return;
        }

        if (isUrl(a)) {
            return a;
        }

        return path.join(rootDirectory, ...a.split(/[\\\/]/));
    });

    var unbundledCodePromises = [];

    for (var i = 0; i < resolvedPathsToBundle.length; i++) {
        (function(resolvedPath, i) {
            if (isUrl(resolvedPath)) {
                unbundledCodePromises.push(new Promise(function(resolve, reject) {
                    https.get(resolvedPath, function(response) {
                        response.setEncoding("utf8");

                        if (response.statusCode >= 200 && response.statusCode < 300) {
                            var data = "";

                            response.on("data", function(chunk) {
                                data += chunk;
                            });

                            response.on("end", function() {
                                resolve(data);
                            });
                        } else {
                            console.warn(`Could not resolve path ${pathsToBundle[i]} (status code ${response.statusCode}), and so it was skipped`);

                            reject();
                        }
                    });
                }));
            } else {
                if (fs.existsSync(resolvedPath)) {
                    unbundledCodePromises.push(Promise.resolve(fs.readFileSync(resolvedPath)));
                } else {
                    console.warn(`Could not resolve path ${pathsToBundle[i]}, and so it was skipped`);
    
                    unbundledCodePromises.push(Promise.reject());
                }
            }
        })(resolvedPathsToBundle[i], i);
    }

    return Promise.all(unbundledCodePromises).then(function(data) {
        return Promise.resolve(data.join(""));
    }).catch(function() {
        console.error("A critical error occurred while trying to bundle");
        process.exit(1);
    });
};