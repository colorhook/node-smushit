node-smushit
=====

using smush.it service to optimize image(s) in node

How to use?
------------

install by NPM

```shell
npm install node-smushit
```

use it in node

```javascript
var smushit = require('node-smushit');
//smash a single file
smushit.smushit('images/need-to-smash.png');

//smash files
smushit.smushit(['file1', 'fiel2', ..]);

//smash images in directory
smushit.smushit('images-folder-path');

//smash images in directory or the child-directories with recursive
smushit.smushit('images-folder-path', {recursive: true});
```

use smushit in shell

```shell
//view help
smushit -h

//smash files or directory
smushit file1 file2 file3

//with recursive
smushit file1 file2 file3 -R
```


