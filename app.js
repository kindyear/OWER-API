const express = require('express');

console.log(`Starting server...`);
const appPlayerInfo = require('./getPlayerInfo/playerInfo');
const appPlayerPCQuickInfo = require('./getPlayerInfo/playerPCQuickInfo');
const appPlayerPCCompetitiveInfo = require('./getPlayerInfo/playerPCCompetitiveInfo');
const appPlayerConsoleQuickInfo = require('./getPlayerInfo/playerConsoleQuickInfo');
const appPlayerConsoleCompetitiveInfo = require('./getPlayerInfo/playerConsoleCompetitiveInfo');
const config = require('./config/config');
const app = express();
const {getCurrentTime} = require('./utils');
const PORT = config.PORT || 16524;

function authenticate(req, res, next) {
    const {apiKey} = req.query;

    if (!apiKey || apiKey !== config.API_KEY) {
        return res.status(401).json({error: 'Unauthorized. Please provide a valid API key.'});
    }
    next();
}

app.use(authenticate);

app.get('/v1/api/playerInfo', async (req, res) => {
    try {
        const {playerTag} = req.query;

        if (!playerTag) {
            return res.status(400).json({error: 'playerTag is required.'});
        }

        const playerData = await appPlayerInfo.playerInfo(playerTag);

        res.json(playerData);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({error: 'Failed to scrape data.'});
    }
});

app.get('/v1/api/playerPCQuickInfo', async (req, res) => {
    try {
        const {playerTag, type} = req.query;

        // 在这里添加调试输出，确认type参数的值
        //console.log('Received request with playerTag:', playerTag, 'and type:', type);

        // 将type参数转换为小写
        const selectedType = type ? type.toLowerCase() : null;

        if (!playerTag) {
            return res.status(400).json({error: 'playerTag is required.'});
        }

        if (!selectedType || !(selectedType in appPlayerPCQuickInfo.typeToCategoryIdMap)) {
            return res.status(400).json({error: 'Invalid type. Please provide a valid type for the rankings.'});
        }

        const playerData = await appPlayerPCQuickInfo.scrapeHeroQuickPlayRankings(playerTag, selectedType);

        res.json(playerData);
        console.log(`${getCurrentTime()} \u001b[33m${playerTag}\u001b[0m‘s data has been scraped successfully.`); // 使用ANSI转义序列来设置playerTag为黄色
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({error: 'Failed to scrape data.'});
    }
});

app.get('/v1/api/playerConsoleQuickInfo', async (req, res) => {

});

app.get('/v1/api/playerPCCompetitiveInfo', async (req, res) => {
    try {
        const {playerTag, type} = req.query;

        // 在这里添加调试输出，确认type参数的值
        //console.log('Received request with playerTag:', playerTag, 'and type:', type);

        // 将type参数转换为小写
        const selectedType = type ? type.toLowerCase() : null;

        if (!playerTag) {
            return res.status(400).json({error: 'playerTag is required.'});
        }

        if (!selectedType || !(selectedType in appPlayerPCCompetitiveInfo.typeToCategoryIdMap)) {
            return res.status(400).json({error: 'Invalid type. Please provide a valid type for the rankings.'});
        }

        const playerData = await appPlayerPCCompetitiveInfo.scrapeHeroCompetitivePlayRankings(playerTag, selectedType);

        res.json(playerData);
        console.log(`${getCurrentTime()} \u001b[33m${playerTag}\u001b[0m‘s data has been scraped successfully.`); // 使用ANSI转义序列来设置playerTag为黄色
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({error: 'Failed to scrape data.'});
    }
});

app.get('/v1/api/playerConsoleCompetitiveInfo', async (req, res) => {
    res.json({message: '获取玩家竞技比赛信息'});
});

app.listen(PORT, () => {
    console.log(`${getCurrentTime()} OWER-API Version: ${config.VERSION}`)
    console.log(`${getCurrentTime()} OWER-API Service is running on http://localhost:${PORT}`);
});
