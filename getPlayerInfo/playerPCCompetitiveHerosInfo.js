/*
    playerPCCompetitiveHerosInfo.js
    处理玩家PC平台竞技模式的英雄信息
*/

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { getCurrentTime } = require('../utils');
const { DATA_SOURCE } = require("../config/config");
const heroIDData = require('../data/herosData.json');

async function scrapeHeroCompetitiveInfo(playerTag, heroID) {
    try {
        // 获取英雄名称和对应的原ID
        const heroName = heroIDData[heroID].heroName;
        const heroSourceID = heroIDData[heroID].heroSourceID;

        const currentUNIXTime = new Date().getTime();
        //console.log(`${getCurrentTime()} 收到对竞技模式英雄信息的API请求: \u001b[33m${playerTag}\u001b[0m 英雄ID: \u001b[33m${heroID}\u001b[0m`);
        console.log(`${getCurrentTime()} Received request with playerTag: \u001b[33m${playerTag}\u001b[0m, heroID: \u001b[33m${heroID}\u001b[0m, heroName: \u001b[33m${heroName}\u001b[0m`);

        const url = `${DATA_SOURCE}${encodeURIComponent(playerTag)}/`;

        const browser = await puppeteer.launch({headless: "new", args: ["--no-sandbox"]});
        const page = await browser.newPage();

        // 开启请求拦截
        await page.setRequestInterception(true);

        // 请求拦截处理
        page.on('request', (request) => {
            // 阻止图片实际下载，但允许获取图片的 URL 信息
            if (request.resourceType() === 'image') {
                request.abort();
            } else {
                request.continue();
            }
        });

        // 设置较长的超时时间（单位：毫秒）
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // 玩家标签是否存在
        const errorElement = await page.$('.error-contain');
        if (errorElement) {
            throw new Error(`未找到标签为 "${playerTag}" 的玩家。`);
        }

        // TODO: 添加逻辑从网页中爬取竞技模式英雄信息


        await browser.close();

        // 竞技模式英雄数据的占位符
        const competitiveHeroData = {
            // 在这里添加从网页中爬取的竞技模式英雄数据
        };


        return {
            playerTag,
            heroID,
            heroName,
            heroSourceID,
            competitiveHeroData,
            currentTime: currentUNIXTime
        };
    } catch (error) {
        console.error(`${getCurrentTime()} Error:`, error.message);
        throw new Error('Cannot get data.');
    }
}

module.exports = { scrapeHeroCompetitiveInfo };
