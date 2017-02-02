'use strict';

describe('Service: dockerapiservice', function () {

  // load the service's module
  beforeEach(module('agilityDockerManagerApp'));

  // instantiate service
  var dockerapiservice;
  beforeEach(inject(function (_dockerapiservice_) {
    dockerapiservice = _dockerapiservice_;
  }));

  it('should do something', function () {
    expect(!!dockerapiservice).toBe(true);
  });

});
