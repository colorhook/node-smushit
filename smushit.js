var smushit = require('./lib/smushit')
  , path = require('path')
  , fs = require('fs')
  , url = require('url')
  , http = require('http')
  , FileUtil = require('./lib/FileUtil.js');


var saveBinary = function(binaryUrl, path, success, fail){
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
			fs.writeFile(path, data, 'binary', function(err){
				if (err){
					fail && fail();
				}else{
					success && success();
				}
			})
		})
	});
	
	if(fail){
		request.on("error", fail);
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
		if(!path.existsSync(item)){
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

	if(files.length == 0){
		console.log("please specify image(s) need to smushit!");
		return;
	};

	var finished = 0,
		reports = {
			total: files.length,
			finished: 0,
			ok: 0,
			items: []
		},
		onItemFinished = function(){
			if(++reports.finished >= files.length){
				console.log("smushit completed: total " + reports.total + " | saving " + reports.ok );
			}
		};
	files.forEach(function(item){
		log("start smash item: " + item);
		smushit.smushit(item, function(response){
			log(response);
			onItemFinished()
			try{
				response = JSON.parse(response);
			}catch(err){
				return;
			}
			if(response.error){
				return;
			}
			reports.ok += 1;
			reports.items.push(response);
			saveBinary(response.dest, item, null, function(){
				console.log("Fail to save image at: " + item);
			});
			
		}, function(error){
			log(error.message || error.msg);
			onItemFinished();
		});
	});
};