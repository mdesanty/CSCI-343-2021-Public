const express = require("express");
const session = require("express-session");
const mysql = require("mysql");

const app = express();

const connectionInfo = {
    host: "localhost",
    user: "root",
    password: "",
    database: "GuessingGameDb"
};

const sessionOptions = {
  secret: "happy jungle",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 600000 }
};
app.use(session(sessionOptions));

app.get("/", instructions);
app.get("/game", game);
app.get("/stats", stats);
app.listen(3000,  process.env.IP, startHandler());

function startHandler() {
  console.log("Server listening at " + process.env.IP + ":3000");
}

function instructions(req, res) {
  res.writeHead(200, {"Content-Type": "text/html"});

  res.write("<h1>Number Guessing Game</h1>");
  res.write("<p>Use /game to start a new game.</p>");
  res.end("<p>Use /game?guess=num to make a guess.</p>");
}

function game(req, res) {
  let result = {};

  try {
    if (!req.session.answer) { resetGame(req); }

    if (req.query.guess == undefined) {
      result = {gameStatus: "Pick a number from 1 to 100."};
      resetGame(req);
    }
    else {
      result = evaluateGuess(req, res);
    }
  }
  catch (e) {
    result = handleError(e);
  }

  if(result) { writeResult(res, result); }
}

function resetGame(req) {
  req.session.guesses = 0;
  req.session.answer = Math.floor(Math.random() * 100) + 1;
}

function evaluateGuess(req, res) {
  validateGuess(req);

  if(isGuessCorrect(req)) {
    result = winGame(req, res);
  }
  else if(isGuessTooHigh(req)) {
    incrementGuesses(req);
    result = {gameStatus: "Too high. Guess again!", guesses: req.session.guesses};
  }
  else {
    incrementGuesses(req);
    result = {gameStatus: "Too low. Guess again!", guesses: req.session.guesses};
  }

  return result;
}

function validateGuess(req) {
  let guess = parseInt(req.query.guess);
  let message = "Guess must be a number between 1 and 100.";

  if(isNaN(guess)) { throw Error(message); }
  if(guess < 1 || guess > 100) { throw Error(message); }
}

function isGuessCorrect(req) {
  return req.query.guess == req.session.answer
}

function winGame(req, res) {
  incrementGuesses(req);
  req.session.answer = undefined;

  saveGame(req, res);
  return undefined;
}

function incrementGuesses(req) {
  req.session.guesses += 1;
}

function saveGame(req, res) {
  let connection = mysql.createConnection(connectionInfo);
  connection.connect(function(err) {
    if(err)
      writeResult(res, {error: "Error connecting to database: " + err.message});
    else {
      connection.query("INSERT INTO Games (TotalGuesses) VALUES (?)", [req.session.guesses], function (err, data, fields) {
        if(err) {
          result = handleError(err);
        }
        else {
          result = {gameStatus: `Correct! It took you ${req.session.guesses} guesses. Play Again!`};
        }

        writeResult(res, result);
      });
    }
  });
}

function isGuessTooHigh(req) {
  return req.query.guess > req.session.answer
}

function writeResult(res, result) {
  res.writeHead(200, {"Content-Type": "application/json"});
  res.end(JSON.stringify(result));
}

function stats(req, res) {
  let connection = mysql.createConnection(connectionInfo);
  connection.connect(function(err) {
    if(err)
      writeResult(res, {error: "Error connecting to database: " + err.message});
    else {
      let sql = "SELECT COALESCE(MAX(TotalGuesses), 'n/a') AS worst, COALESCE(MIN(TotalGuesses), 'n/a') AS best, COUNT(id) AS gamesPlayed FROM Games";
      connection.query(sql, function(err, data, fields) {
        let result = {};

        if(err) {
          result = handleError(err);
        }
        else {
          result = {result: data[0]};
        }

        writeResult(res, result);
      });
    }
  });
}