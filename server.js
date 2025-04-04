var compress = require('compression');
var express = require('express');
var app = express();

app.set('port', process.env.PORT || 8000);

app.use(compress());

app.use(express.static(__dirname + '/public'));

app.get('/', function (request, response) {
	response.render('pages/index');
});

app.listen(app.get('port'), function () {
	console.log('Node app is running on port', app.get('port'));
	console.log(process.env.NODE_ENV);
});
