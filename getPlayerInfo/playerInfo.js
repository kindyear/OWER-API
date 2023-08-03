/*
    playerInfo
    玩家基础信息提取
 */
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const {response} = require("express");
const {getCurrentTime} = require('../utils');
const {DATA_SOURCE} = require("../config/config");

// 提取用户数据的函数
async function playerInfo(playerTag) {
    let browser;
    try {
        console.log(`${getCurrentTime()} Received API request: \u001b[33m${playerTag}\u001b[0m`);

        const url = `${DATA_SOURCE}${encodeURIComponent(playerTag)}/`;

        browser = await puppeteer.launch({headless: "new", args: ["--no-sandbox"]});
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
            // 访问网页
            await page.goto(url, {waitUntil: 'domcontentloaded'});
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

        // 获取页面内容
        const content = await page.content();
        const $ = cheerio.load(content);


        // 玩家标签是否存在
        const errorElement = await page.$('.error-contain');
        const isError = !!errorElement;
        if (isError) {
            await browser.close();
            console.log('${getCurrentTime()} \u001b[33m' + playerTag + '\u001b[0m Not Found');
            return {
                error: "Player not found."
            }
        }

        // 检查私密信息元素
        const privateElement = await page.$('.Profile-private---msg');
        const isPrivate = !!privateElement;

        // 玩家基础信息
        const playerName = $('h1.Profile-player--name').text();
        const playerTitle = $('h2.Profile-player--title').text();
        const playerIcon = $('.Profile-player--portrait').attr('src');
        // 玩家赞赏，通过提取赞赏图标url的内容来区分赞赏等级
        const endorsementIconSrc = $('.Profile-playerSummary--endorsement').attr('src');
        const endorsementLevel = endorsementIconSrc.match(/endorsement\/(\d+)/)[1];
        const playerCompetitiveInfo = {
            PC: {
                Tank: {},
                Damage: {},
                Support: {}
            }
        };

        const roles = ['Tank', 'Damage', 'Support'];
        roles.forEach((role) => {
            let roleWrapper;

            // 处理Damage角色图片标签的特殊情况
            if (role === 'Damage') {
                roleWrapper = $('.Profile-playerSummary--roleWrapper:has(.Profile-playerSummary--role img[src*="offense"])');
            } else {
                roleWrapper = $(`.Profile-playerSummary--roleWrapper:has(.Profile-playerSummary--role img[src*="${role.toLowerCase()}"])`);
            }

            if (roleWrapper.length > 0) {
                const rankElement = roleWrapper.find('.Profile-playerSummary--rank');
                const rankSrc = rankElement.attr('src');
                const rankName = rankSrc ? rankSrc.match(/rank\/(.*?)-\w+/)[1].replace("Tier", "") : '';
                const rankTier = rankSrc ? parseInt(rankSrc.match(/rank\/.*?-(\d+)/)[1]) : 0;

                if (role === 'Tank') {
                    playerCompetitiveInfo.PC.Tank = {
                        playerCompetitivePCTank: rankName,
                        playerCompetitivePCTankTier: rankTier
                    };
                } else if (role === 'Damage') {
                    playerCompetitiveInfo.PC.Damage = {
                        playerCompetitivePCDamage: rankName,
                        playerCompetitivePCDamageTier: rankTier
                    };
                } else if (role === 'Support') {
                    playerCompetitiveInfo.PC.Support = {
                        playerCompetitivePCSupport: rankName,
                        playerCompetitivePCSupportTier: rankTier
                    };
                }
            } else {
                // 如果没有找到该角色，则设置为null
                playerCompetitiveInfo.PC[role] = null;
            }
        });
        const currentUNIXTime = Math.floor(Date.now() / 1000);
        await browser.close();
        // 构造JSON格式输出
        return {
            private: isPrivate,
            //用户基础生涯信息
            playerBaseInfo: {
                playerTag: playerTag,
                playerName: playerName.trim(),
                playerTitle: playerTitle.trim(),
                playerIcon: playerIcon.trim(),
                endorsementLevel: parseInt(endorsementLevel),
            },
            //用户竞技信息
            playerCompetitiveInfo: playerCompetitiveInfo,
            currentTime: currentUNIXTime,


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

module.exports = {playerInfo};