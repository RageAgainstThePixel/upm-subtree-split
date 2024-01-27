
const core = require('@actions/core');
const exec = require('@actions/exec');
const glob = require('@actions/glob');

const main = async () => {
    try {
        const packageRootInput = core.getInput('package-root');
        const workspace = process.env.GITHUB_WORKSPACE;

        // Search for the package directory if not provided
        var packageRoot = packageRootInput;

        if (!packageRoot) {
            const globber = await glob.create('**/Packages/com.*', { followSymbolicLinks: false });
            const files = await globber.glob();

            if (files.length === 0) {
                throw Error('No package directories found.');
            }

            packageRoot = files[0].replace(`${workspace}/`, '');
        }

        await exec.exec('git', ['subtree', 'split', '--prefix', packageRoot, '-b', 'upm']);
        await exec.exec('git', ['push', '-u', 'origin', 'upm', '--force']);
    } catch (error) {
        core.setFailed(error.message);
    }
}

main();
