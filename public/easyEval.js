var http = require('http');
var fs = require('fs');


http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile('./startGroup.html', function(err,data){
        if (err) {
            res.writeHead(404, {"Content-Type": 'text/html'});
            return res.end("404")
        }
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write(data);
        return res.end();

    });
}).listen(8080);