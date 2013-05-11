#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

function main(argv) {

  var getArg = function() {
    var args = argv.shift();
    args = args.split('=');
    if (args.length > 1) {
      argv.unshit(args.slice(1).join('='));
    }
    return args[0];
  };

  var arg, indent, pkgfile, remains = [], increase = false;

  while (argv.length) {
    arg = getArg();
    switch(arg) {
      case '-c':
      case '--increase':
        increase = true;
        break;
      case '-i':
      case '--indent':
        indent = parseInt(argv.shift());
        break;
      case '-p':
      case '--path':
        pkgfile = argv.shift();
        break;
      case '-h':
      case '--help':
        helpMessage();
        break;
      default:
        remains.push(arg);
        break;
    }
  }
  console.log();
  pkgfile = pkgfile || 'package.json';
  if (!fs.existsSync(pkgfile)) {
    console.log('  ' + pkgfile + ' does not exist');
    console.log();
    process.exit(1);
  }
  var pkg = require(path.resolve(pkgfile));

  var v = remains[2];
  if (increase == 1) {
    var version = pkg.version;
    var match = version.match(/(\d+)\.(\d+)\.(\d+)(.*)/);
    if (match) {
      var major = parseInt(match[1]);
      var minor = parseInt(match[2]);
      var patch = parseInt(match[3]);
      var append = match[4];
      pkg.version = major + "." + minor + "." + (patch + 1) + append;
      fs.writeFileSync(pkgfile, JSON.stringify(pkg, null, indent || 2) + '\n');
      console.log('  change from: ' + version + ' to: ' + pkg.version);
    } else {
      console.log("version: " + version + " is invalid");
      console.log();
    }
  } else if (!v) {
    console.log('  version: ' + pkg.version);
  } else {
    pkg.version = v;
    fs.writeFileSync(pkgfile, JSON.stringify(pkg, null, indent || 2) + '\n');
    console.log('  change: ' + v);
  }
  console.log();
}

main(process.argv);

function helpMessage() {
  console.log();
  var lines = [
    '  Usage:',
    '    vc [-i 2] [version]',
    '',
    '  Options:',
    '    -i, --indent=<indent>   indent in package.json, default: 2',
    '    -p, --path=<pkgfile>    package.json path default: package.json',
    '    -c, --increase          increase a patch version',
    '    -h, --help              display this message',
    '',
    '  Examples:',
    '    $ vc',
    '    $ vc 1.0.0',
    '    $ vc -p component.json 1.0.0',
    '',
  ];
  console.log(lines.join('\n'));
  process.exit();
}
