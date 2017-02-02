'use strict';

/**
 * @ngdoc function
 * @name agilityDockerManagerApp.controller:DashboardCtrl
 * @description
 * # DashboardCtrl
 * Controller of the agilityDockerManagerApp
 */
angular.module('agilityDockerManagerApp')
    .controller('DashboardCtrl', ['dockerapiservice', '$scope', '$http', '$cookies', '$route', '$rootScope',
        function(dockerapiservice, $scope, $http, $cookies, $route, $rootScope) {

            //Fetch the swarm url from cookies
            $scope.swarmURL = $cookies.get("swarmURL");
            $scope.isValidURL = $cookies.get("isValidURL");
            $scope.agilitystatus = "unknown";

            if (!$scope.isValidURL) {
                console.log("No swarm url set")
            }

            $scope.selected_status = "running";
            $scope.selected_service = "";
            $scope.apiurl = "http://" + $scope.swarmURL;
            $scope.selectRawService;

            var nginxNodeId;
            var nginxServiceId;

            dockerapiservice.getVolumes($scope.apiurl).then(function(r) {
                $scope.volumes = r.data.Volumes;
            });

            $scope.loadData = function() {
                /**
                 * Get the Services
                 */
                dockerapiservice.getServices($scope.apiurl).then(function(r) {
                    $scope.services = [];
                    angular.forEach(r.data, function(v, k) {

                        var service = new Object();
                        service.name = v.Spec.Name;

                        if (service.name === 'nginx') {
                            nginxServiceId = v.ID;
                        }

                        service.id = v.ID;
                        service.replicas = v.Spec.Mode.Replicated.Replicas;
                        service.network = v.Spec.Networks[0].Target;
                        service.image = v.Spec.TaskTemplate.ContainerSpec.Image.split('@')[0];
                        service.rawData = v;
                        $scope.services.push(service);
                    }, this);
                    $scope.loadTasks();
                });
            }

            /** load the tasks */
            $scope.loadTasks = function() {
                $rootScope.loading = true;
                dockerapiservice.getTasks($scope.apiurl).then(function(r) {
                    $scope.tasks = [];
                    angular.forEach(r.data, function(v, k) {

                        var task = new Object();
                        task.node_id = v.NodeID;
                        task.service_id = v.ServiceID;

                        if (task.service_id === nginxServiceId) {
                            nginxNodeId = task.node_id;
                        }

                        angular.forEach($scope.services, function(v, k) {
                            if (v.id === task.service_id) {
                                task.service = v;
                            }
                        }, this);

                        task.status = v.Status.State;
                        task.containerID = v.Status.ContainerStatus.ContainerID;
                        $scope.tasks.push(task);
                    }, this);

                    $scope.loadNodes();
                });

            }

            /**
             * Show the details of the selected service
             */
            $scope.showServiceDetails = function(service) {
                $scope.selectRawService = service;

                //Capture the current tags and images so that they can be used to be updated
                $scope.currentImage = service.Spec.TaskTemplate.ContainerSpec.Image.split('@')[0];
                $scope.currentTag = $scope.currentImage.split(':')[1];
                $scope.currentImage = $scope.currentImage.split(':')[0];
            }

            /**
             * Load the nodes
             */
            $scope.loadNodes = function() {

                var nodes = dockerapiservice.getNodes($scope.apiurl).then(function(r) {

                    $scope.nodes = [];

                    angular.forEach(r.data, function(v, k) {

                        var node = new Object();
                        node.id = v.ID;
                        node.description = v.Description.Hostname;
                        node.status = v.Status.State;
                        if (v.ManagerStatus) {
                            node.address = v.ManagerStatus.Addr;
                            node.leader = v.ManagerStatus.Leader;
                        } else {
                            node.address = v.Status.Addr;
                        }

                        //Build the nginx service url
                        if (nginxNodeId && node.id === nginxNodeId) {
                            $scope.nginxURL = "https://" + node.address + "/agility/x/";
                            $scope.nginxHost = node.address;
                        }

                        var tasks = [];

                        //Get the list of tasks running on that node
                        angular.forEach($scope.tasks, function(v, k) {
                            if (v.node_id === node.id) {
                                tasks.push(v);
                            }
                        }, this);

                        node.tasks = tasks;

                        $scope.nodes.push(node);
                        $rootScope.loading = false;
                    }, this);

                });
            }


            //Load the data
            $scope.loadData();

            $scope.getStateClass = function(status) {

                if (status === 'running') {
                    return 'label-success';
                } else if (status === 'failed') {
                    return 'label-danger';
                } else {
                    return 'label-warning';
                }
            }

            /**
             * Get the agility status
             */
            $scope.getAgilityStatus = function() {
                dockerapiservice.checkAgilityStatus($scope.nginxHost).then(function(r) {
                    $scope.agilitystatus = r.data;
                });
            }

            /**
             * Update the Swarm URL. This is only for dev versions
             */
            $scope.updateSwarmURL = function() {
                    dockerapiservice.testDockerHost($scope.swarmURL).then(function(r) {
                        $scope.isValidURL = r.data;

                        //Store the url in cookies
                        $cookies.put("swarmURL", $scope.swarmURL);
                        $cookies.put("isValidURL", $scope.isValidURL);

                        $scope.message = "Swarm URL has been updated to " + $scope.swarmURL;
                        $scope.hasMessage = true;

                        $scope.loadData();
                        $route.reload();
                    });
                }
                /**
                 * Pass in the servie
                 */
            $scope.scaleService = function(service, instances) {
                console.log("scaling services to " + instances);
                console.log(JSON.stringify($scope.selectRawService.Spec.Mode));
                $scope.selectRawService.Spec.Mode.Replicated.Replicas = instances;

                //Update the service to the specified instances
                dockerapiservice.updateService($scope.selectRawService.ID, $scope.selectRawService, $scope.apiurl).then(function(r) {
                    $scope.message = "Rescale to scale service to " + instances + " has been successfully posted";
                    $scope.hasMessage = true;
                    $scope.loadData();
                });;

                //reload the page
                $scope.loadData();
            }

            /**
             * Update an Image for a service
             */
            $scope.updateImage = function() {
                console.log("invoked update image");
                if ($scope.currentTag && $scope.currentImage) {
                    dockerapiservice.fetchImage($scope.currentImage, $scope.currentTag, $scope.apiurl).then(function(response) {

                        //Set the image to a new Image
                        $scope.selectRawService.Spec.TaskTemplate.ContainerSpec.Image =
                            $scope.currentImage + ":" + $scope.currentTag;
                        //Call update to update the image    
                        dockerapiservice.updateService($scope.selectRawService.ID, $scope.selectRawService, $scope.apiurl)
                            .then(function(r) {
                                if (r.data == "error") {
                                    $scope.hasError = true;
                                    $scope.errorMessage = "Error updating the service with the specified image";
                                }
                                //reload the page
                                console.log("Completed updating the service " + JSON.stringify(r.data));
                                //Set the log in the text
                                $scope.imagelog = response.data;

                                //show the alert message
                                $scope.hasMessage = true;
                                $scope.message = "Image update request successfully posted";
                                $scope.loadData();
                            });
                    });
                }
            }
        }
    ]);