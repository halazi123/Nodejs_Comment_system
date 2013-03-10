// JavaScript Document
function add1Topic(data) {
	var id = '';
	var topic = '';
	var link = '';
	var vote = '';
	var vote2 = '';
	var added = false;

	$.each(data, function (key, val) {
		if (key == 'id') {
			id = val;
		}
		else if (key == 'topic') {
			topic = val;								
		}
		else if (key == 'link') {
			link = val;	
		}
		else if (key == 'vote') {
			vote = val;
		}
	});
	
	if ($('#topiclist > li').length > 0) {
		$('#topiclist > li').each(function() {
			vote2 = $(this).children('div').children('.vote').html();
			vote2 = vote2.split(":");
			if (Number(vote2[1]) < Number(vote)) {
				$(this).before('<li class="topic"><div id="' + id + '"><span style="font-weight:bold" class="clickable" onclick="showReply(this)">' + topic + 
								'</span> (<a href="' + link + '">link</a>) <span class="vote"> votes:'+ vote + '</span><a onclick="replyBox(this)" ' +
								'class="clickable" style="float:right">reply</a></div></li>');
				added = true;
				return false;
			}
		});
	}
	if (!added) {
		$('#topiclist').append('<li class="topic"><div id="' + id + '"><span style="font-weight:bold" class="clickable" onclick="showReply(this)">' + topic + 
								'</span> (<a href="' + link + '">link</a>) <span class="vote"> votes:'+ vote + '</span><a onclick="replyBox(this)" ' +
								'class="clickable" style="float:right">reply</a></div></li>');
	}
};

function add1Reply(data, p) {
	var id = '';
	var replytext = '';
	var vote = '';
	var vote2 = '';
	var added = false;

	$.each(data, function (key, val) {
		if (key == 'id') {
			id = val;
		}
		else if (key == 'replytext') {
			replytext = val;								
		}
		else if (key == 'vote') {
			vote = val;
		}
	});
	
	if ($(p).find('#' + id).length == 0) {
		if ($(p).children('.replydiv').length > 0) {
			$(p).children('.replydiv').each(function() {
				vote2 = $(this).children('.vote').html();
				if (Number(vote2) < Number(vote)) {
					$(this).before('<div class="replydiv" id="' + id + '"><a class="clickable" onclick="voteUp(this)">' + 
					'<img src="http://www.afghanmp3.com/wp-content/plugins/commentsvote/images/vote_up.gif"/></a>' + 
					'<span class="vote">' + vote + '</span><br><span style="font-weight:bold" ' + 
					'class="clickable" onclick="showReply(this)">' + 
					replytext.replace(/(\r\n|\n|\r)/gm, "<br>") + '</span><br><a onclick="replyBox(this)"' +
					'class="clickable" >reply</a></div>');
					added = true;
					return false;
				}
			});
		}
		if (!added) {
			$(p).append('<div class="replydiv" id="' + id + '"><a class="clickable" onclick="voteUp(this)">' + 
						'<img src="http://www.afghanmp3.com/wp-content/plugins/commentsvote/images/vote_up.gif"/></a>' + 
						'<span class="vote">' + vote + '</span><br><span style="font-weight:bold" ' + 
						'class="clickable" onclick="showReply(this)">' + 
						replytext.replace(/(\r\n|\n|\r)/gm, "<br>") + '</span><br><a onclick="replyBox(this)"' +
						'class="clickable" >reply</a></div>');
		}
	}
};

function put(url, data, parent) {
	$.ajax(url, {
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json',
		success: function(data) { 
					if (url == '/addtopic') {
						add1Topic(data);
					}
					else {
						add1Reply(data, parent);
					}
				},
		error: function() { alert("submission failed"); }
	});
};

function showReply(t) {
	var id = $(t).parent().attr('id');
	$.get('/allreply/' + id, function (data) {
		if (data.length == 0) {
			if (($(t).siblings('.replydiv').length == 0) && ($(t).siblings('form').length == 0)) {
				$(t).parent().append('<div class="replydiv">There is currently no reply.</div>');
			}
		}
		else {
			data = data.split(";");
			$.each(data, function(index, value) {
				value = JSON.parse(value);
				add1Reply(value, $(t).parent());
			});
		}		
	});
};

function replyBox(t) {
	if ($(t).siblings('form').length == 0) {
		if ($(t).siblings("div:contains('There is currently no reply')").length > 0) {
			$(t).siblings("div:contains('There is currently no reply')").remove();
		}
		$(t).after('<form onsubmit="return replySubmit(this)">' + 
					'<input type="hidden" name="pid" value="' + $(t).parent().attr('id') + '"/>' +
					'<textarea name="replytext" cols="60" rows="4" maxlength="400"' + 
					'wrap="hard" placeholder="400-character limit... " required></textarea>' +
					'<input type="submit" value="add comment"/></form>');
	}
};

function replySubmit(t) {
	put('/addreply', $(t).serializeObject(), $(t).parent());
	$(t).remove();
	return false;
};

function voteUp(t) {
	$.get('/vote/' + $(t).parent().attr('id'), function (data) {
		data = data.split(";");
		$(t).siblings('.vote').html(data[0]);
		$('#' + data[1]).children('.vote').html('votes:' + data[2]);		
	});	
};

function getAll() {
	$.get('/alljson', function (data) {
		data = data.split(";");
		$.each(data, function(index, value) {
			value = JSON.parse(value);
			add1Topic(value);
		});
	});
};

$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};


$(document).ready(function() {	
	getAll();
	
	$('#add').submit(function() {  
		var formvalues = $(this).serializeObject();
		put('/addtopic', formvalues, null);
		return false;
	});	
});

