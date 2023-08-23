/*
    nameSearch.js
    搜索玩家BattleTag并返回第一个数据
*/

module.exports = function nameSearch(playerTag) {
    const axios = require('axios');
    const config = require("../../config/config");
    const rawPlayerTag = playerTag.replace('-', '#');
    const searchApiURL = `${config.NAME_SEARCH}/${rawPlayerTag}`; // Make sure config.NAME_SEARCH is the correct URL

    return axios.get(searchApiURL)
        .then(response => {
            const apiData = response.data;
            if (Array.isArray(apiData) && apiData.length > 0) {
                const firstInfo = apiData[0];
                const battleTag = firstInfo.battleTag;
                const finnalBattleTag = battleTag.replace('#', '-');
                return finnalBattleTag;
            } else {
                throw new Error("No data found.");
            }
        })
        .catch(error => {
            throw error; // You can handle the error as needed
        });
}
