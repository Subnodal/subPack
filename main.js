#!/usr/bin/env node

/*
    subPack

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

const yargs = require("yargs");
const terser = require("terser");
const path = require("path");
const mkdirp = require("mkdirp");
const fs = require("fs");

var config = require("./config");
var bundler = require("./bundler");

const options = yargs
    .usage("Usage: $0 [-i indir] [-o outdir] [-c configfile] [-m]")
    .option("i", {
        type: "string",
        alias: "indir",
        describe: "Relative location for resolving absolute paths"
    })
    .option("o", {
        type: "string",
        alias: "outdir",
        describe: "Output directory to place resulting Markdown reference documentation files, overrides config file"
    })
    .option("c", {
        type: "string",
        alias: "configfile",
        describe: "Location of config file to use; subpack.json in the root of the input directory will otherwise be used"
    })
    .option("n", {
        type: "string",
        alias: "outname",
        describe: "Name of .min.js file to use after bundling and minfying"
    })
    .option("m", {
        type: "boolean",
        alias: "submoduleless",
        describe: "Don't include a copy of subModules in bundle"
    })
    .option("d", {
        type: "boolean",
        alias: "dev",
        describe: "Include dev dependencies in bundle"
    })
    .argv
;

config.init();

config.data.indir = options.indir || config.data.indir || ".";
config.data.outdir = options.outdir || config.data.outdir || path.join(config.data.indir, "build");
config.data.submoduleless = !!(options.submoduleless || config.data.submoduleless);

if (!config.data.identifier) {
    console.error("No module identifier specified in config file");
    process.exit(1);
} else if (typeof(config.data.identifier) != "string") {
    console.error("Module listing in config file is not a string");
    process.exit(1);
}

if (!config.data.modules) {
    console.error("No module listing specified in config file");
    process.exit(1);
} else if (typeof(config.data.modules) != "object") {
    console.error("Module listing in config file is not an array");
    process.exit(1);
}

if (!config.data.dependencies) {
    config.data.dependencies = [];
} else if (typeof(config.data.dependencies) != "object") {
    console.error("Dependency listing in config file is not an array");
    process.exit(1);
}

if (!config.data.devDependencies) {
    config.data.devDependencies = [];
} else if (typeof(config.data.devDependencies) != "object") {
    console.error("Dependency listing in config file is not an array");
    process.exit(1);
}

if (options.dev) {
    config.data.dependencies = config.data.dependencies.concat(config.data.devDependencies);
}

config.data.outname = options.outname || config.data.outname || config.data.identifier.split(".")[config.data.identifier.split(".").length - 1];

bundler.bundle(config.data.indir, [...config.data.dependencies, ...config.data.modules]).then(function(bundledCode) {
    mkdirp.sync(path.resolve(config.data.outdir));
    fs.writeFileSync(path.join(config.data.outdir, config.data.outname + ".min.js"), bundledCode);

    terser.minify(bundledCode).then(function(minifiedCode) {
        if (!fs.existsSync(config.data.outdir)) {
            fs.mkdirSync(config.data.outdir);
        }

        if (!config.data.submoduleless) {
            bundler.bundle(config.data.indir, ["https://cdn.subnodal.com/lib/submodules.min.js"]).then(function(bundledSubmodulesCode) {
                fs.writeFileSync(path.join(config.data.outdir, config.data.outname + ".min.js"), bundledSubmodulesCode + minifiedCode.code);
            });
        } else {
            fs.writeFileSync(path.join(config.data.outdir, config.data.outname + ".min.js"), minifiedCode.code);
        }
    }).catch(function(error) {
        console.error(`Error: ${error.message}\nAt code:\n${bundledCode.substring(error.pos - 50, error.pos)}[HERE]${bundledCode.substring(error.pos, error.pos + 50)}`);
        process.exit(1);
    });
});