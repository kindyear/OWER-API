const express = require('express');

console.log(`Starting server...`);

// 英雄信息
const herosData = require('./data/herosData.json');

// 玩家基础信息
const appPlayerInfo = require('./getPlayerInfo/playerInfo');
// 玩家快速/竞技游戏英雄排行榜数据
const appPlayerPCQuickInfo = require('./getPlayerInfo/playerPCQuickInfo');
const appPlayerPCCompetitiveInfo = require('./getPlayerInfo/playerPCCompetitiveInfo');
// 玩家快速/竞技游戏英雄数据
const appPlayerPCQuickHerosInfo = require('./getPlayerInfo/playerPCQuickHerosInfo');
const appPlayerPCCompetitiveHerosInfo = require('./getPlayerInfo/playerPCCompetitiveHerosInfo');
/*
// 主机数据功能，暂未开发
const appPlayerConsoleQuickInfo = require('./getPlayerInfo/playerConsoleQuickInfo');
const appPlayerConsoleCompetitiveInfo = require('./getPlayerInfo/playerConsoleCompetitiveInfo');
*/
const config = require('./config/config');
const app = express();
const { getCurrentTime } = require('./utils');
const PORT = config.PORT || 16524;
const fs = require('fs');
const { HOST } = require("./config/config");
const heroIDData = require("./data/herosData.json");

// 处理package.json文件
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const version = packageJson.version;

// apiKey鉴权
function authenticate(req, res, next) {
    const { apiKey } = req.query;

    if (!apiKey || apiKey !== config.API_KEY) {
        return res.status(401).json({ error: 'Unauthorized. Please provide a valid API key.' });
    }
    next();
}
app.use(authenticate);

// 玩家基础信息
app.get('/v1/api/playerInfo', async (req, res) => {
    try {
        const { playerTag } = req.query;

        if (!playerTag) {
            return res.status(400).json({ error: 'playerTag is required.' });
        }

        const playerData = await appPlayerInfo.playerInfo(playerTag);

        res.json(playerData);
        console.log(`${getCurrentTime()} \u001b[33m${playerTag}\u001b[0m‘s data has been scraped successfully.`);
    } catch (error) {
        console.error(`${getCurrentTime()} Error:`, error.message);
        res.status(500).json({ error: 'Failed to scrape data.' });
    }
});

// PC平台玩家快速游戏信息
app.get('/v1/api/playerPCQuickInfo', async (req, res) => {
    try {
        const { playerTag, type } = req.query;

        // 在这里添加调试输出，确认type参数的值
        //console.log('Received request with playerTag:', playerTag, 'and type:', type);

        // 将type参数转换为小写
        const selectedType = type ? type.toLowerCase() : null;

        if (!playerTag) {
            return res.status(400).json({ error: 'playerTag is required.' });
        }

        if (!selectedType || !(selectedType in appPlayerPCQuickInfo.typeToCategoryIdMap)) {
            return res.status(400).json({ error: 'Invalid type. Please provide a valid type for the rankings.' });
        }

        const playerData = await appPlayerPCQuickInfo.scrapeHeroQuickPlayRankings(playerTag, selectedType);

        res.json(playerData);
        console.log(`${getCurrentTime()} \u001b[33m${playerTag}\u001b[0m‘s data has been scraped successfully.`); // 使用ANSI转义序列来设置playerTag为黄色
    } catch (error) {
        console.error(`${getCurrentTime()} Error:`, error.message);
        res.status(500).json({ error: 'Failed to scrape data.' });
    }
});

// PC平台玩家竞技比赛信息
app.get('/v1/api/playerPCCompetitiveInfo', async (req, res) => {
    try {
        const { playerTag, type } = req.query;

        // 将type参数转换为小写
        const selectedType = type ? type.toLowerCase() : null;

        if (!playerTag) {
            return res.status(400).json({ error: 'playerTag is required.' });
        }

        if (!selectedType || !(selectedType in appPlayerPCCompetitiveInfo.typeToCategoryIdMap)) {
            return res.status(400).json({ error: 'Invalid type. Please provide a valid type for the rankings.' });
        }

        const playerData = await appPlayerPCCompetitiveInfo.scrapeHeroCompetitivePlayRankings(playerTag, selectedType);

        res.json(playerData);
        console.log(`${getCurrentTime()} \u001b[33m${playerTag}\u001b[0m‘s data has been scraped successfully.`); // 使用ANSI转义序列来设置playerTag为黄色
    } catch (error) {
        console.error(`${getCurrentTime()} Error:`, error.message);
        res.status(500).json({ error: 'Failed to scrape data.' });
    }
});

// PC平台玩家快速游戏英雄数据
app.get('/v1/api/playerPCQuickHerosInfo', async (req, res) => { });

// PC平台玩家竞技比赛英雄数据
app.get('/v1/api/playerPCCompetitiveHerosInfo', async (req, res) => {
    try {
        const { playerTag, heroID } = req.query;

        // 在这里添加调试输出，确认传入的playerTag和heroID参数的值
        //console.log('Received request with playerTag:', playerTag, 'and heroID:', heroID, heroName);

        if (!playerTag || !heroID) {
            return res.status(400).json({ error: 'playerTag and heroID are required.' });
        }

        if (!(heroID in herosData)) {
            return res.status(400).json({ error: 'Invalid heroID. Please provide a valid heroID from the list of available heroes.' });
        }
        // 调用playerPCCompetitiveHerosInfo.js中的函数来处理玩家PC平台竞技模式的英雄信息
        const playerData = await appPlayerPCCompetitiveHerosInfo.scrapeHeroCompetitiveInfo(playerTag, heroID);

        // 返回处理后的数据给客户端
        res.json(playerData);
        console.log(`${getCurrentTime()} \u001b[33m${playerTag}\u001b[0m‘s competitive hero data for heroID \u001b[33m${heroID}\u001b[0m has been scraped successfully.`); // 使用ANSI转义序列来设置playerTag和heroID为黄色
    } catch (error) {
        console.error(`${getCurrentTime()} Error:`, error.message);
        res.status(500).json({ error: 'Failed to scrape data.' });
    }
});



// 主机平台玩家快速游戏信息（未开发）
/*
app.get('/v1/api/playerConsoleQuickInfo', async (req, res) => {

});
*/
// 主机平台玩家竞技比赛信息（未开发）
/*app.get('/v1/api/playerConsoleCompetitiveInfo', async (req, res) => {
    res.json({message: '获取玩家竞技比赛信息'});
});*/

app.listen(PORT, () => {
    console.log(`${getCurrentTime()} OWER-API Version: ${version}`)
    console.log(`${getCurrentTime()} OWER-API Service is running on http://${HOST}:${PORT}`);
});
