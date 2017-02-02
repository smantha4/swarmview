var express = require('express');
var server = express();
var routes = require('routes');
var bodyParser = require('body-parser');

//Server static content
server.use('/', express.static(__dirname + '/app'));

//server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json())



/**
 * Rest client config
 */
var Client = require('node-rest-client').Client;
var restClient = new Client();
const insecure = require('insecure');

/**
 * API's
 */

var tcpp = require('tcp-ping');
const https = require('https');


/**
 * Get the agility status
 */
server.get('/api/agility/status', function(req, response) {

    var nginxHost = req.query.nginx_host;
    //TODO: Add certifaction
    var options = {
        host: nginxHost,
        port: 443,
        path: '/agility/api/platform/status',
        method: 'GET',
        headers: { 'Authorization': 'Basic YWRtaW46TTNzaEBkbWluIQ==' },
        rejectUnauthorized: false //This is to connect to insecure http browser
    };

    var req = https.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            response.send(chunk);
        });

    });
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    req.end();

});

/**
 * check if we are able to connect to the leader swarm host
 */
server.get('/api/probe_host', function(req, res) {
    var host = req.query.host;
    var port = req.query.port

    tcpp.probe(host, port, function(err, available) {
        var errorResponse = {
            "Error": "unable to ping host"
        };

        res.send(available);
    });
});

/**
 * Get list of volumes
 */
server.get('/api/volumes', function(req, res) {
    var dockerRemoteURI = req.get('X-DOCKER-REMOTE-URI');
    request = restClient.get(dockerRemoteURI + "/volumes", function(data, response) {
        res.send(JSON.stringify(data));
    });

    request.on('error', function(err) {
        console.log('request error', err);
        res.send(JSON.stringify("[]"));
    });
});

/**
 * Get the list of docker services
 */
server.get('/api/services', function(req, res) {
    var dockerRemoteURI = req.get('X-DOCKER-REMOTE-URI');
    if (!dockerRemoteURI) {
        console.log("Docker remote API null");
    }

    request = restClient.get(dockerRemoteURI + "/services", function(data, response) {
        res.send(JSON.stringify(data));
    });

    request.on('error', function(err) {
        console.log('request error', err);
        res.send(JSON.stringify("[]"));
    });
});

/**
 * Updates the service
 */
server.post('/api/services/:service_id', function(req, res) {

    var dockerRemoteURI = req.get('X-DOCKER-REMOTE-URI');
    if (!dockerRemoteURI) {
        console.log("Docker remote API null");
    }

    console.log("Docker remote API:" + dockerRemoteURI);

    //Updates need only Spec part of the json
    var args = {
        data: req.body.Spec
    };

    var dockerServiceUpdateURL = dockerRemoteURI + "/services/" + req.params.service_id + "/update?version=" + req.body.Version.Index;

    console.log("Updating service at this URL :" + dockerServiceUpdateURL);

    request = restClient.post(dockerServiceUpdateURL, args, function(data, response) {
        res.send(JSON.stringify(data));
    });

    request.on('error', function(err) {
        console.log('request error', err);
        res.send("error");
    });
});

/**
 * Pull an image for a service
 */
server.post('/api/image/create', function(req, res) {

    var dockerRemoteURI = req.get('X-DOCKER-REMOTE-URI');
    if (!dockerRemoteURI) {
        console.log("Docker remote API null");
    }

    var image = req.query.image;
    var tag = req.query.tag;

    var fetchImageURL = dockerRemoteURI + "/images/create?fromImage=" + image + "&tag=" + tag;

    request = restClient.post(fetchImageURL, function(data, response) {
        res.send(data);
    });

    request.on('error', function(err) {
        console.log('request error', err);
        res.send(JSON.stringify("[]"));
    });
});

server.get('/api/nodes', function(req, res) {
    var dockerRemoteURI = req.get('X-DOCKER-REMOTE-URI');

    request = restClient.get(dockerRemoteURI + "/nodes", function(data, response) {
        res.send(JSON.stringify(data));
    });

    request.on('error', function(err) {
        console.log('request error', err);
        res.send(JSON.stringify("[]"));
    });
});

server.get('/api/tasks', function(req, res) {
    var dockerRemoteURI = req.get('X-DOCKER-REMOTE-URI');

    request = restClient.get(dockerRemoteURI + "/tasks", function(data, response) {
        res.send(JSON.stringify(data));
    });

    request.on('error', function(err) {
        console.log('request error', err);
        res.send(JSON.stringify("[]"));
    });
});

server.all('/*', function(req, res) {
    res.sendfile('index.html');
});

server.listen(9002);

console.log("Listening at port 9002");