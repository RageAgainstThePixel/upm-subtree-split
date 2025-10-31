
import core = require('@actions/core');
import glob = require('@actions/glob');
import { exec } from '@actions/exec';
import * as fs from 'fs/promises';
import * as path from 'path';

const WORKSPACE = process.env.GITHUB_WORKSPACE;

const main = async () => {
    try {
        const packageRootInput = core.getInput(`package-root`) || `**/Packages/**/package.json`;
        let packagePath = undefined;
        const globber = await glob.create(packageRootInput);
        const files = await globber.glob();

        if (files.length === 0) {
            throw Error('No package.json found.');
        }

        if (files.length > 1) {
            throw Error(`Multiple packages found!\n${files.join('\n')}`);
        }

        packagePath = files[0];
        core.info(`package.json: ${packagePath}`);
        let packageRootDir = path.dirname(packagePath).replace(`${WORKSPACE}/`, '');
        core.info(`splitting package root dir: ${packageRootDir}`);

        await exec('git', ['config', '--global', 'user.name', 'github-actions[bot]']);
        await exec('git', ['config', '--global', 'user.email', 'github-actions[bot]@users.noreply.github.com']);
        await exec('git', ['fetch', '--all', '--tags']);
        await exec('git', ['subtree', 'split', '--prefix', packageRootDir, '-b', 'upm']);
        await exec('git', ['push', '-u', 'origin', 'upm', '--force']);

        const tagBranch = core.getInput(`tag-branch`) === 'false' ? false : true;

        if (tagBranch) {
            const packageJsonContent = await fs.readFile(packagePath, 'utf8');
            const packageJson = JSON.parse(packageJsonContent);
            const version = packageJson.version;
            await exec('git', ['tag', version, 'upm']);
            await exec('git', ['push', 'origin', version]);
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

main();
