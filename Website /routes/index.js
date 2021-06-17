var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var assert = require('assert');
let mongoose = require('mongoose');

var url = 'mongodb+srv://dtbishop:testpass@data01.8o2pb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
var spectopic = '';
var specdata = '';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/get-data', function(req, res, next) {
  var resultArray = [];
  var query = {};
  query[spectopic] = RegExp(specdata);
  console.log(specdata);
  console.log(spectopic);
  mongo.connect(url, {useUnifiedTopology: true}, function(err, client) {
    var db = client.db('Trainings');
    assert.equal(null, err);
    var cursor = db.collection('RawData1').find(query);
    cursor.forEach(function(doc, err) {
      assert.equal(null, err);
      resultArray.push(doc);
    }, function() {
      client.close();
      res.render('index', {items: resultArray});
    });
  });
});

router.post('/insert', function(req, res, next) {
  var item = {
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  };
  
  mongo.connect(url,  {useUnifiedTopology: true}, function(err, client) {
    var db = client.db('Trainings');
    assert.strictEqual(null, err);
    db.collection('User Inputs').insertOne(item, function(err, result) {
      assert.strictEqual(null, err);
      console.log('Item inserted');
      client.close();
    });
  });

  res.redirect('/');
});

router.post('/specify', function(req, res, next) {
  spectopic = req.body.DTA;
  specdata = req.body.SpefString;
  res.redirect('/');
});


router.post('/update', function(req, res, next) {
  var item = {
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  };
  var id = req.body.id;

  mongo.connect(url, function(err, client) {
    var db = client.db('Trainings');
    assert.equal(null, err);
    db.collection('User Inputs').updateOne({"_id": objectId(id)}, {$set: item}, function(err, result) {
      assert.equal(null, err);
      console.log('Item updated');
      client.close();
    });
  });
  res.redirect('/');
});

router.post('/delete', function(req, res, next) {
  var id = req.body.id;

  mongo.connect(url, function(err, client) {
    var db = client.db('Trainings');
    assert.equal(null, err);
    db.collection('User Inputs').deleteOne({"_id": objectId(id)}, function(err, result) {
      assert.equal(null, err);
      console.log('Item deleted');
      client.close();
    });
  });
  res.redirect('/');
});

module.exports = router;
