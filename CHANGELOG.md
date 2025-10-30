# Change Log

All notable changes to the VS Code LXD extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [Unreleased]

### Added

- LXD images explorer.
- LXD networks explorer.
- LXD storage explorer.
- Instance explorer displays instance status
- Instance explorer is refreshed every 15 seconds.
- Refresh intervall can be configured via the `lxd.refreshInterval` property.

### Changed

- updated screenshot in readme

### Fixed

- Readme version badge links were swapped.

## [0.0.2] - 30 October 2025

### Added

- handle unsupported environments (e.g. windows, macOS, web)
- custom LXD daemon unix socket path can be set with the configuration property `lxd.daemonUnixSocketPath`
- search for LXD daemon unix socket at
  1. `$LXD_DIR/unix.socket`
  2. `/var/snap/lxd/common/lxd/unix.socket`
  3. `/var/lib/lxd/unix.socket`
- refresh command for the instance view
- refresh button for the instance view

### Changed

- use VS Code build-in logger
- minor code cleanup's

## [0.0.1] - 27 October 2025

### Initial Release

A simple proof of concept that can lists all LXD instances.


[unreleased]: https://github.com/dviererbe/vscode-lxd/compare/v0.0.2...HEAD
[0.0.2]: https://github.com/dviererbe/vscode-lxd/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/dviererbe/vscode-lxd/releases/tag/v0.0.1
