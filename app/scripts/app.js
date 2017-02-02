'use strict';

/**
 * @ngdoc overview
 * @name agilityDockerManagerApp
 * @description
 * # agilityDockerManagerApp
 *
 * Main module of the application.
 */
angular
    .module('agilityDockerManagerApp', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'ngMaterial'
    ])
    .config(function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'DashboardCtrl',
                controllerAs: 'dashboardCtrl'
            })
            .when('/about', {
                templateUrl: 'views/about.html',
                controller: 'AboutCtrl',
                controllerAs: 'about'
            })
            .when('/hostview', {
                templateUrl: 'views/hostview.html',
                controller: 'DashboardCtrl',
                controllerAs: 'dashboardCtrl'
            })
            .when('/volumeview', {
                templateUrl: 'views/volumes.html',
                controller: 'DashboardCtrl',
                controllerAs: 'dashboardCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });

        $locationProvider.html5Mode(true).hashPrefix('!');
    });


angular.module('agilityDockerManagerApp').
service('LoadingInterceptor', ['$q', '$rootScope', '$log',
    function($q, $rootScope, $log) {
        'use strict';

        return {
            request: function(config) {
                $rootScope.loading = true;
                return config;
            },
            requestError: function(rejection) {
                $scope.loading = false;
                $log.error('Request error:', rejection);
                return $q.reject(rejection);
            },
            response: function(response) {
                $rootScope.loading = false;
                return response;
            },
            responseError: function(rejection) {
                $rootScope.loading = false;
                $log.error('Response error:', rejection);
                return $q.reject(rejection);
            }
        };
    }
]).config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('LoadingInterceptor');
}]);