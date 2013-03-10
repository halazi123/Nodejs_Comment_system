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
var tcount = 0;
var ccount = 0;
var r = new Object;

function Topic(id, topic, link){
	this.id = id;
	this.topic = topic;
	this.link = link;
	this.vote = 0;
	this.reply = [];
}

function Reply(id, pid, replytext){
	this.id = id;
	this.pid = pid;
	this.replytext = replytext;
	this.vote = 0;
	this.reply = [];
}

function findReply(a, id) {
	if (a.reply.length > 0) {
		for (var i=0;i<a.reply.length;i++) {
			r = findReply(a.reply[i], id);
			if ((typeof r != "undefined") && (typeof r.reply != "undefined")) {
				return r;
			}
		}
	}
	if (a.id == id) {
		return a;
	}
};

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
	if (request.url == '/') {
		serveFile('./index.html', response);
	}
	else if (request.url == '/style.css') {
		serveFile('./style.css', response);
	}
	else if (request.url == '/index.js') {
		serveFile('./index.js', response);
	}
	else if (request.url.indexOf('/addtopic') == 0) {
		if (request.method == 'POST') {
			var buffer = '';		
			request.on('data', function(chunk) {
				buffer += chunk;
			});
			request.on('end', function() {
				topics[tcount] = new Topic('t' + tcount, JSON.parse(buffer).topic, JSON.parse(buffer).link);
				tcount++;
				response.writeHead(200, {'Content-Type':'application/json'});
				response.end(JSON.stringify(topics[tcount-1]));
			});
		}
		else if (request.method == 'GET') {
			var uri = require('url').parse(request.url, true);
			topics[tcount] = new Topic('t' + tcount, uri.query.topic, uri.query.link);
			tcount++;
			response.writeHead(200, {'Content-Type':'application/json'});
			response.end();
		}
		else {
			response.writeHead(405);				
		}
	}
	else if (request.url.indexOf('/addreply') == 0) {
		if (request.method == 'POST') {
			var buffer = '';
			request.on('data', function(chunk) {
				buffer += chunk;
			});
			request.on('end', function() {
				var o = new Object;
				buffer = JSON.parse(buffer);
				for (var i=0;i<tcount;i++){
					o = findReply(topics[i], buffer.pid);
					if ((typeof o != "undefined") && (o.id == buffer.pid)) {
						o.reply.push(buffer);
						o.reply[o.reply.length - 1].id = 'c' + ccount;						
						o.reply[o.reply.length - 1].vote = 0;
						o.reply[o.reply.length - 1].reply = [];
						ccount++;
						response.writeHead(200, {'Content-Type':'application/json'});
						response.end(JSON.stringify(o.reply[o.reply.length - 1]));
						break;
					}
				}
			});
		}
		else if (request.method == 'GET') {
			var uri = require('url').parse(request.url, true);
			var o = new Object;
			for (var i=0;i<tcount;i++){
				o = findReply(topics[i], uri.query.pid);
				if ((typeof o != "undefined") && (o.id == uri.query.pid)) {
					o.reply.push(new Reply('c' + ccount, uri.query.pid, uri.query.replytext));
					ccount++;
					response.writeHead(200, {'Content-Type':'application/json'});
					response.end();
					break;
				}
			}
		}
		else {
			response.writeHead(405);				
		}
	}
	else if (request.url == '/alljson') {
		if (request.method == 'GET') {
			if (tcount > 0) {
				var data = '';
				response.writeHead(200, {'Content-Type':'text/plain'});
				for (var i=0;i<tcount;i++){
					data += JSON.stringify(topics[i]) + ';';
				}
				response.end(data);
			}
		}
		else {
			response.writeHead(405);				
		}
	}
	else if (request.url.indexOf('/allreply/') == 0) {
		if (request.method == 'GET') {
			var reply = [];
			var data = '';
			var o = new Object;
			var id = request.url.substring(10);	
			for (var i=0;i<tcount;i++){
				o = findReply(topics[i], id);
				if ((typeof o != "undefined") && (o.id == id)) {
					reply = o.reply;
					for (var c=0;c<reply.length;c++) {
						data += JSON.stringify(reply[c]) + ';';
					}
					response.writeHead(200, {'Content-Type':'text/plain'});
					response.end(data);
					break;
				}
			}
		}
		else {
			response.writeHead(405);				
		}
	}
	else if (request.url.indexOf('/vote/') == 0) {
		if (request.method == 'GET') {
			var o = new Object;
			var id = request.url.substring(6);
			for (var i=0;i<tcount;i++){
				o = findReply(topics[i], id);
				if ((typeof o != "undefined") && (o.id == id)) {
					o.vote++;
					topics[i].vote++;
					response.writeHead(200, {'Content-Type':'text/plain'});
					response.end(o.vote + ';t' + i + ';' + topics[i].vote);
					break;
				}
			}
		}
	}
	else {
		response.writeHead(404);
		response.end('Not found.');
	}
}).listen(PORT);

console.log('Server running at http://127.0.0.1:' + PORT + '/');

