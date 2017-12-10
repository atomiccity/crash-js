const _ = require('lodash');
const fs = require('fs');
const os = require('os');
const path = require('path');
const program = require('commander');

const progVersion = require('./package.json').version;

/**
 * Find the location of an executable.
 *
 * @param {String} exeName The executable to search for
 * @param {function(String, String)} callback A callback with the signature (err, location) where 'err' contains
 *                                            an error if there is one and location contains the location of the given
 *                                            executable if it is found.
 */
function which (exeName, callback) {
    const pathEnvVar = process.env.PATH;
    const paths = _.split(pathEnvVar, ';');

    // On Windows, the current path is checked first
    if (os.platform() === 'win32') {
        paths.unshift('.');

        // Append '.exe' on Windows when no extension is given
        if (path.extname(exeName) === '') {
            exeName = exeName + '.exe'
        }
    }

    // Check for exe in each path starting from first
    for (const x of paths) {
        const potentialFile = path.join(x, exeName);

        try {
            fs.accessSync(potentialFile, fs.constants.X_OK);

            // Return potentialFile if accessSync doesn't throw
            if (typeof callback === 'function') {
                callback(null, potentialFile);
                return
            }
        } catch (e) {
            // Do nothing on error
        }
    }

    // Nothing found, return error
    if (typeof callback === 'function') {
        callback('File not found in any executable paths', null)
    }
}

program
    .version(progVersion, '-v, --version')
    .description('Executable locator');

program
    .usage('<exe>')
    .action(function(exe) {
        if (exe) {
            which(exe, (err, x) => {
                if (!err) console.log(x);
                else console.log(err)
            })
        }
    })
    .parse(process.argv);

// Output usage info if no arguments were given
if (!program.args.length) program.help();
