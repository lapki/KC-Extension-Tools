// ==UserScript==
// @name         KC Extension Tools
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        krautchan.net/*
// @grant        none
// @require https://code.jquery.com/jquery-2.1.4.min.js
// ==/UserScript==
/* jshint -W097 */
'use strict';

config = {
	"reload" : 1,
	"backlinks" : 1,
	"hoverview" : 1,
	"threadlinks" : 1
}

function inthread() {

	if (window.location.href.search("thread-") != -1) {

		return true;
	}

	return false;
}

var $j = jQuery.noConflict();

/**
Auto-Reload
 */

function Reload() {

	setLast = function () {
		posts = $j('table');
		posts[posts.length - 1].id = "last";
	}
}

Reload.prototype.poll = function () {

	var setLast = this.setLast;

	$j.ajax({
		url : document.location,

		success : function (data) {

			loaded_posts = $j(data).find("table");

			loaded_post_count = loaded_posts.length;

			post_count = $j('table').length;

			if (loaded_post_count > post_count) {

				start_index = loaded_post_count - post_count;

				newPosts = loaded_posts.slice(loaded_posts.length - start_index, loaded_posts.length);

				$j.each(newPosts, function (index, value) {

					var new_post = '';

					if (index === 0) {

						if ($j("table#last").length === 0) {

							setLast();
						}
						new_post = $j(newPosts[index]);

						new_post.insertAfter($j("table#last"));

						$j("table#last")[0].id = '';
					} else {
						new_post = $j(newPosts[index]);

						new_post.insertAfter(newPosts[index - 1]);

					}
					$j(document).trigger('new_post', new_post);
				});

			}
		},

		statusCode : {
			404 : function () {
				alert("page not found");
			}
		}
	})
}

Reload.prototype.init = function () {
	poll = this.poll;

	setInterval(function () {

		if (inthread()) {

			poll();
		}
	}, 30000);
}

/**
Adds backlinks (replies) to posts
@constructor
 */
function Backlinks() {}

/**
Adds a backlink to the replied post
@param {string} origin_post - The post that made the reply
 */
Backlinks.prototype.quoteReply = function (origin_post) {

	origin_post = $j(origin_post).find('a').attr('href').split("#")[1];

	if (origin_post !== undefined) {

		$j('#post_text_' + origin_post).children().each(function () {

			if ($j(this).context.href !== undefined) {

				blink_post = $j(this).context.href.split("#")[1];

				$j('<a/>', {
					id : "mentioned",
					href : "#" + origin_post,
					text : '>>' + origin_post
				}).insertAfter('#post_text_' + blink_post);
			}
		})
	}
}
/**
Iterates through posts and passes the
post number to the quoteReply method
 */
Backlinks.prototype.init = function () {

	var qr = this.quoteReply;

	$j('.postnumber').each(function () {

		qr($j(this));

	})

	$j(document).on('new_post', function (e, post) {

		console.log("New Post event has been triggered");

		new_post = $j(post).find('.postnumber');

		qr(new_post);

	});
}

function hoverView() {}

hoverView.prototype.init = function () {

	function addReply(Reply, $link) {

		reply
		.addClass('post-hover')
		.css('border-style', 'solid')
		.css('box-shadow', '1px 1px 1px #999')
		.css('display', 'block')
		.css('position', 'absolute')
		.css('font-style', 'normal')
		.css('z-index', '100')

		reply.appendTo($link);
	}

	$j('a').hover(function () {

		var $link = $j(this);

		main_post = $link.parent().attr('id');

		reply_id = $link.context.href.split("#")[1]; // the reply id

		reply_url = $link.context.href.split("#")[0];

		if (inthread()) {

			reply = $j('td.postreply#post-' + reply_id).parents("table").clone();

			addReply(reply, $link)
		} else {

			url = $link.context.href;

			var threadResponse;

			post_id = reply_id;

			thread_url = reply_url;

			//thread_url = url.split("#")[0];

			//var post_id = url.split("#")[1];

			thread = new XMLHttpRequest();

			thread.onreadystatechange = function () {
				if (thread.readyState == 4 && thread.status == 200) {

					threadResponse = $j(this.responseText).find("td#post-" + post_id);

					var reply = threadResponse.parents("table").clone();

					addReply(reply, $link)

				}

				thread.open("GET", thread_url, true);

				thread.send();
			}
		}

	}, function () {

		$j('.post-hover').remove();

	})
}

function threadLinks() {}

threadLinks.prototype.init = function () {

	if (inthread()) {

		thread_links = $j('<span style="position: absolute; left: 5px; margin-top:10px" id="thread-links"></span>').attr('target', '_blank');
		thread_return = $j('<a id="thread-return" href="/int/"> [Return] </a>').attr('target', '_blank');
		catalog_link = $j('<a id="catalog" href="/catalog/int/">[Catalog] </a>').attr('target', '_blank');

		thread = $j('div.thread');

		thread_links.append(thread_return);
		thread_links.append(catalog_link);
		thread_links.insertAfter(thread);
	}
}

if (config['threadlinks'] == 1) {

	threadlinks = new threadLinks();
	threadlinks.init();
}

if (config['backlinks'] == 1) {

	backlinks = new Backlinks();

	backlinks.init();
}

if (config['hoverview'] == 1) {

	hoverView = new hoverView();

	hoverView.init();
}

if (config['reload'] == 1) {

	reload = new Reload();

	reload.init();
}
