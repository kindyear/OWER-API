/*
    playerPCCompetitiveHerosInfo.js
    处理玩家PC平台竞技模式的英雄信息
*/

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const {getCurrentTime} = require('../utils');
const {DATA_SOURCE} = require("../config/config");

async function scrapeHeroCompetitiveInfo(playerTag, heroName) {
    const currentUNIXTime = new Date().getTime();
    console.log(`${getCurrentTime()} Received API request for competitive hero info: \u001b[33m${playerTag}\u001b[0m heroName: \u001b[33m${heroName}\u001b[0m`);
    const url = `${DATA_SOURCE}${encodeURIComponent(playerTag)}/`;

}

module.exports = {scrapeHeroCompetitiveInfo}