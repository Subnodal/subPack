/*
    subPack

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

const fs = require("fs");
const path = require("path");

exports.data = {
    indir: "."
};

exports.init = function(configfile) {
    if (fs.existsSync(configfile || path.join(exports.data.indir, "subpack.json"))) {
        try {
            exports.data = JSON.parse(fs.readFileSync(configfile || path.join(exports.data.indir, "subpack.json")));
        } catch (e) {
            console.error("Unable to parse config file");
            process.exit(1);
        }
    } else if (configfile) {
        console.error("Unable to find specified config file");
        process.exit(1);
    } else {
        console.error("Not in a directory with a subpack.json config file");
        process.exit(1);
    }
};