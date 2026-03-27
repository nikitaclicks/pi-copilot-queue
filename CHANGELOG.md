# Changelog

## [0.7.3](https://github.com/ayagmar/pi-copilot-queue/compare/v0.7.2...v0.7.3) (2026-03-27)

### Bug Fixes

* **queue:** handle stop turns and anthropic thinking ([d7c5b68](https://github.com/ayagmar/pi-copilot-queue/commit/d7c5b68ebf265ba3242c2c00453624327810318a))
* **queue:** keep stop mode until rearmed ([7dd1b63](https://github.com/ayagmar/pi-copilot-queue/commit/7dd1b63e890a81a56b59f7573fd236d699eb050e))

## [0.7.2](https://github.com/ayagmar/pi-copilot-queue/compare/v0.7.1...v0.7.2) (2026-03-26)

### Bug Fixes

* restore ask_user enforcement and release workflow ([bf28db8](https://github.com/ayagmar/pi-copilot-queue/commit/bf28db86839799868bee926f584525b765801c63))

## [0.7.1](https://github.com/ayagmar/pi-copilot-queue/compare/v0.7.0...v0.7.1) (2026-03-22)

### Bug Fixes

* **queue:** remove payload patching and project overrides ([65f120a](https://github.com/ayagmar/pi-copilot-queue/commit/65f120ab56fc2b76f1e5593acffd430ac2af9a60))
* **release:** respect selected version bump ([34a52a8](https://github.com/ayagmar/pi-copilot-queue/commit/34a52a8aad34662a6efb44e5b0f0500383a02221))

## [0.7.0](https://github.com/ayagmar/pi-copilot-queue/compare/v0.6.0...v0.7.0) (2026-03-22)

### Features

* **queue:** add settings UI and command completions ([74732bd](https://github.com/ayagmar/pi-copilot-queue/commit/74732bd55c956cc46df6d452416c2d91271ab2ed))
* **queue:** overhaul settings and completions ([6c36e42](https://github.com/ayagmar/pi-copilot-queue/commit/6c36e427c2f4f35310d416882388fc201e15ddf3))

### Bug Fixes

* **queue:** improve status line UX ([517ae8c](https://github.com/ayagmar/pi-copilot-queue/commit/517ae8c95c54b03c0b54c1f7a786f7f5b794f78f))

## [0.6.0](https://github.com/ayagmar/pi-copilot-queue/compare/v0.3.0...v0.6.0) (2026-03-21)

### Features

* add terminal notification utilities for user input prompts ([d3fdaf6](https://github.com/ayagmar/pi-copilot-queue/commit/d3fdaf632e52140affacd7c0c710a8b0f9afd802))
* enhance notifyTerminal to degrade gracefully in non-TTY environments ([c8ad61a](https://github.com/ayagmar/pi-copilot-queue/commit/c8ad61ad96957abbe4622cda313affa3ab2d8e61))
* **queue:** add global provider settings ([e2eee19](https://github.com/ayagmar/pi-copilot-queue/commit/e2eee19d5639996b806b21f8f5d0024a71f968ac))
* **queue:** add provider settings and stop-aware tool forcing ([356448d](https://github.com/ayagmar/pi-copilot-queue/commit/356448d22c7e76fa61fc1ab496867bbff322092f))
* **queue:** add provider settings command ([c9e8ee1](https://github.com/ayagmar/pi-copilot-queue/commit/c9e8ee16555b21b3c023ae824ff6123e4143e73e))
* **queue:** add provider subcommand autocomplete ([61ad978](https://github.com/ayagmar/pi-copilot-queue/commit/61ad9780ef6627bfab46798125e62b8a477c5d9c))

## [0.3.0](https://github.com/ayagmar/pi-copilot-queue/compare/v0.2.1...v0.3.0) (2026-03-13)

### Features

* add @mariozechner/pi-tui dependency and update .prettierignore ([2d723a8](https://github.com/ayagmar/pi-copilot-queue/commit/2d723a85c14ae5f0f369e602ac9e8ff13fe070df))
* Preserve agent prompt in ask_user tool output ([a75defd](https://github.com/ayagmar/pi-copilot-queue/commit/a75defd3a79fd1e0d1e2dcdac016cf9df989b420))

## [0.2.1](https://github.com/ayagmar/pi-copilot-queue/compare/v0.2.0...v0.2.1) (2026-03-02)

### Bug Fixes

* **queue:** remove reinjection and hide non-copilot status ([8fdcd0d](https://github.com/ayagmar/pi-copilot-queue/commit/8fdcd0d14eab7432884d8f6b5f57a9cb290f8dd6))
* **types:** align provider/status context typing ([bf7b9f1](https://github.com/ayagmar/pi-copilot-queue/commit/bf7b9f1db04951f3432e7d4b460b71a7b045b806))

## [0.2.0](https://github.com/ayagmar/pi-copilot-queue/compare/v0.1.3...v0.2.0) (2026-03-01)

### Features

- **queue:** add busy-input capture toggle and update docs ([30ab9ff](https://github.com/ayagmar/pi-copilot-queue/commit/30ab9ff579abda68210871c357ae6aa90d658650))

### Bug Fixes

- **compaction:** preserve queue and reinforce ask_user policy ([602fa03](https://github.com/ayagmar/pi-copilot-queue/commit/602fa03c6775feb13fb5f10c0774ac3df6ddf808))

## [0.1.3](https://github.com/ayagmar/pi-copilot-queue/compare/v0.1.2...v0.1.3) (2026-03-01)

All notable changes to this project will be documented in this file.
