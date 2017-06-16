<a name="0.0.5"></a>
## [0.0.5](https://github.com/10gen/stitch-js-sdk/compare/fd5e996...v0.0.5) (2017-06-15)


### Bug Fixes

* **admin:** STITCH-304 - Handle compressed cookie response ([66be811](https://github.com/10gen/stitch-js-sdk/commit/66be811))
* **baas_client:** throw error when attempting to new factory method ([4e95885](https://github.com/10gen/stitch-js-sdk/commit/4e95885))
* **baas_client:** throw error when failing to decode user auth ([26cec2c](https://github.com/10gen/stitch-js-sdk/commit/26cec2c))
* **client:** anonymousAuth uses correct authManager method ([bb25937](https://github.com/10gen/stitch-js-sdk/commit/bb25937))
* **client:** ensure that `stages` param is an array of stages ([78657a6](https://github.com/10gen/stitch-js-sdk/commit/78657a6))
* **client:** remove remaining usage of b64en(de)code ([836f396](https://github.com/10gen/stitch-js-sdk/commit/836f396))
* **client:** remove utf8 decoder and use .text() ([296454f](https://github.com/10gen/stitch-js-sdk/commit/296454f))
* **client-do:** properly accept overridden default values ([d08d812](https://github.com/10gen/stitch-js-sdk/commit/d08d812))
* **collection:** fix use of potentially incorrect falsey check ([bf6300b](https://github.com/10gen/stitch-js-sdk/commit/bf6300b))
* **collection:** further fixes related to CRUD spec parity ([31a7343](https://github.com/10gen/stitch-js-sdk/commit/31a7343))
* **collection:** include query for `find` operation ([ce27219](https://github.com/10gen/stitch-js-sdk/commit/ce27219))
* **common:** remove unsupported use of for..of ([3f1adab](https://github.com/10gen/stitch-js-sdk/commit/3f1adab))
* **dist:** s3 paths for tarball dists changed ([91ffd87](https://github.com/10gen/stitch-js-sdk/commit/91ffd87))
* **es6:** correct uses of es6-only features ([67d6ff3](https://github.com/10gen/stitch-js-sdk/commit/67d6ff3))
* **slack:** rename `message` to `text` for `post` ([a7e4283](https://github.com/10gen/stitch-js-sdk/commit/a7e4283))
* **storage:** more correct check for window existence ([72128f4](https://github.com/10gen/stitch-js-sdk/commit/72128f4))


### Features

* **admin:** BAAS-94 - support creating app with defaults ([f80e35e](https://github.com/10gen/stitch-js-sdk/commit/f80e35e))
* **admin:** STITCH-214 - allow admin client to access allowed request origin info for an app ([008cd60](https://github.com/10gen/stitch-js-sdk/commit/008cd60))
* **builtins:** add builders for built-in stages ([741fe8b](https://github.com/10gen/stitch-js-sdk/commit/741fe8b))
* **collection:** implement `count` on Collections ([fd5e996](https://github.com/10gen/stitch-js-sdk/commit/fd5e996))
* **createUser:** add app users create ([41058e9](https://github.com/10gen/stitch-js-sdk/commit/41058e9))
* **groups:** BAAS-136 - support new group paths ([12105af](https://github.com/10gen/stitch-js-sdk/commit/12105af))
* **groups:** BAAS-136 - support new group paths ([e4fd445](https://github.com/10gen/stitch-js-sdk/commit/e4fd445))
* **groups:** BAAS-136 - support new group paths ([a9ddbec](https://github.com/10gen/stitch-js-sdk/commit/a9ddbec))
* **groups:** BAAS-136 - support new group paths ([a3a11d3](https://github.com/10gen/stitch-js-sdk/commit/a3a11d3))
* **groups:** BAAS-136 - use master.baas-dev.10gen.cc as base url ([6d7a9ff](https://github.com/10gen/stitch-js-sdk/commit/6d7a9ff))
* **groups:** BAAS-136 - use master.baas-dev.10gen.cc as base url ([564fa06](https://github.com/10gen/stitch-js-sdk/commit/564fa06))
* **http-service:** add http service ([9113e57](https://github.com/10gen/stitch-js-sdk/commit/9113e57))
* **let:** support let substage definition after building stage ([cf87a7a](https://github.com/10gen/stitch-js-sdk/commit/cf87a7a))
* **letMixin:** support a let stage on all services ([ef7f422](https://github.com/10gen/stitch-js-sdk/commit/ef7f422))
* **login:** BAAS-136 - support MongoDB cloud login with cookie handling ([e3baa1b](https://github.com/10gen/stitch-js-sdk/commit/e3baa1b))
* **post-substage:** support post substage definition ([5c140f1](https://github.com/10gen/stitch-js-sdk/commit/5c140f1))
* **pubnub-service:** add pubnub service ([880fef6](https://github.com/10gen/stitch-js-sdk/commit/880fef6))
* **s3-service:** add s3 service ([8c670d8](https://github.com/10gen/stitch-js-sdk/commit/8c670d8))
* **service-response:** add `serviceResponse` wrapper to utils ([df89abe](https://github.com/10gen/stitch-js-sdk/commit/df89abe))
* **ses-service:** add ses service ([ca9e62b](https://github.com/10gen/stitch-js-sdk/commit/ca9e62b))
* **slack-service:** add slack service ([a7b16d5](https://github.com/10gen/stitch-js-sdk/commit/a7b16d5))
* **sqs-service:** add sqs service ([98dc11f](https://github.com/10gen/stitch-js-sdk/commit/98dc11f))
* **twilio-service:** add new service definition for Twilio ([801e539](https://github.com/10gen/stitch-js-sdk/commit/801e539))



