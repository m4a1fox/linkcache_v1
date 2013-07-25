/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , user = require('./routes/user')
    , http = require('http')
    , path = require('path')
    , EmployeeProvider = require('./user').EmployeeProvider
    , nodemailer = require('nodemailer');

var app = express();


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

var employeeProvider = new EmployeeProvider('localhost', 27017);


var smtpTransport = nodemailer.createTransport("SMTP", {
    service: "Gmail",  // sets automatically host, port and connection security settings
    auth: {
        user: "sin666m4a1fox@gmail.com",
        pass: "oracleroterdam"
    }
});


app.get('/sendmail', function (req, res) {

    smtpTransport.sendMail({  //email options
        from: "Sender Name <sin666m4a1fox@gmail.com>", // sender address.  Must be the same as authenticated user if using GMail.
        to: "Receiver Name <m4a1fox@mail.ru>", // receiver
        subject: "Emailing with nodemailer", // subject
        text: "Email Example with nodemailer" // body
    }, function (error, response) {  //callback
        if (error) {
            console.log(error);
        } else {
            console.log("Message sent: " + response.message);
            res.redirect('/')
        }

        smtpTransport.close(); // shut down the connection pool, no more messages.  Comment this line out to continue sending emails.
    });
});


app.get('/user/create', function (req, res) {
    res.render('new_user', {
        title: 'New User'
    });
});

app.post('/', function (req, res) {
    employeeProvider.findByName({
        name: req.param('name'),
        password: req.param('password')
    }, function (error, docs) {
        console.log(docs);
        if (!docs) {
            console.log('Not found user');
        } else {
            res.cookie('rememberme', 'yes', { maxAge: 900000, httpOnly: false});
            res.cookie('_id', docs._id, { maxAge: 900000, httpOnly: false});
        }
        res.redirect('/');
    })
});

app.post('/add-link', function(req, res){
    employeeProvider.addLinkToDb({
        title: req.param('link'),
        description: '',
        user: req.cookies._id
    }, function(error, docs){

        res.redirect('/');
    })
});


app.get('/log-out', function(req, res){
    res.clearCookie('rememberme');
    res.clearCookie('_id');
    res.redirect('/');
});

app.get('/', function (req, res) {
    var userIsset = req.cookies.rememberme;
    if (userIsset == 'yes') {
        employeeProvider.findAllLinks({
           user: req.cookies._id
        }, function (error, emps) {
            for(var i = 0; i<emps.length; i++){
                emps[i].date = emps[i].date.toDateString();
                if(emps[i].title.split('//').length == 1){
                    emps[i].link = 'http://'+ emps[i].title;
                }else{
                    emps[i].link = emps[i].title;
                }
            }
            res.render('index', {userIsset: userIsset, links: emps});
        });
    }else{
        res.render('index', {userIsset: userIsset});
    }
});

app.get('/technology', function(req, res){
    res.render('technology');
})

//save new user
app.post('/user/create', function (req, res) {
    employeeProvider.save({
        title: req.param('title'),
        name: req.param('name')
    }, function (error, docs) {
        res.redirect('/')
    });
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
