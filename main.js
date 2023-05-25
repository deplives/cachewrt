const cache = require('@actions/cache');
const core = require('@actions/core');
const execSync = require('child_process').execSync;

try {
    var paths = new Array();
    var keyString = 'openwrt-cache';
    var restoreKeys = new Array();
    const prefix = core.getInput('prefix');
    if (prefix != '') {
        process.chdir(prefix);
    }

    const toolchain = core.getInput('toolchain');
    var skiptoolchain = core.getInput('skip');
    if (toolchain == 'true') {
        commithash = execSync('git log --pretty=tformat:"%h" -n1 tools toolchain').toString().trim();
        date = execSync('date +%s').toString().trim();
        keyString = keyString + '-' + commithash;
        restoreKeys.unshift(keyString);
        keyString = keyString + '-' + date;
        paths.push('staging_dir/host*');
        paths.push('staging_dir/tool*');
        paths.push('build_dir/host*');
        paths.push('build_dir/tool*');
    } else {
        skiptoolchain = false;
    }

    const ccache = core.getInput('ccache');
    if (ccache == 'true') {
        paths.push('.ccache');
    }

    const clean = core.getInput('clean');
    if (clean == 'true') return;
    console.log("查询缓存", keyString)
    cache.restoreCache(paths, keyString, restoreKeys)
        .then(res => {
            if (typeof res !== 'undefined' && res) {
                console.log("缓存命中", res)
                core.setOutput("hit", '1');
                if (skiptoolchain == 'true') {
                    execSync('bash -c \'find build_dir\/{host*,toolchain-*} -name .built\\* -exec touch {} \\;; touch staging_dir\/{host*,toolchain-*}\/stamp\/.*\'');
                }
            }
            else {
                console.log("缓存未命中")
            }
        })

} catch (error) {
    core.warning(error.message);
}
