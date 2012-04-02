#!/usr/bin/env node

var smushit = require('./smushit')
  , util = require('util');

var responses = {
	error: function (message) {
		util.puts('Error occurred: ' + message);
	},
	help: function () {
		util.puts([
			'Usage: smushit file1 file2 file3',
			'Smash your images down to size. smushit uses !Yahoo online Smush.it web service',
			'to reduce your image size.',
			'',
			'(Note: due to the way the args are parsed, two hyphens -- are required after',
			' binary flags if they appear before file paths)',
			'',
			'Options:',
			'',
			' General:',
			'  -v, --verbose		verbose mode',
			'',
			' Traversing:',
			'  -R, --recursive	scan directories recursively',
			'',
			' Other:',
			'  -h, --help		print this help page',
			'  --version		print program version',
			'',
			' Examples:',
			'   Single File',
			'    pulverize image.png',
            '',
			'   Single Directory',
			'    pulverize /var/www/mysite.com/images/products/backgrounds',
            '',
			'   Multiple Files',
			'    pulverize foo.png bar.png baz.png qux.png',
            '',
			'   Recursive Directory',
			'    pulverize -R -- /var/www/mysite.com/images',
			''
		].join('\n'));
	},
	report: function () {
		
	},
	version: function () {
		util.puts('smushit v0.1.0');
	}
};

function respond (type) {
	responses[type].call();
}

var argv = require('optimist').argv;

if (argv.help || argv.h) {
	respond('help');
} else if (argv.version) {
	respond('version');
} else if (argv._.length) {
	var settings = {};

	if (argv.R || argv.recursive) {
		settings.recursive = true;
	}

	if (argv.v | argv.verbose) {
		settings.verbose = true;
	}

	smushit.smushit(argv._, settings);

} else {
	respond('help');
}