'use strict';

var SuiteRequest = require('escher-suiteapi-js');
var SuiteAPI = require('./');

var AdministratorAPI = require('./endpoints/administrator');
var ContactAPI = require('./endpoints/contact');
var ContactListAPI = require('./endpoints/contactlist');
var EmailAPI = require('./endpoints/email');
var ExternalEventAPI = require('./endpoints/externalevent');
var FieldAPI = require('./endpoints/field');
var LanguageAPI = require('./endpoints/language');
var PurchaseAPI = require('./endpoints/purchase');
var SegmentAPI = require('./endpoints/segment');
var SettingsAPI = require('./endpoints/settings');

var Request = require('./../lib/api-request');
var expect = require('chai').expect;
var SuiteRequestOptions = SuiteRequest.Options;

var config = require('../config');

describe('SuiteApi', function() {


  describe('#create', function() {
    var stubRequestCreation;

    beforeEach(function() {
      stubRequestCreation = (function() {
        this.sandbox.stub(SuiteRequest, 'create');
        this.sandbox.stub(Request, 'create');
        this.sandbox.stub(SuiteRequestOptions, 'createForInternalApi').returns('SuiteRequestOptionsStub');
        this.sandbox.stub(SuiteRequestOptions, 'createForServiceApi').returns('SuiteServiceRequestOptionsStub');
      }).bind(this);
    });


    it('should return a new instance of an API with the given environment and key data', function() {
      stubRequestCreation();
      var options = {
        environment: 'environment',
        apiKey: 'apiKey',
        apiSecret: 'apiSecret',
        rejectUnauthorized: true,
        secure: true
      };
      SuiteAPI.create(options);
      expect(Request.create).to.have.been.calledWith(options);
    });


    describe('environment and key data is not provided', function() {

      describe('keypool provided but api key and api secret not', function() {

        it('should return a new instance with configuration from key pool', function() {
          this.sandbox.stub(config.suiteApi, 'environment', 'environmentFromEnv');
          this.sandbox.stub(config.suiteApi, 'rejectUnauthorized', false);
          this.sandbox.stub(config.suiteApi, 'keyPool', JSON.stringify([{ keyId: 'suite_ums_v1', secret: '<Y>', acceptOnly: 0 }]));

          stubRequestCreation();

          SuiteAPI.create();

          expect(Request.create).to.have.been.calledWith({
            apiKey: 'suite_ums_v1',
            apiSecret: '<Y>',
            environment: 'environmentFromEnv',
            rejectUnauthorized: false,
            secure: true
          });
        });


        it('should return a new instance with configuration from key pool for the given scope if scope environment variable exists', function() {
          this.sandbox.stub(config.suiteApi, 'environment', 'environmentFromEnv');
          this.sandbox.stub(config.suiteApi, 'rejectUnauthorized', false);
          this.sandbox.stub(config.suiteApi, 'keyPool', JSON.stringify([
            { keyId: 'suite_ums_v1', secret: '<Y>', acceptOnly: 0 },
            { keyId: 'suite_noc_v1', secret: '<Y>', acceptOnly: 0 }
          ]));
          this.sandbox.stub(config.suiteApi, 'keyId', 'suite_noc');

          stubRequestCreation();

          SuiteAPI.create();

          expect(Request.create).to.have.been.calledWith({
            apiKey: 'suite_noc_v1',
            apiSecret: '<Y>',
            environment: 'environmentFromEnv',
            rejectUnauthorized: false,
            secure: true
          });
        });

      });


      it('should return a new instance with configuration from env variables', function() {
        this.sandbox.stub(config.suiteApi, 'environment', 'environmentFromEnv');
        this.sandbox.stub(config.suiteApi, 'rejectUnauthorized', false);
        this.sandbox.stub(config.suiteApi, 'apiKey', 'apiKeyFromEnv');
        this.sandbox.stub(config.suiteApi, 'apiSecret', 'apiSecretFromEnv');
        this.sandbox.stub(config.suiteApi, 'secure', false);

        stubRequestCreation();

        var api = SuiteAPI.create();

        expect(Request.create).to.have.been.calledWith({
          apiKey: 'apiKeyFromEnv',
          apiSecret: 'apiSecretFromEnv',
          environment: 'environmentFromEnv',
          rejectUnauthorized: false,
          secure: false
        });

        expect(api).to.be.ok;
      });

    });

    describe('environment is not provided from any source', function() {

      it('should return a new instance with API proxy', function() {
        this.sandbox.stub(config.suiteApi, 'apiKey', 'apiKeyFromEnv');
        this.sandbox.stub(config.suiteApi, 'apiSecret', 'apiSecretFromEnv');

        stubRequestCreation();

        SuiteAPI.create();

        expect(Request.create).to.have.been.calledWith({
          apiKey: 'apiKeyFromEnv',
          apiSecret: 'apiSecretFromEnv',
          environment: 'api.emarsys.net',
          rejectUnauthorized: true,
          secure: true
        });
      });

    });

  });



  describe('endpoints', function() {

    var fakeRequest;
    var sdk;
    var apiKey;
    var apiSecret;
    var environment;
    var options;

    beforeEach(function() {
      apiKey = 'apikey';
      apiSecret = 'apiSecret';
      environment = 'environment';

      options = {
        apiKey: apiKey,
        apiSecret: apiSecret,
        environment: environment,
        rejectUnauthorized: false,
        secure: true
      };

      this.sandbox.stub(AdministratorAPI, 'create').returns('FromAdministratorEndpointStub');
      this.sandbox.stub(ContactAPI, 'create').returns('FromContactEndpointStub');
      this.sandbox.stub(ContactListAPI, 'create').returns('FromContactListEndpointStub');
      this.sandbox.stub(EmailAPI, 'create').returns('FromEmailEndpointStub');
      this.sandbox.stub(ExternalEventAPI, 'create').returns('FromExternalEventEndpointStub');
      this.sandbox.stub(FieldAPI, 'create').returns('FromFieldEndpointStub');
      this.sandbox.stub(LanguageAPI, 'create').returns('FromLanguageEndpointStub');
      this.sandbox.stub(PurchaseAPI, 'create').returns('FromPurchaseEndpointStub');
      this.sandbox.stub(SegmentAPI, 'create').returns('FromSegmentEndpointStub');
      this.sandbox.stub(SettingsAPI, 'create').returns('FromSettingsEndpointStub');

      var suiteRequestStub = this.sandbox.stub(SuiteRequest, 'create');
      suiteRequestStub.withArgs(apiKey, apiSecret, 'SuiteRequestOptionsStub').returns('SuiteRequestStub');
      suiteRequestStub.withArgs(apiKey, apiSecret, 'SuiteServiceRequestOptionsStub').returns('SuiteServiceRequestStub');
      fakeRequest = { id: 'fakeRequestFrom' };
      this.sandbox.stub(Request, 'create').withArgs(options).returns(fakeRequest);
      sdk = SuiteAPI.create(options);
    });


    var testCases = [
      {
        endpoint: 'Administrator',
        sdkKey: 'administrator',
        api: AdministratorAPI,
        stub: 'FromAdministratorEndpointStub'
      },
      {
        endpoint: 'Contact',
        sdkKey: 'contact',
        api: ContactAPI,
        stub: 'FromContactEndpointStub'
      },
      {
        endpoint: 'ContactList',
        sdkKey: 'contactList',
        api: ContactListAPI,
        stub: 'FromContactListEndpointStub'
      },
      {
        endpoint: 'Email',
        sdkKey: 'email',
        api: EmailAPI,
        stub: 'FromEmailEndpointStub'
      },
      {
        endpoint: 'ExternalEvent',
        sdkKey: 'externalEvent',
        api: ExternalEventAPI,
        stub: 'FromExternalEventEndpointStub'
      },
      {
        endpoint: 'Field',
        sdkKey: 'field',
        api: FieldAPI,
        stub: 'FromFieldEndpointStub'
      },
      {
        endpoint: 'Language',
        sdkKey: 'language',
        api: LanguageAPI,
        stub: 'FromLanguageEndpointStub'
      },
      {
        endpoint: 'Purchase',
        sdkKey: 'purchase',
        api: PurchaseAPI,
        stub: 'FromPurchaseEndpointStub'
      },
      {
        endpoint: 'Segment',
        sdkKey: 'segment',
        api: SegmentAPI,
        stub: 'FromSegmentEndpointStub'
      },
      {
        endpoint: 'Settings',
        sdkKey: 'settings',
        api: SettingsAPI,
        stub: 'FromSettingsEndpointStub'
      }
    ];

    testCases.forEach(function(testCase) {
      it('should have an SDK object with ' + testCase.endpoint + ' endpoint', function() {
        expect(sdk[testCase.sdkKey]).to.eql(testCase.stub);
      });

      it('should have been called with fake request when creating api.' + testCase.sdkKey, function() {
        expect(testCase.api.create).to.have.been.calledWith(fakeRequest, options);
      });
    });

  });



});
