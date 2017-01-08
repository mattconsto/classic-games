/**
 * Load the resources from either a string or an object.
 */
var Resources = {
	request: function(path) {
		// Synchronous request, should be refactored to be asynchronous.
		var request = new XMLHttpRequest();
		request.open("GET", path, false);
		request.send();
		return request.status === 200 ? request.responseText : null;
	},
	load: function(input, root) {
		if(input != null && typeof input === "object") {
			// Input is a collection
			let output = [];
			for(key in input) output[key] = Resources.load(input[key], root);
			return output;
		} else if(typeof input === "string") {
			// Input is a string
			if(root != null) input = root + input;
			let extension = (/(?:\.([^.]+))?$/).exec(input)[1];
			
			if(typeof extension !== "undefined") {
				switch(extension.toLowerCase()) {
					case "apng": case "bmp": case "gif": case "jpg": case "ico":
					case "jpeg": case "jp2": case "j2k": case "jxr": case "mng":
					case "png": case "svg": case "tif": case "tiff": case "webp":
						let output = new Image();
						output.src = input;
						return output;
					case "flac": case "ogg": case "mp2": case "mp3": case "wav":
						return new Audio(input);
					case "mp4": case "webm":
						return new Video(input);
					case "js":
						var script = document.createElement('script');
						script.src = input;
						document.head.appendChild(script);
						return script;
					case "json":
						return JSON.parse(Resources.request(input));
					case "xml":
						return new DOMParser().parseFromString(Resources.request(input), "text/xml");
					case "csv": case "txt":
					default:
						return Resources.request(input);
				}
			} else {
				console.error("Resource extension missing: " + input);
			}
		} else {
			console.error("Unable to load resource");
			console.log(input);
		}

		return null;
	}
};