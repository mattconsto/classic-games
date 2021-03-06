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

		document.getElementsByTagName("body")[0].style.overflow = "auto";

		document.getElementById("back-github").style.display = "block";
		document.getElementById("back-home").style.display = "none";
		let html = "";

		for(let game in Loader.State.list) {
			html += '	<div class="col s6 m4 l3">\
		<div class="card">\
			<div class="card-image">\
				<a href="#!/{path}"><img src="games/{path}/screenshot.png" alt="{name}" title="{description}" /></a>\
			</div>\
			<div class="card-action"><a href="#!/{path}">{name}</a></div>\
		</div>\
	</div>'.formatApply(Loader.State.list[game].Info);
		}

		Loader.State.context.innerHTML = '<div class="container" style="height: 100%"><div class="row">{0}</div><div style="color: #efefef;">Created by <a href="https://consto.uk">Matthew Consterdine</a></div></div>'.format(html);
	},
	play: function(game) {
		if(Loader.State.dirty) {location.reload(); return;}

		document.getElementsByTagName("body")[0].style.overflow = "hidden";

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
	if(query.length == 0 || query[0].length == 0) {
		Loader.list();
	} else {
		Loader.play(query[0]);
	}
}

addEventListener("load", Loader.init);
