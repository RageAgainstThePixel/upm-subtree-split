
import core = require('@actions/core');
import exec = require('@actions/exec');
import glob = require('@actions/glob');

const WORKSPACE = process.env.GITHUB_WORKSPACE;

const main = async () => {
    try {
        const packageRootInput = core.getInput(`package-root`) || `**/Packages/com.*`;
        let packagePath = undefined;
        const globber = await glob.create(packageRootInput, { followSymbolicLinks: false, implicitDescendants: false });
        const files = await globber.glob();
        if (files.length === 0) {
            throw Error('No package found.');
        }
        if (files.length > 1) {
            throw Error(`Multiple packages found!\n${files.join('\n')}`);
        }
        packagePath = files[0].replace(`${WORKSPACE}/`, '');
        await exec.exec('git', ['subtree', 'split', '--prefix', packagePath, '-b', 'upm']);
        await exec.exec('git', ['push', '-u', 'origin', 'upm', '--force']);
    } catch (error) {
        core.setFailed(error.message);
    }
}

main();
