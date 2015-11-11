function latencyTest(callback, iterations) {
	multipleTests(iterations, singleLatencyTest).then(function(latency) {
		var sum = 0;
		for(var i = 0; i < latency.length; i++) {
			sum += latency[i];
		}
		callback(sum / iterations);
	});
}

function downloadTest(callback, iterations, size) {
	multipleTests(iterations, singleDownloadTest, size).then(function(durations) {
		var sum = 0;
		for(var i = 0; i < durations.length; i++) {
			sum += durations[i];
		}
		sum /= 1000;
		callback(size / (sum / iterations));
	});
}

function uploadTest(callback, iterations, size) {
	multipleTests(iterations, singleUploadTest, size).then(function(durations) {
		var sum = 0;
		for(var i = 0; i < durations.length; i++) {
			sum += durations[i];
		}
		sum /= 1000;
		callback(size / (sum / iterations));
	});
}

function multipleTests(iterations, test, args) {
	if(iterations > 0) {
		return new Promise(function(resolve, reject) {
			test(args).then(function(latency) {
				if(iterations > 1) {
					multipleTests(iterations - 1, test, args).then(function(l) {
						l.push(latency);
						resolve(l);
					});
				} else {
					resolve([latency]);
				}
			})
		});
	}
}

function singleLatencyTest() {
	return new Promise(function(resolve, reject) {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if(xhttp.readyState == 4 && xhttp.status == 200) {
				var end = new Date();
				resolve(end - start);
			}
		}
		xhttp.open("GET", "/latency", true);
		var start = new Date();
		xhttp.send();
	});
}

function singleDownloadTest(size) {
	return new Promise(function(resolve, reject) {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if(xhttp.readyState == 4 && xhttp.status == 200) {
				var end = new Date();
				resolve(end - start);
			}
		}
		xhttp.open("POST", "/download", true);
		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		var start = new Date();
		xhttp.send("size="+size);
	});
}

function singleUploadTest(size) {
	return new Promise(function(resolve, reject) {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if(xhttp.readyState == 4 && xhttp.status == 200) {
				var end = new Date();
				resolve(end - start);
			}
		}
		xhttp.open("POST", "/upload", true);
		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		var length = 1048576 * size;

		var string = "";
		for (var i = 0; i < length; i++) {
			string += "x";
		}

		var start = new Date();
		xhttp.send("upload="+string);
	});
}