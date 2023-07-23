const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const {response} = require("express");

// 提取用户数据的函数
async function scrapeUserData(playerTag) {
    try {
        const currentTime = new Date().toISOString();
        console.log(`[${currentTime}] Received API request:`, playerTag);

        const url = `https://overwatch.blizzard.com/en-us/career/${encodeURIComponent(playerTag)}/`;

        const browser = await puppeteer.launch({headless: "new"});
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
        // 访问网页
        await page.goto(url, {waitUntil: 'domcontentloaded'});

        // 获取页面内容
        const content = await page.content();
        const $ = cheerio.load(content);

        // 玩家基础信息
        const playerName = $('h1.Profile-player--name').text();
        const playerTitle = $('h2.Profile-player--title').text();
        const playerIcon = $('.Profile-player--portrait').attr('src');
        //玩家赞赏，通过提取赞赏图标url的内容来区分赞赏等级
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


        /*
        //玩家英雄使用时长排行（仅PC，暂不支持主机端）
        const playerPCTopHeroes_TimePlayed;*/
        await browser.close();
        // 构造JSON格式输出
        return {
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

        };
    } catch (error) {
        const currentTime = new Date().toISOString();
        console.error(`[${currentTime}] Error:`, error.message);
        throw new Error('无法获取数据。');
    }
}

module.exports = {scrapeUserData};
