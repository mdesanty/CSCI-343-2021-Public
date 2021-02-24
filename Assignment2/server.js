/*
Testing URLs (in order):

http://localhost:3000/add?song=Happy%20Birthday
{"songs":["Happy Birthday"]}

http://localhost:3000/add?song=Circles
{"songs":["Happy Birthday","Circles"]}

http://localhost:3000/add?song=CIRCLES
{"songs":["Happy Birthday","Circles"]}

http://localhost:3000/add?song=Alphabet
{"songs":["Happy Birthday","Circles","Alphabet"]}

http://localhost:3000/add?song=Circles
{"songs":["Happy Birthday","Circles","Alphabet"]}

http://localhost:3000/
{"songs":["Happy Birthday","Circles","Alphabet"]}

http://localhost:3000/sort
{"songs":["Alphabet","Circles","Happy Birthday"]}

http://localhost:3000/
{"songs":["Happy Birthday","Circles","Alphabet"]}

http://localhost:3000/remove?song=Something
{"songs":["Happy Birthday","Circles","Alphabet"]}

http://localhost:3000/remove?song=CIRCLES
{"songs":["Happy Birthday","Alphabet"]}

http://localhost:3000/
{"songs":["Happy Birthday","Alphabet"]}

http://localhost:3000/sort
{"songs":["Alphabet","Happy Birthday"]}

http://localhost:3000/
{"songs":["Happy Birthday","Alphabet"]}
*/

const express = require("express");
const app = express();

const session = require("express-session");
app.use(
  session(
    {
      secret: "happy jungle",
      resave: false,
      saveUninitialized: false,
      cookie: {maxAge: 60000}
    }
  )
);

app.get("/", listSongs);
app.get("/sort", sortSongs);
app.get("/add", addSong);
app.get("/remove", removeSong);
app.get("/clear", clearSongs);

app.listen(3000, process.env.IP, startHandler());

function startHandler()
{
  console.log("Server listening on port 3000.");
}

function listSongs(req, res)
{
  let result = {};

  try
  {
    initializeSessionSongs(req);
    result = {songs: req.session.songs};
  }
  catch(e)
  {
    result = handleError(e);
  }
  finally
  {
    writeResult(res, result);
  }
}

function sortSongs(req, res)
{
  let result = {};

  try
  {
    initializeSessionSongs(req);

    let songsCopy = [...req.session.songs];
    result = {songs: songsCopy.sort()};
  }
  catch(e)
  {
    result = handleError(e);
  }
  finally
  {
    writeResult(res, result);
  }
}

function addSong(req, res)
{
  let result = {};

  try
  {
    initializeSessionSongs(req);
    let song = req.query.song;

    if(song)
    {
      let lowerCaseSong = lowerCaseString(song);
      let lowerCaseSongs = lowerCaseArray(req.session.songs);

      if(!lowerCaseSongs.includes(lowerCaseSong)) { req.session.songs.push(song); }
    }

    result = {songs: req.session.songs};
  }
  catch(e)
  {
    result = handleError(e);
  }
  finally
  {
    writeResult(res, result);
  }
}

function removeSong(req, res)
{
  let result = {};

  try
  {
    initializeSessionSongs(req);
    let song = req.query.song;

    if(song)
    {
      let lowerCaseSong = lowerCaseString(song);
      let lowerCaseSongs = lowerCaseArray(req.session.songs);

      let index = lowerCaseSongs.indexOf(lowerCaseSong);
      if (index !== -1) { req.session.songs.splice(index, 1); }
    }

    result = {songs: req.session.songs};
  }
  catch(e)
  {
    result = handleError(e);
  }
  finally
  {
    writeResult(res, result);
  }
}

function clearSongs(req, res)
{
  let result = {};

  try
  {
    req.session.songs = [];
    result = {songs: req.session.songs};
  }
  catch(e)
  {
    result = handleError(e);
  }
  finally
  {
    writeResult(res, result);
  }
}

function initializeSessionSongs(req)
{
  if (req.session.songs == undefined) { req.session.songs = []; }
}

function writeResult(res, result)
{
  res.writeHead(200, {"Content-Type": "application/json"});
  res.end(JSON.stringify(result));
}

function handleError(e)
{
  console.log(e.stack);
  return {error: e.message};
}

function lowerCaseString(string)
{
  return string.toString().trim().toLowerCase()
}

function lowerCaseArray(array)
{
  return array.map(i => i.toString().toLowerCase())
}