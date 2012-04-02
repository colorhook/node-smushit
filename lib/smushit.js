var fs = require("fs"),
	http = require("http");


var SMUSH_HOST = 'www.smushit.com',
	SMUSH_HOST_PATH = "/ysmush.it/ws.php",
	
	//构建上传文件的请求body
	buildRequestBody = function(fullName, uploadIdentifier, params){
		var boundary = '------multipartformboundary' + (new Date).getTime();
		var dashdash = '--';
		var crlf     = '\r\n';
	 
		/* Build RFC2388. */
		var builder = '';


		builder += dashdash;
		builder += boundary;
		builder += crlf;
	 
		builder += 'Content-Disposition: form-data; name="'+ uploadIdentifier +'"';
		//支持文件名为中文
		builder += '; filename="' + encodeURIComponent(fullName.replace(/.+\//, '')) + '"';
		builder += crlf;
	 
		builder += 'Content-Type: application/octet-stream';
		builder += crlf;
		builder += crlf;
	 
		/* 写入文件 */
		builder += fs.readFileSync(fullName, "binary");
		builder += crlf;
	 
		/* 传递额外参数 */
		for(var i in params){
			if(params.hasOwnProperty(i)){
				builder += dashdash;
				builder += boundary;
				builder += crlf;
		 
				builder += 'Content-Disposition: form-data; name="'+ i +'"';
				builder += crlf;
				builder += crlf;
				//支持参数为中文
				builder += encodeURIComponent(params[i]);
				builder += crlf;
			}
		}
		
	 
		/* 写入边界 */
		builder += dashdash;
		builder += boundary;
		builder += dashdash;
		builder += crlf;
		//console.log(builder);
		return {
			contentType: 'multipart/form-data; boundary=' + boundary,
			builder: builder
		}
}

var smushit = function(str, success, fail){
	var options = {
	  host: SMUSH_HOST,
	  path: SMUSH_HOST_PATH
	},
	httpRequest,
	onRequestCompleted = function(response) {
	  var resBody = '';
	  response.on('data', function(chunk) {
		resBody += chunk;
	  });
	  response.on('end', function() {
		  success && success(resBody);
	  });
	};

	if(str.match(/https?:\/\//)){
		options.method = "GET";
		options.path += "?img=" + encodeURIComponent(str);
		httpRequest = http.get(options, onRequestCompleted, onR);
	}else{
		var postData = buildRequestBody(str, "files");
		options.method = "POST";
		options.headers =  {
		  'Content-Type': postData.contentType,
		  'Content-Length': postData.builder.length
	    }
		httpRequest = http.request(options, onRequestCompleted);
		httpRequest.write(postData.builder, "binary");
		httpRequest.end();
	}
	
	if(fail){
		httpRequest.on('error', fail);
	}
};

exports.smushit = smushit;