/*
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { getCurrentTime } = require('../utils');
const { DATA_SOURCE } = require('../config/config');
const heroIDData = require('../data/herosData.json');

async function scrapeHeroCompetitiveInfo(playerTag, heroID) {
    try {
        // 获取英雄名称和对应的原ID
        const heroName = heroIDData[heroID].heroName;
        const heroSourceID = heroIDData[heroID].heroSourceId;

        const currentUNIXTime = new Date().getTime();

        // 控制台调试信息
        console.log(`${getCurrentTime()} Received request with playerTag: \u001b[33m${playerTag}\u001b[0m, heroID: \u001b[33m${heroID}\u001b[0m, heroName: \u001b[33m${heroName}\u001b[0m, heroSourceId: \u001b[33m${heroSourceID}\u001b[0m`);
        console.log(heroSourceID)


        const url = `${DATA_SOURCE}${encodeURIComponent(playerTag)}/`;

        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
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
            throw new Error('\u001b[33m' + playerTag + '\u001b[0m Not Found');
        }

        // 构建动态的选择器
        const heroSelector = `blz-section.stats.competitive-view span.stats-container.option-${heroSourceID}`;
        // 提取指定位置的元素信息
        const competitiveHeroData = await page.$eval(heroSelector, (element) => element.innerHTML);

        // 使用Cheerio解析元素信息
        const $ = cheerio.load(competitiveHeroData);
        const heroData = [];
        $('.category').each((index, category) => {
            const categoryName = $(category).find('.header p').text().trim();
            const categoryData = [];
            $(category).find('.content .stat-item').each((index, statItem) => {
                const statName = $(statItem).find('.name').text().trim();
                const statValue = $(statItem).find('.value').text().trim();
                categoryData.push({ statName, statValue });
            });
            heroData.push({ categoryName, categoryData });
        });

        console.log(`${getCurrentTime()} Competitive Hero Data:`, heroData);

        await browser.close();

        return {
            playerTag,
            heroID,
            heroName,
            heroSourceID,
            competitiveHeroData: heroData,
            currentTime: currentUNIXTime
        };
    } catch (error) {
        console.error(`${getCurrentTime()} Error:`, error.message);
        throw new Error('Cannot get data.');
    }
}

module.exports = { scrapeHeroCompetitiveInfo };
*/
//第一版可用

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const {getCurrentTime} = require('../utils');
const {DATA_SOURCE} = require('../config/config');
const heroIDData = require('../data/herosData.json');

async function scrapeHeroCompetitiveInfo(playerTag, heroID) {
    try {
        const currentUNIXTime = new Date().getTime();
        console.log(`${getCurrentTime()} Received request with playerTag: \u001b[33m${playerTag}\u001b[0m, heroID: \u001b[33m${heroID}\u001b[0m`);

        const url = `${DATA_SOURCE}${encodeURIComponent(playerTag)}/`;

        const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});
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

        // 获取英雄名称和对应的原ID
        const heroDropdownOptions = await page.evaluate(() => {
            const options = document.querySelectorAll('select[data-dropdown-id="hero-dropdown"] option');
            const heroOptions = [];
            for (const option of options) {
                const heroName = option.textContent.trim();
                const heroSourceID = option.value;
                if (heroSourceID !== '0') {
                    heroOptions.push({heroName, heroSourceID});
                }
            }
            return heroOptions;
        });
        console.log('Hero Dropdown Options:', heroDropdownOptions);

        // 确保传入的heroID有效，否则返回错误
        const heroIndex = parseInt(heroID);
        if (isNaN(heroIndex) || heroIndex < 0 || heroIndex >= heroDropdownOptions.length) {
            throw new Error(`HeroID ${heroID} not found for player ${playerTag}`);
        }
        const heroInfo = heroDropdownOptions[heroIndex];

        // 检查英雄是否存在
        if (!heroInfo) {
            throw new Error(`HeroID ${heroID} not found for player ${playerTag}`);
        }

        // 构建动态的选择器
        const heroSelector = `blz-section.stats.competitive-view span.stats-container.option-${heroInfo.heroSourceID}`;

        // 提取指定位置的元素信息
        const competitiveHeroData = await page.$eval(heroSelector, (element) => element.innerHTML);

        // 使用Cheerio解析元素信息
        const $ = cheerio.load(competitiveHeroData);
        const parsedHeroData = [];
        $('.category').each((index, category) => {
            const categoryName = $(category).find('.header p').text().trim();
            const categoryData = [];
            $(category).find('.content .stat-item').each((index, statItem) => {
                const statName = $(statItem).find('.name').text().trim();
                const statValue = $(statItem).find('.value').text().trim();
                categoryData.push({statName, statValue});
            });
            parsedHeroData.push({categoryName, categoryData});
        });

        console.log(`${getCurrentTime()} Competitive Hero Data:`, parsedHeroData);

        await browser.close();

        return {
            playerTag,
            heroID: heroIndex, // 使用 heroIndex 作为 heroID
            heroName: heroInfo.heroName,
            heroSourceID: heroInfo.heroSourceID,
            competitiveHeroData: parsedHeroData,
            currentTime: currentUNIXTime
        };
    } catch (error) {
        console.error(`${getCurrentTime()} Error:`, error.message);
        throw new Error('Cannot get data.');
    }
}

module.exports = {scrapeHeroCompetitiveInfo};
