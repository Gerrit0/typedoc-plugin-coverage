# typedoc-plugin-coverage

A plugin for TypeDoc to generate a documentation coverage badge.

This plugin will write a `coverage.svg` badge to your output directory when generating HTML documentation that
includes the percentage of your API surface which is documented. It will respect TypeDoc's `requiredToBeDocumented` option,
and only report missing documentation if reflections covered by that option are undocumented.

## Options

- `coverageColor` - Define the define the color of the coverage badge background. Defaults to a dynamic color depending on coverage percentage.

Default colors/icon sourced from [esdoc-coverage-plugin](https://github.com/esdoc/esdoc-plugins/tree/master/esdoc-coverage-plugin)

## Change Log

### v2.0.0 (2022-06-27)

- Added support for TypeDoc 0.23.
- Dropped support for Node 12.

### v1.0.2 (2022-03-26)

- Fixed handling of `requiredToBeDocumented` if `"Accessor"` was specified.

### v1.0.1 (2022-03-26)

- Remove redundant `.0` in displayed percentage in badge.

### v1.0.0 (2022-03-26)

- Initial release
