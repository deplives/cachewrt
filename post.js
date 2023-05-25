const cache = require('@actions/cache');
const core = require('@actions/core');
const execSync = require('child_process').execSync;

try {
    var paths = new Array();
    var keyString = 'openwrt-cache';
    const prefix = core.getInput('prefix');
    if (prefix != '') {
        process.chdir(prefix);
    }

    const toolchain = core.getInput('toolchain');
    if (toolchain == 'true') {
        commithash = execSync('git log --pretty=tformat:"%h" -n1 tools toolchain').toString().trim();
        date = execSync('date +%s').toString().trim();
        keyString = keyString + '-' + commithash + '-' + date
        paths.push('staging_dir/host*');
        paths.push('staging_dir/tool*');
        paths.push('build_dir/host*');
        paths.push('build_dir/tool*');
    }

    const ccache = core.getInput('ccache');
    if (ccache == 'true') {
        paths.push('.ccache');
    }

    console.log("存储缓存", keyString)
    cache.saveCache(paths, keyString)

} catch (error) {
    core.warning(error.message);
}