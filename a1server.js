http = require('http');
fs = require('fs');
path = require('path');

PORT = 31225;

MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.txt': 'text/plain'
};

var topics = [];
var count = 0;

function serveFile(filePath, response) {
  fs.exists(filePath, function(exists) {
    if (!exists) {
      response.writeHead(404);
      response.end();
      return;
    }

    fs.readFile(filePath, function(error, content) {
      if (error) {
        response.writeHead(500);
        response.end();
        return;
      }

      var extension = path.extname(filePath);
      var mimeType = MIME_TYPES[extension];
      response.writeHead(200,
                         {'Content-Type': mimeType ? mimeType : 'text/html'});
      response.end(content, 'uft-8');
    });
  });
}

http.createServer(function(request, response) {
	console.log(request.url);
	switch(request.url) {
		case '/':
			serveFile('./index.html', response);
			break;
		case '/style.css':
			serveFile('./style.css', response);
			break;
		case '/index.js':
			serveFile('./index.js', response);
			break;
		case '/addtopic':
			if (request.method == 'POST') {
				var buffer = '';		
				request.on('data', function(chunk) {
					buffer += chunk;
				});
				request.on('end', function() {
					response.writeHead(200);
					response.end();
					topics[count] = JSON.parse(buffer);
					topics[count].vote = 0;
					count++;
				});
			}
			else {
				response.writeHead(405);				
			}
			break;
		case '/json':
			if (request.method == 'GET') {
				response.writeHead(200, {'Content-Type':'application/json'});
				response.end(JSON.stringify(topics[count-1]));
			}
			else {
				response.writeHead(405);				
			}
			break;
		case '/jsonall':
			if (request.method == 'GET') {
				if (count > 0) {
					var data = '';
					response.writeHead(200, {'Content-Type':'text/plain'});
					for (var i=0;i<count;i++){
						data += JSON.stringify(topics[i]) + ';';
					}
					console.log(data);
					response.write(data);
					response.end();
				}
			}
			else {
				response.writeHead(405);				
			}
			break;
		default:
			response.writeHead(404);
			response.end('Not found.');
	};
}).listen(PORT);

console.log('Server running at http://127.0.0.1:' + PORT + '/');

