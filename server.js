// set up ========================
var gzippo = require('gzippo');
var express  = require('express');
var app      = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan = require('morgan');                         // log requests to the console (express4)
var bodyParser = require('body-parser');                // pull information from HTML POST (express4)
var methodOverride = require('method-override');        // simulate DELETE and PUT (express4)
var port = process.env.PORT || 3000;
// configuration =================

mongoose.connect('mongodb://node:nodeuser@mongo.onmodulus.net:27017/uwO3mypu');     // connect to mongoDB database on modulus.io
app.use(gzippo.staticGzip("" + __dirname + "/dist"));
app.use(express.static(__dirname + '/app'));                    // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(function(req, res) {                                    // catch all route middleware for page reload
    res.sendfile(__dirname + '/app/index.html');
});

// listen (start app with node server.js) ======================================
app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});
