const checksums = require('./checksums.js');
const progVersion = require('./package.json').version;
const hashType = 'md5';

const program = require('commander');

program
  .version(progVersion, '-v, --version')
  .description('Compute and check MD5 sums')
  .usage('[OPTION...] <FILE...>')
  .option('-c, --check', 'read MD5 sums from the FILEs and check them')
  .parse(process.argv);

// Output usage info if no arguments were given
if (!program.args.length) program.help();

const files = program.args;

if (program.check) {
  // Check the given MD5 check files
  checksums.hashCheck(hashType, files, (err, fileName, expectedHash, actualHash) => {
    if (err) {
      console.log(err)
    } else if (actualHash === expectedHash) {
      console.log(fileName, 'OK')
    } else {
      console.log(fileName, 'FAILED')
    }
  })
} else {
  // Perform MD5 sums on the given files
  checksums.hash(hashType, files, (err, hash) => {
    if (err) {
      console.log(err)
    } else {
      console.log(hash.hash, '*' + hash.fileName)
    }
  })
}
