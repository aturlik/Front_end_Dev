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

router.get('/comments', function(req, res, next) {
  res.render('comments');
});

router.get("/get-data", function(req, res, next) {
  var spectopic = req.query.topic;
  var specdata = req.query.data; 
  var resultArray = [];
  var query = {};
  query[spectopic] = RegExp(sanitize(specdata));
  var FOP = req.query.cost;
  var convertFOP = '';
  if (FOP == "Free"){
    query["Cost"] = {$in: ["0", "$0"]};
  }
  else if (FOP == "Paid" ) {
    query["Cost"] = {'$ne': '0'};
  }
  else{
    null;
  };
  var skill = req.query.level;
  if (skill != null){
    if(skill.includes(",")){
      skill = skill.split(",");
      query["Barrier to Entry"] = {$in : skill};
    }
    else{
      query["Barrier to Entry"] = skill;
    };
  }
  var Pubdod = req.query.public;
  if (Pubdod != null){
    if(Pubdod.includes(",")){
      Pubdod = Pubdod.split(",");
      query["Public/DOD"] = {$in : Pubdod};
    }
    else{
      query["Public/DOD"] = Pubdod;
    };
  }
  var remoteornah = req.query.remote;
  if (remoteornah != null){
    if(remoteornah.includes(",")){
      remoteornah = remoteornah.split(",");
      query["In person vs Remote"] = {$in : remoteornah};
    }
    else{
      query["In person vs Remote"] = remoteornah;
    };
  }
  var selfornah = req.query.self;
  if (selfornah != null){
    if(selfornah.includes(",")){
      selfornah = selfornah.split(",");
      query["Self Paced vs Instructor Led"] = {$in : selfornah};
    }
    else{
      query["Self Paced vs Instructor Led"] = selfornah;
    };
  }
  var learnornah = req.query.learn;
  if (learnornah != null){
    if(learnornah.includes(",")){
      learnornah = learnornah.split(",");
      console.log(learnornah);
      query["Learning type"] = {$in : learnornah};
    }
    else{
      query["Learning type"] = learnornah;
    };
  }
  mongo.connect(url, {useUnifiedTopology: true}, function(err, client) {
    var db = client.db('Trainings');
    assert.equal(null, err);
    var cursor = db.collection('RawData1').aggregate([{'$search': {'text': {'query': specdata,'path': {'wildcard': '*'}}}}]);
    cursor.forEach(function(doc, err) {
      assert.equal(null, err);
      resultArray.push(doc);
    }, function() {
      client.close();
      specdata = specdata.replace(/ /g, "_");
      spectopic = spectopic.replace(/ /g, "_");
      res.render('get', {items: resultArray, specdata, spectopic});
    });
  });
});

router.post('/get-data/vote', function(req, res, next){
	var found = null;
	var dataUrl = window.location.href;
	var vote = req.body.Vote;
	var inc = 0;

	if(vote == "Liked"){
		inc = 1;
	}else{
		inc = -1;
	}

	var item = {
		id: req.body.id,
		voteCount: vote
	};

	mongo.connect(url,  {useUnifiedTopology: true}, function(err, client) {
		var db = client.db('Trainings');
		assert.strictEqual(null, err);
		var spefVote = db.collection('VotingData').find({}, {id: req.body.id} ).toArray();


		if(spefVote.length > 0){
			console.log('Did find');
			db.collection('VotingData').updateOne(item, function(err, result) {
				assert.strictEqual(null, err);
				client.close();
			});
		}else{
			console.log('Did not find');
			db.collection('VotingData').insertOne(item, function(err, result) {
				assert.strictEqual(null, err);
				client.close();
			});
		}
	});

	res.redirect(dataUrl);
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
  if(topic.length != 0){
    topic.pop();
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

router.post('/comments', function(req, res, next) {
  var item = {
    Comments: req.body.bugs
  };
  
  mongo.connect(url,  {useUnifiedTopology: true}, function(err, client) {
    var db = client.db('Trainings');
    assert.strictEqual(null, err);
    db.collection('Bugs and Comments').insertOne(item, function(err, result) {
      assert.strictEqual(null, err);
      client.close();
    });
  });
  res.redirect('/comments');
});

router.post('/get_data', function(req, res, next) {
  var cost = req.body.TST;
  var level = req.body.LVL;
  var public = req.body.PDOD;
  var remote = req.body.RIP;
  var selfp = req.body.SPIL;
  var learn = req.body.LRN;
  var st = req.body.ST;
  var sd = req.body.SD; 
  st = st.replace(/_/g, " ")
  sd = sd.replace(/_/g, " ")
  console.log(st);
  var urladditives = "";
  if(cost != null){
    urladditives = urladditives.concat("&cost=" + cost)
  };
  if(level != null){
    urladditives = urladditives.concat("&level=" + level)
  };
  if(public != null){
    urladditives = urladditives.concat("&public=" + public)
  };
  if(remote != null){
    urladditives = urladditives.concat("&remote=" + remote)
  };
  if(selfp != null){
    urladditives = urladditives.concat("&self=" + selfp)
  };
  if(learn != null){
    urladditives = urladditives.concat("&learn=" + learn)
  };
  res.redirect("/get-data?topic=" + st + "&data=" + sd + urladditives);
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
