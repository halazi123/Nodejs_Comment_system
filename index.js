// JavaScript Document
function put(data, url) {
	$.ajax(url, {
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json',
		success: function() { 
					 $.getJSON('/json', function (data) {
						var items = [];
						var i = 0;

						$.each(data, function (key, val) {
							if (i == 0) {
								items.push('<span>' + val + '</span> ');
							}
							else if (i == 1) {
								items.push('(<a href="' + val + '">link</a>) ');
							}
							else {
								items.push('<span> votes: '+ val + '</span>');
							}
							i++;
						});

					   $('<li/>', {
							'class': 'litopic',
							'onclick':'showReplay()',
							html: items.join('')
						}).appendTo('#topiclist');
						
					});
				},
		error: function() { alert("add topic failed"); }
	});
};

function showReplay() {
		alert('yes');
		//alert($(this).html());
		return false;
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
	$.get('/jsonall', function (data) {
		var items = [];
		var i = 0;
		data = data.split(";");
		$.each(data, function(index, value) {
			i = 0;
			items = [];
			value = JSON.parse(value);
			$.each(value, function (key, val) {
				if (i == 0) {
					items.push('<span>' + val + '</span> ');
				}
				else if (i == 1) {
					items.push('(<a class="title" href="' + val + '">link</a>) ');
				}
				else {
					items.push('<span> votes: '+ val + '</span>');
				}
				i++;
			});
			$('<li/>', {
				'class': 'topicli',
				'onclick':'showReplay()',
				html: items.join('')
			}).appendTo('#topiclist');
		});
	});
	
	$('#add').submit(function() {  
		var formvalues = $(this).serializeObject();
		put(formvalues, '/addtopic');
		return false;
	});
	
});

