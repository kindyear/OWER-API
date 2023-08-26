const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const {getCurrentTime} = require('./others/utils');
const {DATA_SOURCE} = require('../config/config');
const heroesData = require('../data/herosData.json');
const nameSearch = require("./others/nameSearch"); // 更新为您的JSON模板数据路径
async function scrapeHeroQuickInfo(playerTag, heroID, errorCallback) {
    let browser;
    try {
        playerTag = await nameSearch(playerTag);
        console.log(`${getCurrentTime()} 搜索匹配后的playerTag: ${playerTag}`);
        if (playerTag === "Player Not Found.") {
            return "Player Not Found.";
        }

        const heroName = heroesData.find(hero => hero.heroID.toString() === heroID).heroName;
        const currentUNIXTime = new Date().getTime();
        console.log(`${getCurrentTime()} Received Quickplay Hero Info request with playerTag: \u001b[33m${playerTag}\u001b[0m, heroID: \u001b[33m${heroID}\u001b[0m, heroName: \u001b[33m${heroName}\u001b[0m.`);

        const url = `${DATA_SOURCE}${encodeURIComponent(playerTag)}/`;

        const browser = await puppeteer.launch({headless: "new", args: ['--no-sandbox']});
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

        try {
            // 设置较长的超时时间（单位：毫秒）
            await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 30000});
        } catch (error) {
            console.error(`${getCurrentTime()} Error:`, error.message);
            if (browser) {
                try {
                    await browser.close();
                } catch (closeError) {
                    console.error('Error while closing the browser:', closeError.message);
                }
            }
            throw new Error('Cannot get data.');
        }

        // 玩家标签是否存在
        const errorElement = await page.$('.error-contain');
        const isError = !!errorElement;
        if (isError) {
            await browser.close();
            console.log(`${getCurrentTime()} \u001b[33m` + playerTag + `\u001b[0m Not Found`);
            return {
                error: "Player not found."
            }
        }

        // 检查私密信息元素
        const privateElement = await page.$('.Profile-private---msg');
        const isPrivate = !!privateElement;

        // 填充用户信息
        const playerNameElement = await page.$('h1.Profile-player--name');
        const playerName = await playerNameElement.evaluate(element => element.textContent);

        const playerIconElement = await page.$('.Profile-player--portrait');
        const playerIcon = await playerIconElement.evaluate(element => element.getAttribute('src'));


        if (isPrivate) {
            await browser.close();
            return {
                private: isPrivate,
                playerTag: playerTag,
                playerName: playerName,
                heroID: heroID,
                heroName: heroName,
                quickHeroData: [],
                currentTime: currentUNIXTime
            };
        }

        // 获取页面元素中的所有英雄信息
        const heroElements = await page.$$eval('body > div.main-content > div.mouseKeyboard-view.Profile-view.is-active > blz-section.stats.quickPlay-view > div.Profile-heroSummary--header > select[data-dropdown-id="hero-dropdown"] option', options => {
            return options.map(option => ({
                heroName: option.getAttribute('option-id'), // 使用 option-id 作为英雄名字
                heroSourceID: option.value // 使用 value 作为英雄的源ID
            }));
        });

        // 复制 JSON 模板，并根据页面元素中的数据进行匹配和处理
        const processedHeroesData = heroesData.map(heroData => {
            const heroSourceID = getHeroSourceID(heroData.heroName, heroElements);
            return {
                ...heroData,
                heroSourceID: heroSourceID !== null ? heroSourceID.toString() : null
            };
        });

        //  console.log(`${getCurrentTime()} Processed Hero Data:`, processedHeroesData);

        // 根据传入的 heroName 获取匹配的 selectedHero 对象
        const selectedHero = processedHeroesData.find(hero => hero.heroID.toString() === heroID);

        if (!selectedHero) {
            //console.error(`No hero found with ID ${heroID} in heroesData.`);
            await browser.close();
            throw new Error(`No hero found with heroID \u001b[33m${heroID}\u001b, heroName: \u001b[33m${heroName}\u001b[0m [0m in heroesData.`);
        }

        if (selectedHero.heroSourceID === null) {
            //  console.error(`Hero with ID ${heroID} does not exist.`);
            await browser.close();
            //  throw new Error(`Hero with heroID \u001b[33m${heroID}\u001b[0m, heroName: \u001b[33m${heroName}\u001b[0m does not exist.`);
            console.log(`${getCurrentTime()} Error: Hero with heroID \u001b[33m${heroID}\u001b[0m, heroName: \u001b[33m${heroName}\u001b[0m does not exist.`);
            return {
                error: `The requested hero cannot be found in the player's information.`
            };
        }

        // 构建动态的选择器
        const heroSelector = `blz-section.stats.quickPlay-view span.stats-container.option-${selectedHero.heroSourceID}`;

        // 提取指定位置的元素信息
        const quickHeroData = await page.$eval(heroSelector, (element) => element.innerHTML);
        // 获取页面内容
        const content = await page.content();

        // 使用Cheerio解析元素信息
        const $ = cheerio.load(quickHeroData);
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

        //console.log(`${getCurrentTime()} Quick Hero Data:`, parsedHeroData);
        await browser.close();
        return {
            private: isPrivate,
            playerTag,
            playerName: playerName,
            playerIcon: playerIcon,
            heroID: selectedHero.heroID,
            heroName: selectedHero.heroName,
            heroSourceID: selectedHero.heroSourceID,
            quickHeroData: parsedHeroData,
            currentTime: currentUNIXTime
        };
    } catch (error) {
        console.error(`${getCurrentTime()} Error:`, error.message);
        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error('Error while closing the browser:', closeError.message);
            }
        }
        throw new Error('Cannot get data.');
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error('Error while closing the browser:', closeError.message);
            }
        }
    }
}

// 创建一个函数来获取英雄的 heroSourceID
function getHeroSourceID(heroName, heroElements) {
    const heroElement = heroElements.find(element => element.heroName === heroName);
    return heroElement ? heroElement.heroSourceID : null;
}

module.exports = {scrapeHeroQuickInfo};