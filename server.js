var express = require('express'),
	path = require('path'),
	http = require('http'),
	bookservice  = require('./bookservice.js');/*,
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));
*/
var app = express();
app.configure(function () {
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.static(path.join(__dirname, 'public')));
});

 
app.get('/books', bookservice.findAll);
app.get('/books/:id', bookservice.findById);
app.get('/searchBooks', bookservice.searchBook);
//});
app.post('/books', bookservice.addBook);
app.put('/books/:id', bookservice.updateBook);
app.delete('/books/:id', bookservice.deleteBook);
 
app.listen(8877,'0.0.0.0');
console.log('Listening on port 8877...');
