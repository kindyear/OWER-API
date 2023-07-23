const express = require('express');

//数据路由处理模块
const appPlayerInfo = require('./getPlayerInfo/playerInfo');
const appPlayerQuickInfo = require('./getPlayerInfo/playerQuickInfo')
const appPlayerCompetitiveInfo = require('./getPlayerInfo/playerCompetitiveInfo');
//配置文件
const config = require('./config/config')

const app = express();

//API服务端口,修改请前往config文件夹中的config.js中修改
const PORT = config.PORT || 16524;

function authenticate(req, res, next) {
    const {apiKey} = req.query;

    // 检查请求中是否包含密钥，并与保存的密钥进行比较
    if (!apiKey || apiKey !== config.API_KEY) {
        return res.status(401).json({error: 'Unauthorized. Please provide a valid API key.'});
    }
    next();
}

app.use(authenticate);

//用户基础信息API路由
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

// 用户快速游戏信息API路由
app.get('/v1/api/playerquickplayinfo', async (req, res) => {
    res.json({message: '获取玩家快速比赛信息'});
});

//用户竞技游戏信息API路由
app.get('/v1/api/playercompetitiveinfo', async (req, res) => {
    res.json({message: '获取玩家竞技比赛信息'});
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
