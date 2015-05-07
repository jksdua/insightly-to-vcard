/* globals describe, it */

'use strict';

var API_KEY = 'zzz';

describe('#insightly-to-vcard', function() {
  var expect = require('chai').expect;
  var Promise = require('bluebird');

  var I2V = require('./index');
  var i2v = new I2V(API_KEY);

  Promise.longStackTraces();

  it('should fetch contacts as vcard', function(done) {
    i2v.getContactsAsVcard().then(function(vcards) {
      console.log(vcards);
      done();
    }).catch(done).done();
  });

  it('should fetch organisations as vcard', function(done) {
    i2v.getOrganisationsAsVcard().then(function(vcards) {
      console.log(vcards);
      done();
    }).catch(done).done();
  });
});