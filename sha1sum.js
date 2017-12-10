const checksums = require('./checksums.js');
const progVersion = require('./package.json').version;
const hashType = 'sha1';

const program = require('commander');

program
  .version(progVersion, '-v, --version')
  .description('Compute and check SHA-1 sums')
  .usage('[OPTION...] <FILE...>')
  .option('-c, --check', 'read SHA-1 sums from the FILEs and check them')
  .parse(process.argv);

// Output usage info if no arguments were given
if (!program.args.length) program.help();

const files = program.args;

if (program.check) {
  // Check the given SHA-256 check files
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
  // Perform SHA-256 sums on the given files
  checksums.hash(hashType, files, (err, hash) => {
    if (err) {
      console.log(err)
    } else {
      console.log(hash.hash, '*' + hash.fileName)
    }
  })
}
