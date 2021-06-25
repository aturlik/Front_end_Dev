var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var assert = require('assert');
let mongoose = require('mongoose');
var sanitize = require('mongo-sanitize');

var url = 'mongodb+srv://dtbishop:testpass@data01.8o2pb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/insert', function(req, res, next) {
  res.render('add');
});

router.get('/admin', function(req, res, next) {
  res.render('admin');
});

router.get('/request', function(req, res, next) {
  res.render('request');
});

router.get("/get-data", function(req, res, next) {
  console.log('gothere');
  var spectopic = req.query.topic;
  var specdata = req.query.data; 
  console.log(spectopic);
  console.log(specdata);
  var resultArray = [];
  var query = {};
  query[spectopic] = RegExp(sanitize(specdata));
  mongo.connect(url, {useUnifiedTopology: true}, function(err, client) {
    var db = client.db('Trainings');
    assert.equal(null, err);
    var cursor = db.collection('RawData1').find(query);
    cursor.forEach(function(doc, err) {
      assert.equal(null, err);
      resultArray.push(doc);
    }, function() {
      client.close();
      res.render('get', {items: resultArray});
    });
  });
});

router.post('/insert', function(req, res, next) {
  var learning = req.body.LT
  if(learning != null){
    learning = learning.join(", ");
  };
  var language = req.body.LPS;
  var topic = req.body.DTA;
  if(language != null){
    language = language.join(", ");
  };
  if(topic != null){
    topic = topic.join(", ");
  };
  var item = {
    Title: req.body.title,
    URL: req.body.url,
    Provider: req.body.provider,
    Cost: req.body.cost,
    PublicOrDOD: req.body.PDOD,
    TimeCommitment: req.body.TCH,
    Cert_Degree: req.body.CDP,
    Data_Topics: topic,
    Programming_Language: language,
    Base_of_Operations: req.body.BOO,
    Barrier: req.body.BE,
    Self_Paced: req.body.SPIL,
    Learning_Type: learning,
    InPerson: req.body.PR,
    Comment: req.body.comment,
    Topics: req.body.TG
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
  res.redirect('/insert');
});

router.post('/specify', function(req, res, next) {
  spectopic = req.body.DTA;
  specdata = req.body.SpefString;
  console.log('/get-data/top/{spectopic}/data/{specdata}');
  res.redirect("/get-data?topic=" + spectopic + "&data=" + specdata);
});


router.post('/request', function(req, res, next) {
  var item = {
    Request: req.body.request,
    Comments: req.body.comments
  };
  
  mongo.connect(url,  {useUnifiedTopology: true}, function(err, client) {
    var db = client.db('Trainings');
    assert.strictEqual(null, err);
    db.collection('User Requests').insertOne(item, function(err, result) {
      assert.strictEqual(null, err);
      console.log('Item inserted');
      client.close();
    });
  });
  res.redirect('/request');
});

router.post('/update', function(req, res, next) {
  var item = {
    title: req.body.title,
    url: req.body.url,
    provider: req.body.provider,
    cost: req.body.cost,
    PublicDOD: req.body.PDOD,
    TimeCom: req.body.TCH,
    Cert: req.body.CDP,
    Data: req.body.DTA,
    Program: req.body.PL,
    Base: req.body.BOO,
    Barrier: req.body.BE,
    Pacing: req.body.SPIL,
    Learning: req.body.LT,
    Person: req.body.PR,
    Useful: req.body.UT,
    Comment: req.body.comment,
    Topics: req.body.TG
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
  res.redirect('/others');
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
  res.redirect('/others');
});

module.exports = router;
