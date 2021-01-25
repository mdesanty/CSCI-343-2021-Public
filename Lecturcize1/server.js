var http = require('http');
var server = http.createServer(requestHandler); 
server.listen(3000, 'localhost', startHandler);

function startHandler()
{
  var addr = server.address();
  console.log("Server listening at localhots:3000");
}

function requestHandler(req, res) 
{
    console.log("Handling a request")
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<p>Hello!!!</p>');
    res.end('<p>Have a nice day!!!</p>');
}