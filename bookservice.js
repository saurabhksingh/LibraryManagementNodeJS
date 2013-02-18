var mongo = require('mongodb');
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure,
    urlParser = require('url'),
    nodemailer = require("nodemailer");

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('booksdb', server);

db.open(function(err, db) {
    console.log("****************** Trying to open connection to DB **************");
    if(!err) {
        console.log("Connected to 'booksdb' database");
        db.collection('books', {safe:false}, function(err, collection) {
            if (err) {
                console.log("The 'books' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});

var http = require("http");
var querystring = require("querystring");

exports.findAll = function(req, res) {
    db.collection('books', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
   // res.send([{name:'The Art of Programming'}, {name:'Programming Pearls'}, {name:'Beautiful Code'}]);
};
 
exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving book: ' + id);
    db.collection('books', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.searchBook = function(req, res) {

    //var distance = getLevenshteinEditDistance('song', 'bong');
    var url_parts = urlParser.parse(req.url, true);
    var requestQuery = url_parts.query['bookTitle'];//req.body['bookTitle'];//
    console.log('The search title is : '+ requestQuery);
    //var condition = {"name":queryTitle};
    var self = this;
    //var expressapp = app;
    db.collection('books', function(err, collection) {
            collection.find().toArray(function(err, items) {
                var filterItems = [];
                if(requestQuery)
                {
                  requestQuery = requestQuery.toLowerCase();
                }
                items.forEach(function(item) { 
                        var orgName = item["name"];
                	//console.log("comparing : "+orgName+" with : "+requestQuery);
                	if(orgName && requestQuery)
                	{
                	   orgName = orgName.toLowerCase();
                	   try
                	   {
                	   	if(orgName.match(requestQuery)
				                || (orgName.indexOf(requestQuery)!= -1)
				                || (getLevenshteinEditDistance(orgName, requestQuery) <5))
							   
				              {
					               filterItems.push(item);
                	   	}
                	   }
                	   catch(err){}
			           }
            }
          );
    self.model=filterItems;
    //expressapp.navigate('books', false);
    res.send(filterItems);
            });
    });
};

exports.addBook = function(req, res) {
    var book = req.body;
    console.log('The request body is : '+ book);
    console.log('Adding book: ' + JSON.stringify(book));
    db.collection('books', function(err, collection) {
        collection.insert(book, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

var getLevenshteinEditDistance = function(a, b){
  if(a.length == 0) return b.length; 
  if(b.length == 0) return a.length; 
 
  var matrix = [];
 
  // increment along the first column of each row
  var i;
  for(i = 0; i <= b.length; i++){
    matrix[i] = [i];
  }
 
  // increment each column in the first row
  var j;
  for(j = 0; j <= a.length; j++){
    matrix[0][j] = j;
  }
 
  // Fill in the rest of the matrix
  for(i = 1; i <= b.length; i++){
    for(j = 1; j <= a.length; j++){
      if(b.charAt(i-1) == a.charAt(j-1)){
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                Math.min(matrix[i][j-1] + 1, // insertion
                                         matrix[i-1][j] + 1)); // deletion
      }
    }
  }
 
  return matrix[b.length][a.length];
};

exports.updateBook = function(req, res) {
    var id = req.params.id;
    var book = req.body;
    console.log(book);
    console.log('Updating book: ' + book["_id"]);
    book["_id"] = new BSON.ObjectID(book["_id"]);
    console.log(req.body);
    if(book["owner"] != book["oldOwnerId"])
    {
        sendMail(req, res);
    }
    delete book["oldOwnerId"];
    db.collection('books', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, book, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating book: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(book);
            }
        });
    });
}

exports.deleteBook = function(req, res) {
    var id = req.params.id;
    console.log('Deleting book: ' + id);
    db.collection('books', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}

var sendMail = function(req, res){
    var book = req.body;
    //console.log(req);
    var newAssignee = book["owner"];
    var oldAssignee =  book["oldOwnerId"];
    var bookName = book["name"];
    var currentUrl = req.protocol+"://"+req.header('host')+"#"+req.url;

    var smtpTransport = nodemailer.createTransport("SMTP", {
        host: "localhost", // hostname
        //secureConnection: true, // use SSL
        port: 25, // port for secure SMTP
        auth: {
            user: "expedialibrary@expedia.com",
            pass: "password"
        }
    });
    var htmlBody = "Click on this <a href='"+currentUrl+"'>"+"link</a> to see more details";
    console.log("****************"+currentUrl+"***************");
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: "Expedia Library<expedialibrary@expedia.com>", // sender address
        to: newAssignee, // list of receivers
        cc: oldAssignee,
        subject:"You have been allocated book '"+bookName+"'", // Subject line
        html: htmlBody // html body
    };
    console.log("New Assignee" + newAssignee);
    var data = querystring.stringify({
          title: bookName,
          link: currentUrl,
          previousOwner : oldAssignee,
          currentOwner : newAssignee
    });
    
    var options = {
        host: 'emailbookupdate.appspot.com',
        port: 80,
        path: '/api/sendmail',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length
        }
     };
     
     var req = http.request(options, function(res) {
         res.setEncoding('utf8');
         res.on('data', function (chunk) {
             console.log("body: " + chunk);
         });
     });
      
     req.write(data);
     req.end();

    // send mail with defined transport object
    /*smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }

        // if you don't want to use this transport object anymore, uncomment following line
        //smtpTransport.close(); // shut down the connection pool, no more messages
    });
*/
};

var populateDB = function() {
 
    var books = [
    {
  "name" : "Programming Pearls",
  "author" : "John Bentley",
  "year" : "1997",
  "description" : "The first edition of Programming Pearls was one of the most influential books I read early in my career, and many of the insights I first encountered ...",
  "picture" : "programmingpearls.jpeg",
  "owner" : "anuraag@expedia.com" },
    { "_id" : ObjectId( "50d0211673cf0629771c88a0" ),
  "name" : "Beautiful Code",
  "year" : "2007",
  "author" : "Greg Wilson, Andy Oram",
  "description" : "How do the experts solve difficult problems in software development? In this unique and insightful book, leading computer scientists offer case studies that reveal how they found unusual, carefully designed solutions to high-profile projects.",
  "owner" : "anuraag@expedia.com",
  "picture" : "beucode.jpeg" },
  { "_id" : ObjectId( "50d0214f73cf0629771c88a1" ),
  "name" : "Art of Computer Programming",
  "author" : "Donal E. Knuth",
  "year" : "1997",
  "description" : "The bible of all fundamental algorithms and the work that taught many of today’s software developers most of what they know about computer programming",
  "picture" : "aocp.jpeg",
  "owner" : "anuraag@expedia.com" }
  ];
 
    db.collection('books', function(err, collection) {
        collection.insert(books, {safe:true}, function(err, result) {});
    });
 
};
