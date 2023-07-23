const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const {response} = require("express");

// 提取用户数据的函数
async function scrapeUserData(playerTag) {
    try {
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
        await page.goto(url);

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
        const ranks = {};

        const roles = ['Tank', 'Damage', 'Support'];
        for (const role of roles) {
            const roleElement = $(`.Profile-playerSummary--roleWrapper:contains(${role})`);
            const rankElement = roleElement.find('.Profile-playerSummary--rank');
            const rankSrc = rankElement.attr('src');
            const rankName = rankSrc.match(/rank\/(.*?)-/)[1];
            const rankTier = rankSrc.match(/rank\/.*?-(\d+)/)[1];

            ranks[`playerCompetitivePC${role}`] = rankName;
            ranks[`playerCompetitivePC${role}Tier`] = parseInt(rankTier);
        }
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
                        playerCompetitivePCTank: ranks.playerCompetitivePCTank,
                        playerCompetitivePCTankTier: ranks.playerCompetitivePCTankTier,
                    },
                    Damage: {
                        playerCompetitivePCDamage: ranks.playerCompetitivePCDamage,
                        playerCompetitivePCDamageTier: ranks.playerCompetitivePCDamageTier,
                    },
                    Support: {
                        playerCompetitivePCSupport: ranks.playerCompetitivePCSupport,
                        playerCompetitivePCSupportTier: ranks.playerCompetitivePCSupportTier,
                    },
                },
                Console: {},
            },
        };
    } catch (error) {
        throw new Error('无法获取数据。');
    }
}

module.exports = {scrapeUserData};