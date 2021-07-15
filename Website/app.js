var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars');
var sanitize = require('mongo-sanitize');
const Handlebars = require('handlebars')
var url = 'mongodb+srv://dtbishop:testpass@data01.8o2pb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'; /* Connection string for our specific cluster */
const mongodb = require("mongodb").MongoClient;
var mongo = require('mongodb').MongoClient;
const fastcsv = require("fast-csv");
const fs = require("fs");
const ws = fs.createWriteStream("public/files/FullDatabase.csv");
var indexRouter = require('./routes/index');


var app = express();

// view engine setup
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

app.use('/', indexRouter);



  mongo.connect(url,  {useUnifiedTopology: true}, function(err, client) {
    var db = client.db('Trainings').collection("FormattedRawData")
    .find({})
    .toArray((err, data) => {
      if (err) throw err;
      fastcsv
        .write(data, { headers: true })
        .on("finish", function() {
          console.log("Write to FullDatabase.csv successfully!");
        })
        .pipe(ws);
      client.close();
    });
  });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});




// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
