
import core = require('@actions/core');
import glob = require('@actions/glob');
import { exec } from '@actions/exec';
import * as fs from 'fs/promises';
import * as path from 'path';

const WORKSPACE = process.env.GITHUB_WORKSPACE;

const main = async () => {
    try {
        const tagBranch = core.getInput(`tag-branch`) === 'false' ? false : true;
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

        const packageJsonContent = await fs.readFile(packagePath, 'utf8');
        const packageJson = JSON.parse(packageJsonContent);
        const version = packageJson.version;

        await git(['config', '--global', 'user.name', 'github-actions[bot]']);
        await git(['config', '--global', 'user.email', 'github-actions[bot]@users.noreply.github.com']);
        await git(['fetch', '--all', '--tags']);

        if (tagBranch) {
            const tags = await getTags();

            if (tags.has(version)) {
                throw new Error(`Tag ${version} already exists.`);
            }
        }

        await git(['subtree', 'split', '--prefix', packageRootDir, '-b', 'upm']);
        await git(['push', '-u', 'origin', 'upm', '--force']);

        if (tagBranch) {
            await git(['tag', version, 'upm']);
            await git(['push', 'origin', version]);
        }
    } catch (error) {
        core.setFailed(error);
    }
};

main();

/**
 * Get the list of valid SemVer tags and their parent sha
 * @returns Map of tags and their parent sha
 */
async function getTags(): Promise<Map<string, string>> {
    const semverRegex = /^v?\d+\.\d+\.\d+$/;
    const tags = (await git(['tag', '--list', `--sort=version:refname`])).split('\n').filter(tag => tag.trim() !== '').filter(tag => semverRegex.test(tag));
    const tagMap = new Map<string, string>();
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        tagMap.set(tag, await getParentSha(tag));
    }
    return tagMap;
}

/**
 * Get the parent sha of a ref
 * @param ref Ref to get parent sha for
 * @returns Parent sha
 */
async function getParentSha(ref: string): Promise<string> {
    return (await git(['rev-parse', '--verify', `${ref}^{}`])).trim();
}

/**
 * Run a git command
 * @param params Git command parameters
 * @returns Git command output
 */
async function git(params: string[], warnOnError: boolean = true): Promise<string> {
    let output: string = '';
    let error: string = '';
    const exitCode = await exec('git', params, {
        listeners: {
            stdout: (data: Buffer) => {
                output += data.toString();
            },
            stderr: (data: Buffer) => {
                error += data.toString();
            }
        }
    });
    if (exitCode !== 0) {
        throw new Error(error);
    }
    if (error && warnOnError) {
        core.warning(error);
    }
    return output;
}
