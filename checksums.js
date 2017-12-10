const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * Compute and return the given hash of the file with the given name.
 *
 * @param {String} hashName The name of the hash
 * @param {String} fileName The name of the file to hash
 * @param {function(String, String)} callback A callback with the signature (err, hash) where 'err' contains an error if
 *                                            there is one and hash is the hash of the given file with the given hash
 *                                            type.
 */
function hashSync (hashName, fileName, callback) {
  const hash = crypto.createHash(hashName);
  const readStream = fs.createReadStream(fileName);

  readStream
    .on('data', (data) => {
      hash.update(data)
    })
    .on('end', () => {
      if (typeof callback === 'function') {
        callback(null, hash.digest('hex'))
      }
    })
    .on('error', (error) => {
      if (typeof callback === 'function') {
        callback(error, null)
      }
    })
}

/**
 * Compute the given hash of the files with the given names.
 *
 * @param {String} hashName The name of the hash
 * @param {String[]} fileNames The names of the files to hash
 * @param {function(String, Object.<String, String>)} callback A callback with the signature (err, hashes) where 'err'
 *                                                             contains an error if there is one and hashes is a map
 *                                                             containing the files and their respective hashes.
 */
function hash (hashName, fileNames, callback) {
  fileNames.forEach((fileName) => {
    if (typeof callback === 'function') {
      hashSync(hashName, fileName, (err, hash) => {
        callback(err, {fileName, hash})
      })
    }
  })
}

/**
 * Compute the hashes of each file listed in the files with the given names.  Call a callback method with the file name,
 * expected hash (the one contained within the check file), and the actual hash.
 *
 * @param {String} hashName the name of the hash
 * @param {String[]} checkFileNames the names of the check files
 * @param {function(String, String, String, String)} callback A callback with the signature (err, fileName,
 *                                                            expectedHash, actualHash).  The 'err' parameter will be
 *                                                            null if there are no errors.
 */
function hashCheck (hashName, checkFileNames, callback) {
  for (let i = 0; i < checkFileNames.length; i++) {
    // Find the file names and hashes in the check file
    const checkFileName = checkFileNames[i];
    const readStream = fs.createReadStream(checkFileName);
    const rl = readline.createInterface({ input: readStream });

    rl
      .on('line', (line) => {
        // Parse hash and file name
        const tokens = line.split(' ');

        // 3 tokens because there is a space token in between
        if (tokens.size !== 3) {
          const expectedHash = tokens[0];

          const dirName = path.dirname(checkFileName);
          const shortFileName = tokens[2];
          const fileName = path.join(dirName, shortFileName);

          hashSync(hashName, fileName, (err, actualHash) => {
            if (typeof callback === 'function') {
              callback(err, fileName, expectedHash, actualHash)
            }
          })
        }
      })
  }
}

module.exports.hashCheck = hashCheck;
module.exports.hash = hash;
