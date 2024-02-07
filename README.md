# typedoc-plugin-coverage

A plugin for TypeDoc to generate a documentation coverage badge.

This plugin will write a `coverage.svg` badge to your output directory when generating HTML documentation that
includes the percentage of your API surface which is documented. It will respect TypeDoc's `requiredToBeDocumented` option,
and only report missing documentation if reflections covered by that option are undocumented.

## Options

- `coverageLabel` - Define the label for the coverage badge. Defaults to 'document'.
- `coverageColor` - Define the define the color of the coverage badge background. Defaults to a dynamic color depending on coverage percentage.

Default colors/icon sourced from [esdoc-coverage-plugin](https://github.com/esdoc/esdoc-plugins/tree/master/esdoc-coverage-plugin)
