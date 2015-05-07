# insightly-to-vcard

Convert insightly data to vCard 4.0 format

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![David deps][david-image]][david-url]

[![node version][node-image]][node-url]
[![io version][io-image]][node-url]

[npm-image]: https://img.shields.io/npm/v/insightly-to-vcard.svg?style=flat-square
[npm-url]: https://npmjs.org/package/insightly-to-vcard
[travis-image]: https://img.shields.io/travis/jksdua/insightly-to-vcard.svg?style=flat-square
[travis-url]: https://travis-ci.org/jksdua/insightly-to-vcard
[david-image]: https://img.shields.io/david/jksdua/insightly-to-vcard.svg?style=flat-square
[david-url]: https://david-dm.org/jksdua/insightly-to-vcard
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.10.x-green.svg?style=flat-square
[node-url]: http://nodejs.org
[io-image]: https://img.shields.io/badge/io.js-%3E=_1.0-yellow.svg?style=flat-square
[io-url]: https://iojs.org


## Features

- Supports:
  - Contacts
  - Organisations
- Promise based API


## Usage

```bash
npm i insightly-to-vcard
```

```js
var API_KEY = '1111897e-23b7-4a76-a431-deb0115271e0';

var I2V = require('insightly-to-vcard');
var i2v = new I2V(API_KEY);
```

### Contacts

```js
i2v.getContactsAsVcard().then(function(vcards) {
  console.log(vcards);
}).catch(done).done();
```

### Organisations

```js
i2v.getOrganisationsAsVcard().then(function(vcards) {
  console.log(vcards);
}).catch(done).done();
```


## Changelog

### 1.0.0
8 May 2015

- Initial commit