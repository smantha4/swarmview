'use strict';

/**
 * @ngdoc service
 * @name agilityDockerManagerApp.dockerapiservice
 * @description
 * # dockerapiservice
 * Service in the agilityDockerManagerApp.
 */
angular.module('agilityDockerManagerApp')
    .service('dockerapiservice', ['$http', function($http) {


        /**
         * Pull the image on to the swarm host
         */
        this.fetchImage = function(image, tag, url) {

            console.log("invoked fetch image api service with URL " + url);

            return $http.post('/api/image/create', {}, {
                headers: {
                    'X-DOCKER-REMOTE-URI': url
                },
                params: {
                    image: image,
                    tag: tag
                }
            }).then(function(response) {
                return response;
            });
        }

        /**
         * Verify if the docker leader works
         */
        this.updateService = function(service_id, service, url) {
            console.log("updating service with id " + service_id);
            console.log("service" + JSON.stringify(service));
            return $http.post('/api/services/' + service_id, service, {
                headers: {
                    'X-DOCKER-REMOTE-URI': url
                }
            }).then(function(response) {
                return response;
            });
        }

        /**
         * Verify if the docker leader works
         */
        this.testDockerHost = function(url) {
            var urlParams = url.split(":");
            return $http.get('/api/probe_host', {
                params: {
                    host: urlParams[0],
                    port: urlParams[1]
                }
            }).then(function(response) {
                return response;
            });
        }

        /**
         * Check agility status
         */
        this.checkAgilityStatus = function(nginx_ip) {
            return $http.get('/api/agility/status', {
                params: {
                    nginx_host: nginx_ip,
                }
            }).then(function(response) {
                return response;
            });
        }


        this.getServices = function(url) {
            console.log(url);
            return $http.get('/api/services', {
                headers: {
                    'X-DOCKER-REMOTE-URI': url
                }
            }).then(function(response) {
                return response;
            });
        };

        this.getTasks = function(url) {
            return $http.get('/api/tasks', {
                headers: {
                    'X-DOCKER-REMOTE-URI': url
                }
            }).then(function(response) {
                console.log("Fetched Tasks");
                return response;
            });
        };

        this.getNodes = function(url) {
            return $http.get('/api/nodes', {
                headers: {
                    'X-DOCKER-REMOTE-URI': url
                }
            }).then(function(response) {
                return response;
            });
        };

        this.getVolumes = function(url) {
            return $http.get('/api/volumes', {
                headers: {
                    'X-DOCKER-REMOTE-URI': url
                }
            }).then(function(response) {
                return response;
            });
        }

    }]);