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

        //玩家竞技段位等级（仅PC，暂不支持主机端）
        const roles = ['Tank', 'Damage', 'Support'];
        const playerCompetitiveInfo = {
            PC: {}
        };
        roles.forEach((role) => {
            const roleElement = $(`.Profile-playerSummary--roleWrapper:contains(${role})`);
            if (roleElement.length) { // Use length to check if the element exists
                const rankElement = roleElement.find('.Profile-playerSummary--rank');
                const rankSrc = rankElement.attr('src');
                console.log(`[${currentTime}] Role: ${role}, RankSrc: ${rankSrc}`)
                const rankName = rankSrc ? rankSrc.match(/rank\/(.*?)-\d+/)[1] : '';
                const rankTier = rankSrc ? parseInt(rankSrc.match(/rank\/.*?-(\d+)/)[1]) : 0;

                // Define the variables for each role
                const playerCompetitivePCRole = `playerCompetitivePC${role}`;
                const playerCompetitivePCRoleTier = `playerCompetitivePC${role}Tier`;

                playerCompetitiveInfo.PC[role] = {
                    [playerCompetitivePCRole]: rankName,
                    [playerCompetitivePCRoleTier]: rankTier
                };
            }
        });

        /*
        //玩家英雄使用时长排行（仅PC，暂不支持主机端）
        const playerPCTopHeroes_TimePlayed;*/
        await browser.close();
        // 构造JSON格式输出
        return {
            playerBaseInfo: {
                playerTag: playerTag,
                playerName: playerName.trim(),
                playerTitle: playerTitle.trim(),
                playerIcon: playerIcon.trim(),
                endorsementLevel: parseInt(endorsementLevel),
            },
            playerCompetitiveInfo: {
                PC: {
                    Tank: {
                        playerCompetitivePCTank: playerCompetitivePCTank,
                        playerCompetitivePCTankTier: playerCompetitivePCTankTier,
                    },
                    Damage: {
                        playerCompetitivePCDamage: playerCompetitivePCDamage,
                        playerCompetitivePCDamageTier: playerCompetitivePCDamageTier,
                    },
                    Support: {
                        playerCompetitivePCSupport: playerCompetitivePCSupport,
                        playerCompetitivePCSupportTier: playerCompetitivePCSupportTier,
                    },
                },
                Console: {},
            },
        };
    } catch (error) {
        const currentTime = new Date().toISOString();
        console.error(`[${currentTime}] Error:`, error.message);
        throw new Error('无法获取数据。');
    }
}

module.exports = {scrapeUserData};
