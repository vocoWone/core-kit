const chalk = require("chalk");
const childProcess = require("child_process");
const fs = require("fs-extra");

function spawn(command, args, errorMessage) {
    const isWindows = process.platform === "win32"; // spawn with {shell: true} can solve .cmd resolving, but prettier doesn't run correctly on mac/linux
    const result = childProcess.spawnSync(isWindows ? command + ".cmd" : command, args, {stdio: "inherit"});
    if (result.error) {
        console.error(result.error);
        process.exit(1);
    }
    if (result.status !== 0) {
        console.error(chalk`{red.bold ${errorMessage}}`);
        console.error(`non-zero exit code returned, code=${result.status}, command=${command} ${args.join(" ")}`);
        process.exit(1);
    }
}

function checkCodeStyle() {
    console.info(chalk`{green.bold [task]} {white.bold check code style}`);
    return spawn("prettier", ["--config", "node/prettier.json", "--list-different", "{src,test}/**/*.{ts,tsx}"], "check code style failed, please format above files");
}

function test() {
    console.info(chalk`{green.bold [task]} {white.bold test}`);
    return spawn("jest", ["--config", "node/jest.json", "--coverage"], "test failed, please fix");
}

function lint() {
    console.info(chalk`{green.bold [task]} {white.bold lint}`);
    return spawn("tslint", ["-c", "node/tslint.json", "{src,test}/**/*.{ts,tsx}"], "lint failed, please fix");
}

function cleanup() {
    console.info(chalk`{green.bold [task]} {white.bold cleanup}`);
    fs.emptyDirSync("build");
}

function compile() {
    console.info(chalk`{green.bold [task]} {white.bold compile}`);
    return spawn("tsc", ["-p", "node/tsconfig.json"], "compile failed, please fix");
}

function distribute() {
    console.info(chalk`{green.bold [task]} {white.bold distribute}`);
    fs.mkdirsSync("build/dist/lib");
    fs.copySync("build/out/src", "build/dist/lib/", {dereference: true});
    fs.copySync("package.json", "build/dist/package.json", {dereference: true});
    fs.copySync("src", "build/dist/src", {dereference: true});
    fs.removeSync("build/out");
}

function build() {
    cleanup();
    checkCodeStyle();
    test();
    lint();
    compile();
    distribute();

    console.info(chalk`{yellow.bold -------------------------------------------------------------}`);
    console.info(chalk`{yellow.bold >>}`);
    console.info(chalk`{yellow.bold >> Build Successfully}`);
    console.info(chalk`{yellow.bold >> Remember To Re-install In Our Projects, And Notify Others}`);
    console.info(chalk`{yellow.bold >>}`);
    console.info(chalk`{yellow.bold -------------------------------------------------------------}`);
}

build();
