'use strict';

var Promise = require('bluebird');
var request = require('request-promise');

function optional(str) {
  return str || '';
}

function InsightlyClient(apiKey) {
  if (!(this instanceof InsightlyClient)) {
    return new InsightlyClient(apiKey);
  }

  var authHeader = new Buffer(apiKey, 'utf8');

  this.request = request.defaults({
    headers: {
      authorization: 'Basic ' + authHeader.toString('base64'),
      'accept-encoding': 'gzip'
    },
    json: true,
    gzip: true
  });
}

InsightlyClient.CONCURRENCY = 5;

InsightlyClient.prototype.path = function(path) {
  return 'https://api.insight.ly/v2.1/' + path;
};

InsightlyClient.prototype.getContacts = function() {
  var self = this;
  return this.request.get(this.path('/contacts'))
    .then(function(contacts) {
      return Promise.map(
        contacts,
        self.getContactOrganisation.bind(self),
        { concurrency: InsightlyClient.CONCURRENCY }
      );
    });
};

InsightlyClient.prototype.getContactOrganisation = function(contact) {
  var orgId = contact.DEFAULT_LINKED_ORGANISATION;

  if (!orgId) {
    // follow async so wrap in setImmediate
    return new Promise(function(resolve) {
      resolve(contact);
    });
  }

  return this.request.get(this.path('/organisations/' + orgId))
    .then(function(org) {
      if (org.ORGANISATION_NAME) {
        contact.ORGANISATION = org.ORGANISATION_NAME;
      }

      return contact;
    });
};

InsightlyClient.prototype.getContactsAsVcard = function() {
  return this
    .getContacts()
    .map(this.contactToVcard.bind(this))
    .then(function(contacts) {
      return contacts.join('\n');
    });
};

InsightlyClient.prototype.contactToVcard = function(contact) {
  var vcard = [];

  this._handleBegin(contact, vcard);

  vcard.push('FN:' + [optional(contact.SALUTATION), optional(contact.FIRST_NAME), optional(contact.LAST_NAME)].join(' '));
  vcard.push('N:' + optional(contact.LAST_NAME) + ';' + optional(contact.FIRST_NAME) + ';;' + optional(contact.SALUTATION) + ';');

  this._handlePhoto(contact, vcard);
  this._handleBackground(contact, vcard);
  this._handleAddresses(contact, vcard);
  this._handleContactInfos(contact, vcard);

  if (contact.ORGANISATION) {
    vcard.push('ORG:' + contact.ORGANISATION);
    contact.LINKS.forEach(function(link) {
      if (contact.DEFAULT_LINKED_ORGANISATION === link.ORGANISATION_ID &&
        link.ROLE) {
        vcard.push('TITLE:' + link.ROLE || '');
      }
    });
  }

  this._handleEnd(contact, vcard);

  return vcard.join('\n');
};

InsightlyClient.prototype.getOrganisations = function() {
  return this.request.get(this.path('/organisations'))
    .then(function(orgs) {
      // return bluebird wrapped promise instead
      return Promise.resolve(orgs);
    });
};

InsightlyClient.prototype.getOrganisationsAsVcard = function() {
  return this
    .getOrganisations()
    .map(this.organisationToVcard.bind(this))
    .then(function(contacts) {
      return contacts.join('\n');
    });
};

InsightlyClient.prototype.organisationToVcard = function(contact) {
  var vcard = [];

  this._handleBegin(contact, vcard);
  this._handlePhoto(contact, vcard);
  this._handleBackground(contact, vcard);
  this._handleAddresses(contact, vcard);
  this._handleContactInfos(contact, vcard);

  vcard.push('ORG:' + contact.ORGANISATION_NAME);

  this._handleEnd(contact, vcard);

  return vcard.join('\n');
};

InsightlyClient.prototype._handleBegin = function(contact, vcard) {
  vcard.push('BEGIN:VCARD');
  vcard.push('VERSION:4.0');
};

InsightlyClient.prototype._handleEnd = function(contact, vcard) {
  vcard.push('END:VCARD');
};

InsightlyClient.prototype._handlePhoto = function(contact, vcard) {
  if (contact.IMAGE_URL) {
    vcard.push('PHOTO:' + contact.IMAGE_URL);
  }
};

InsightlyClient.prototype._handleBackground = function(contact, vcard) {
  if (contact.BACKGROUND) {
    var note = contact.BACKGROUND.replace(/(?:\r\n|\r|\n)/g, '\\n');

    vcard.push('NOTE:' + note);
  }
};

InsightlyClient.prototype._handleAddresses = function(contact, vcard) {
  if (contact.ADDRESSES) {
    contact.ADDRESSES.forEach(function(address) {
      var addressString = 'ADR;';
      addressString += 'TYPE=' + optional(address.ADDRESS_TYPE);
      addressString += ':;;';
      addressString += optional(address.STREET) + ';';
      addressString += optional(address.CITY) + ';';
      addressString += optional(address.STATE) + ';';
      addressString += optional(address.POSTCODE) + ';';
      addressString += optional(address.COUNTRY);

      vcard.push(addressString);
    });
  }
};

InsightlyClient.prototype._handleContactInfos = function(contact, vcard) {
  if (contact.CONTACTINFOS) {
    contact.CONTACTINFOS.forEach(function(info) {
      if ('EMAIL' === info.TYPE) {
        vcard.push('EMAIL;TYPE=INTERNET;TYPE=' + info.LABEL + ':' + info.DETAIL);
      } else if ('WEBSITE' === info.TYPE) {
        vcard.push('URL;TYPE=' + info.LABEL + ':' + info.DETAIL);
      } else if ('PHONE' === info.TYPE) {
        vcard.push('TEL;TYPE=' + info.LABEL + ':' + info.DETAIL);
      }
    });
  }
};

module.exports = exports = InsightlyClient;