/* Required Imports */
var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var assert = require('assert');
let mongoose = require('mongoose');
var sanitize = require('mongo-sanitize');
var jssanitizer = require('sanitize')();
const { MongoClient } = require("mongodb");
const helmet = require('helmet');
const app = express();
app.use(helmet.frameguard({ action: 'SAMEORIGIN' }));
var url = 'mongodb+srv://dtbishop:testpass@data01.8o2pb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'; /* Connection string for our specific cluster */

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
/* Add Data Page */
router.get('/insert', function(req, res, next) {
  res.render('add');
});
/* Function for putting idsearch into admin ID */
router.post('/adminsearch', function(req, res, next) {
   var id = req.body.idsearch;
   res.redirect('/admin?idsearch=' + id);
});
/* Admin page renders here, if idsearch is in url then searches for that id in database */
router.get('/admin', async(req, res, next) => {
  var id = req.query.idsearch;
  var results = []; /* array to put result in if object with id is found */
  if (id !="") {
    try {
    var client = new MongoClient(url); /* Connect to the cluster */
    await client.connect(); /* Pauses and allows for the connection */
    var data = await client.db("Trainings"); /* Pauses and enters the Trainings database */
    var o_id = objectId(id); /* Converts the string id into an ObjectID for database search */
    var result = await data.collection("FormattedRawData").findOne({"_id":o_id}); /* Enters our collection for the resources, then searches for the ID */
    }       
    catch (e) {
	   console.error(e); /* error catch */
    }
    finally {
	    await client.close(); /* Closes connection to the database */
	    res.render('admin', {id:id, result:result}); 
    }
  }
  else {
	res.render('admin', {id: "how you hit this"});
  }
});
/* Request page renders here */
router.get('/request', function(req, res, next) {
  res.render('request');
});
/* Comments page renders here */
router.get('/comments', function(req, res, next) {
  res.render('comments');
});
/* Renders get data page and collections various datapoints into an array that can be accessed in the html/hbs file */
router.get("/get-data", function(req, res, next) {
  var specdata = req.query.data; 
  var resultArray = [];
  var query = {};
  var FOP = req.query.cost;
  var convertFOP = '';
  if (FOP == "Free"){
    query["Cost"] = "0";
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
      query["Learning type"] = {$in : learnornah};
    }
    else{
      query["Learning type"] = learnornah;
    };
  }
  mongo.connect(url, {useUnifiedTopology: true}, function(err, client) {
    var db = client.db('Trainings');
    assert.equal(null, err);
    var cursor = db.collection('FormattedRawData').aggregate([{'$search': {"index" : "SearchFormatted", 'text': {'query': specdata,'path': {'wildcard': '*'}}}}, {'$match': query}]);
    cursor.forEach(function(doc, err) {
      assert.equal(null, err);
      resultArray.push(doc);
    }, function() {
      client.close();
      specdata = specdata.replace(/ /g, "_");
      res.render('get', {items: resultArray, specdata});
    });
  });
});
/* Search function that takes the search bar input and searches MongoDB for things that fit search terms */
router.get("/search", async (request, response) => {
  try {
    const client = new MongoClient('mongodb+srv://dtbishop:testpass@data01.8o2pb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useUnifiedTopology: true });
    await client.connect();
    var db = client.db('Trainings');
    let result = await db.collection('FormattedRawData').aggregate([{'$search': {"index" : "SearchFormatted", 'text': {'query': `${request.query.term}`,'path': {'wildcard': '*'}, 'fuzzy': {"maxEdits": 1}}}}
  ]).toArray(); /* Searches using built in MongoDB search engine feature 'MongoDB Atlas Search.' Has many different features and tools that can be adjusted */
  const uniqueresult = Array.from(
    result.reduce((acc, o) =>
      !acc.has(o.Title) || o.amount > 0 ? acc.set(o.Title, o) : acc, new Map())
    .values()
  );
  result = uniqueresult;
  response.send(result.slice(0, 20));
  } catch (e) {
    response.status(500).send({message: e.message});
  }
})
/* Function that sets up the voting features of the results page */
router.post('/get-data/vote', function(req, res, next){
	var dataUrl = req.body.url;
	var inital = 0;

	if(req.body.Vote == "Liked"){
		inital = 1;
	}
	
	var query = {
		"_id": mongoose.Types.ObjectId(req.body.id) 
	};

	mongo.connect(url,  {useUnifiedTopology: true}, function(err, client) {
		var db = client.db('Trainings');
		assert.strictEqual(null, err);

		async function run(){
			const file =  await db.collection('FormattedRawData').find(query).toArray();
			
			if(file.length > 0){
				if(file[0].hasOwnProperty("voteCount")){
					var voteVal = file[0].vote + inital;
					var countVal = file[0].voteCount + 1;
				
					db.collection('FormattedRawData').updateOne(query, {$inc: {vote: inital , voteCount: 1}, $set: {"Helpfullness Rating": ((voteVal/countVal)*100).toFixed()}}, function(err, result) {
						assert.strictEqual(null, err);
						client.close();
					});
				}else{
					db.collection('FormattedRawData').updateOne(query, {$unset: {"Useful Training?": ""}, $set: {"Helpfullness Rating": ((inital/1)*100).toFixed(), vote: inital, voteCount: 1}}, function(err, result) {
						assert.strictEqual(null, err);
						client.close();
					});
				}
			}
		}
		run().then(()=>res.redirect(dataUrl));
	});

	
});
/* Section that renders Add Data page and puts it into a seperate collection for 
manual validation of data before moving into the main collection */
router.post('/insert', function(req, res, next) {
  var learning = req.body.LT
  if(learning != null && learning.length>2){
    learning = learning.join(", ");
  };
  var language = req.body.LPS;
  var topic = req.body.DTA;
  if(language != null && language.length>1){
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
    "Public/DOD": req.body.PDOD,
    "Time Commitment (Hours)": req.body.TCH,
    "Certificate/Degree Program": req.body.CDP,
    "Data Topic Area": topic,
    "Programming Language": language,
    "Base of Operations": req.body.BOO,
    "Barrier to Entry": req.body.BE,
    "Self Paced vs Instructor Led": req.body.SPIL,
    "Learning type": learning,
    "In person vs Remote": req.body.PR,
    Comment: req.body.comment,
  };
  
  mongo.connect(url,  {useUnifiedTopology: true}, function(err, client) {
    var db = client.db('Trainings');
    assert.strictEqual(null, err);
    db.collection('User Inputs').insertOne(item, function(err, result) { /* Inserts the data into 'User Inputs' Collection here */
      assert.strictEqual(null, err);
      client.close();
    });
  });
  res.redirect('/insert');
});

router.post('/specify', function(req, res, next) {
  specdata = jssanitizer.value(req.body.SpefString, 'str');
  var cost = req.body.TST;
  var level = req.body.LVL;
  var public = req.body.PDOD;
  var remote = req.body.RIP;
  var selfp = req.body.SPIL;
  var learn = req.body.LRN;
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
    urladditives = urladditives.concat("&pacing=" + selfp)
  };
  if(learn != null){
    urladditives = urladditives.concat("&learn=" + learn)
  };
  res.redirect("/get-data?data=" + specdata + urladditives);
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
      client.close();
    });
  });
  res.redirect('/request');
});

router.post('/auto-request', function(req, res, next){
	var currUrl = req.body.request;
	var contents = currUrl.slice(currUrl.indexOf("?"), currUrl.length);

	res.redirect('/request' + contents);
})

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
  if (req.body.SpefString != ""){
    sd = req.body.SpefString;
  }
  else{
    var sd = req.body.SD; 
    sd = sd.replace(/_/g, " ")
  }
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
    urladditives = urladditives.concat("&pacing=" + selfp)
  };
  if(learn != null){
    urladditives = urladditives.concat("&learn=" + learn)
  };
  res.redirect("/get-data?data=" + sd + urladditives);
});

router.post('/update', function(req, res, next) {
  var learning = req.body.LT
  if(learning != null && learning[1].length>1){
    learning = learning.join(", ");
  };
  var language = req.body.LPS;
  var topic = req.body.DTA;
  if(language != null && language[1].length>1){
    language = language.join(", ");
  };
  if(topic.length != 0 && topic[1].length>1){
    console.log(topic);
    topic.pop();
    topic = topic.join(", ");
  };
  var item = {
    Title: req.body.title,
    URL: req.body.url,
    Provider: req.body.provider,
    Cost: req.body.cost,
    "Public/DOD": req.body.PDOD,
    "Time Commitment (Hours)": req.body.TCH,
    "Certificate/Degree Program": req.body.CDP,
    "Data Topic Area": topic,
    "Programming Language": language,
    "Base of Operations": req.body.BOO,
    "Barrier to Entry": req.body.BE,
    "Self Paced vs Instructor Led": req.body.SPIL,
    "Learning type": learning,
    "In person vs Remote": req.body.PR,
    Comment: req.body.comment,
  };
  
  var id = req.body.idsearchinput;
  mongo.connect(url, function(err, client) {
    var db = client.db('Trainings');
    assert.equal(null, err);
    db.collection('FormattedRawData').updateOne({"_id": objectId(id)}, {$set: item}, function(err, result) {
      assert.equal(null, err);
      client.close();
    });
  });
  res.redirect('/admin?idsearch=' + id);
});

router.post('/delete', function(req, res, next) {
  var id = req.body.id;

  mongo.connect(url, function(err, client) {
    var db = client.db('Trainings');
    assert.equal(null, err);
    db.collection('FormattedRawData').deleteOne({"_id": objectId(id)}, function(err, result) {
      assert.equal(null, err);
      client.close();
    });
  });
  res.redirect('/admin');
});

router.post('/report', function(req, res, next) {
  var items = req.body.report;
  var itemid = req.body.reportid;
  if(String(typeof(items)) != "string"){
    items = items.filter(test => test.length > 1);
    items = items.join(", ");
  };
  var item = {"ReportedID": itemid, "Problem": items} ;
  mongo.connect(url,  {useUnifiedTopology: true}, function(err, client) {
    var db = client.db('Trainings');
    assert.strictEqual(null, err);
    db.collection('User Reports').insertOne(item, function(err, result) {
      assert.strictEqual(null, err);
      client.close();
    });
  });
  res.redirect('/get-data?data=data');
});



module.exports = router;
