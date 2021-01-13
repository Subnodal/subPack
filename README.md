# subPack
Command-line tool to package and bundle
[subModules](https://github.com/Subnodal/subModules) libraries.

Licenced by the [Subnodal Open-Source Licence](LICENCE.md).

## Installation
To install subPack, you must have npm installed. If you have, then run:

```bash
$ sudo npm install -g .
```

You should then be able to run subPack with:

```bash
$ subpack
```

## Writing `subpack.json`
Here's an example of `subpack.json`:

```
{
    "identifier": "com.example.mymodule",
    "modules": [
        "a.js",
        "b.js"
    ],
    "dependencies": [
        "https://cdn.subnodal.com/example.min.js"
    ]
}
```

The `identifier` property must exist and be a string. It should be written in
reverse-domain notation, with the module name as a subdomain.

The `dependencies` property is not required. It should be used only for
importing dependencies that external to your module. Dependencies shouldn't be
imported using the `modules` property, and internal modules shouldn't be
imported using the `dependencies` property.

subPack automatically includes a copy of subModules as a dependency. It's highly
recommended for you to keep it this way, but if you don't want subModules to be
bundled, then set the `submoduleless` property to `true`.