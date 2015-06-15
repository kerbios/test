var express = require('express'),
    app = express(),
    crypto = require('crypto');

app.set('port', (process.env.PORT || 5000));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.disable('x-powered-by');
app.use(express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/bower_components'));

app.get('/', function (req, res) {
    res.render('index', {id: crypto.randomBytes(20).toString('hex'), isReceiver: false});
});

app.get('/:id', function (req, res) {
    res.render('index', {id: req.params.id, isReceiver: true});
});

app.listen(app.get('port'));
