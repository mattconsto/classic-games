var Loader = {
	State: {
		list: {},
		game: {},
		context: [],
		dirty: false
	},
	register: function(game) {
		console.log("Registering " + game.Info.path);
		Loader.State.list[game.Info.path] = game;
		Loader.list();
	},
	init: function() {
		Loader.State.context = document.getElementById("wrapper");
		Loader.list();
		window.onhashchange();
	},
	list: function() {
		if(Loader.State.dirty) {location.reload(); return;}

		document.getElementById("back-github").style.display = "block";
		document.getElementById("back-home").style.display = "none";
		let html = "";

		for(let game in Loader.State.list) {
			html += '	<div class="col s6 m4 l3">\
		<div class="card">\
			<div class="card-image">\
				<a href="#!/play/{path}"><img src="games/{path}/screenshot.png" alt="{name}" title="{description}" /></a>\
			</div>\
			<div class="card-action"><a href="#!/play/{path}">{name}</a></div>\
		</div>\
	</div>'.formatApply(Loader.State.list[game].Info);
		}

		Loader.State.context.innerHTML = '<div class="container"><div class="row">{0}</div><div style="color: #efefef;">Created by <a href="https://github.com/mattconsto/">Matthew Consterdine</a></div></div>'.format(html);
	},
	play: function(game) {
		if(Loader.State.dirty) {location.reload(); return;}

		if(typeof Loader.State.list[game] !== "undefined") {
			document.getElementById("back-github").style.display = "none";
			document.getElementById("back-home").style.display = "block";

			Loader.State.game = Loader.State.list[game];
			console.log("Playing " + Loader.State.game.Info.name);
			document.getElementsByClassName("brand-logo")[0].innerHTML = Loader.State.game.Info.name;
			Loader.State.dirty = true;
			Loader.State.game.init(Loader.State.context);
		} else {
			alert("Error loading: {0}".format(game));
		}
	}
};

window.onhashchange = function() {
	let query = location.hash.replace(/^#!?\/?/, "").split("/");
	
	if(query.length == 0 || query[0] == "list" || query[0] == "index") {
		Loader.list();
	} else if(query.length >= 2 && query[0] == "play") {
		Loader.play(query[1]);
	}
}

addEventListener("load", Loader.init);