/*
    playerPCCompetitiveInfo.js
    处理玩家PC平台竞技模式的排行信息
*/

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const {getCurrentTime} = require('../utils');
const {DATA_SOURCE} = require("../config/config");

// 定义type与category-id的映射关系
const typeToCategoryIdMap = {
    'time-played': '0x0860000000000021', // Time Played
    'games-won': '0x0860000000000039', // Games Won
    'weapon-accuracy': '0x086000000000002F', // Weapon Accuracy
    'win-percentage': '0x08600000000003D1', // Win Percentage (Competitive Only)
    'eliminations-per-life': '0x08600000000003D2', // Eliminations per Life
    'critical-hit-accuracy': '0x08600000000003E2', // Critical Hit Accuracy
    'multikill-best': '0x0860000000000346', // Multikill - Best
    'objective-kills': '0x086000000000031C', // Objective Kills
};

// 提取PC平台快速游戏排行榜数据的函数
async function scrapeHeroCompetitivePlayRankings(playerTag, type) {
    try {
        const currentUNIXTime = new Date().getTime();
        console.log(`${getCurrentTime()} Received API request for competitive hero rankings: \u001b[33m${playerTag}\u001b[0m type: \u001b[33m${type}\u001b[0m`);
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
        await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 30000});

        // 玩家标签是否存在
        const errorElement = await page.$('.error-contain');
        if (errorElement) {
            throw new Error('\u001b[33m' + playerTag + '\u001b[0m Not Found');
        }
        // 等待目标元素加载完成
        await page.waitForSelector('.Profile-heroSummary--view.competitive-view .Profile-progressBars', {timeout: 60000});

        // 获取页面内容
        const content = await page.content();
        const $ = cheerio.load(content);

        // 将type参数转换为小写
        const selectedType = type ? type.toLowerCase() : null;

        // 根据type参数选择对应的category-id
        const categoryId = selectedType ? typeToCategoryIdMap[selectedType] : null;

        if (!categoryId) {
            throw new Error('Invalid type. Please provide a valid type for the rankings.');
        }

        // 定位到目标元素
        const progressBarsElement = $(`.Profile-heroSummary--view.competitive-view .Profile-progressBars[data-category-id="${categoryId}"]`);
        //console.log(`${getCurrentTime()} progressBarsElement:`, progressBarsElement.html()); // 调试信息

        // 提取排行榜数据
        const heroRankings = [];

        // 从progressBarsElement中提取排行榜数据
        progressBarsElement.find('.Profile-progressBar').each((index, element) => {
            const heroName = $(element).find('.Profile-progressBar-title').text();
            const heroData = $(element).find('.Profile-progressBar-description').text();

            heroRankings.push({heroName, heroData});
        });

        //console.log(`[${currentTime}] heroRankings:`, heroRankings); // 调试信息

        await browser.close();
        return {
            playerTag,
            gameMode: 'competitive',
            type: selectedType,
            heroRankings,
            currentTime: currentUNIXTime
        };
    } catch (error) {
        console.error(`${getCurrentTime()} Error:`, error.message);
        throw new Error('Cannot get data.');
    }
}

module.exports = {scrapeHeroCompetitivePlayRankings, typeToCategoryIdMap};

