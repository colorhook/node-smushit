var smushit = require('./lib/smushit')
  , path = require('path')
  , fs = require('fs')
  , url = require('url')
  , http = require('http')
  , FileUtil = require('./lib/FileUtil.js');


var saveBinary = function(binaryUrl, path, callback){
	var urlObj = url.parse(binaryUrl),
		options = {
			host: urlObj.host
		  , port: urlObj.port
		  , path: urlObj.pathname
		}

	var request = http.get(options, function(res){
		var data = '';
		res.setEncoding('binary')
		res.on('data', function(chunk){
			data += chunk;
		})
		res.on('end', function(){
			fs.writeFile(path, data, 'binary', callback)
		})
	});
	
	if(callback){
		request.on("error", callback);
	}
};


exports.smushit = function(inputs, settings){
	var defaults = {
		verbose: true,
		inputs: [],
		recursive: false,
		verbose: true
	};
	
	settings = settings || {};

	for (key in defaults) {
		settings[key] = (typeof settings[key] !== 'undefined') ? settings[key] : defaults[key];
	}

	// Normalize inputs to array if just given a string
	if(typeof inputs === 'string') {
		inputs = [inputs];
	}

	var log = function(msg){
		if(settings.verbose){
			console.log("[smushit] " + msg);
		}
	};
	
	var files = [];
	inputs.forEach(function(item){
		if(!fs.existsSync(item)){
			log("no such file or directory: " + item);
			return;
		}

		var stats = fs.statSync(item);
		if(stats.isFile()){
			if(files.indexOf(item) == -1){
				files.push(item);
			}
		}else if(stats.isDirectory()){
			FileUtil.list(item, {
				recursive: settings.recursive,
				excludeDirectory: true,
				matchFunction: function(fileItem){
					if(fileItem.name.match(/\.(png|gif|jpg|jpeg)/i)){
						if(files.indexOf(fileItem.fullName) == -1){
							files.push(fileItem.fullName);
						}
						return true;
					}
					return false;
				}
			});
		}
	});

	

	var finished = 0,
		reports = {
			total: files.length,
			finished: 0,
			ok: 0,
			items: []
		},
		onItemFinished = function(error, item, response){
			if(settings.onItemComplete){
				settings.onItemComplete(error, item, response);
			}
			if(++reports.finished >= files.length){
				log("smushit completed: total " + reports.total + ", saving " + reports.ok );
				if(settings.onComplete){
					settings.onComplete(reports);
				}
			}
		};

	if(files.length == 0){
		log("please specify image(s) need to smushit!");
		if(settings.onComplete){
			settings.onComplete(reports);
		}
		return;
	};

	files.forEach(function(item){
		log("start smash " + item);
		if(settings.onItemStart){
			settings.onItemStart(item);
		}
		smushit.smushit(item, function(response){
			reports.items.push(response);
			try{
				response = JSON.parse(response);
			}catch(err){
				log("item: " + item + " response:" + response);
				onItemFinished(err, item, response);
				return;
			}
			if(response.error){
				log("item: " + item + " error: " + response.error);
				onItemFinished(null, item, response);
				return;
			}
			reports.ok += 1;
			log("item: " + item + " saving: " + response.percent + "%");
			
			saveBinary(response.dest, settings.output || item, function(e){
				if(e){
					log("Fail to save image at: " + item);
				}
				onItemFinished(e, item, response);
			});
		}, function(error){
			log(error.message || error.msg);
			onItemFinished(error, item);
		}, settings.service);
	});
};