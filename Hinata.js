// Hinata.js
process.on('unhandledRejection', error => console.log(error));
process.on('uncaughtException', error => console.log(error));

const fs = require("fs");
const path = require("path");
const log = require('./logger/log.js');
const { spawn } = require("child_process");
const utils = require("./utils.js");
global.utils = utils;

// ————————— CONFIG FILES ————————— //
const NODE_ENV = process.env.NODE_ENV || "development";

const dirConfig = path.normalize(`${__dirname}/config${NODE_ENV === 'development' ? '.dev.json' : '.json'}`);
const dirConfigCommands = path.normalize(`${__dirname}/configCommands${NODE_ENV === 'development' ? '.dev.json' : '.json'}`);

if (!fs.existsSync(dirConfig)) {
    log.error("CONFIG", `File "${dirConfig}" not found. Please create it!`);
    process.exit(0);
}

const config = require(dirConfig);
let configCommands = {};
if (fs.existsSync(dirConfigCommands)) configCommands = require(dirConfigCommands);

global.GoatBot = {
    config,
    configCommands,
    startTime: Date.now() - process.uptime() * 1000,
    commands: new Map(),
    eventCommands: new Map(),
    aliases: new Map(),
    botID: null
};

// ————————— WATCH CONFIG CHANGE ————————— //
fs.watch(dirConfig, () => {
    try {
        global.GoatBot.config = JSON.parse(fs.readFileSync(dirConfig, 'utf-8'));
        log.success("CONFIG", "Reloaded config.dev.json");
    } catch (err) {
        log.warn("CONFIG", "Failed to reload config.dev.json");
    }
});

fs.watch(dirConfigCommands, () => {
    try {
        if (fs.existsSync(dirConfigCommands))
            global.GoatBot.configCommands = JSON.parse(fs.readFileSync(dirConfigCommands, 'utf-8'));
        log.success("CONFIG COMMANDS", "Reloaded configCommands.dev.json");
    } catch (err) {
        log.warn("CONFIG COMMANDS", "Failed to reload configCommands.dev.json");
    }
});

// ————————— RUN BOT ————————— //
const { spawnBot } = require('./bot/run.js'); // যদি আলাদা file run logic থাকে
spawnBot ? spawnBot() : log.info("Hinata.js", "Bot ready!");

// ————————— AUTO RESTART ————————— //
if (config.autoRestart && config.autoRestart.time > 0) {
    setTimeout(() => {
        log.info("AUTO RESTART", "Restarting...");
        process.exit(2);
    }, config.autoRestart.time);
}
