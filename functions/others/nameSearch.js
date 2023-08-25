/*
    nameSearch.js
    搜索玩家BattleTag并返回第一个数据
*/

module.exports = function nameSearch(playerTag) {
    const axios = require('axios');
    const config = require("../../config/config");
    const rawPlayerTag = playerTag.replace("-", "#");
    //  console.log(rawPlayerTag);
    const searchApiURL = `${config.NAME_SEARCH}/${encodeURIComponent(rawPlayerTag)}`;

    return axios.get(searchApiURL)
        .then(response => {
            const apiData = response.data;
            //  console.log(apiData);
            if (Array.isArray(apiData) && apiData.length > 0) {
                const exactMatch = apiData.find(info => info.battleTag === rawPlayerTag);
                if (exactMatch) {
                    const exactMatchBattleTag = exactMatch.battleTag.replace("#", "-");
                    return exactMatchBattleTag;
                } else {
                    const lowerCasePlayerTag = rawPlayerTag.toLowerCase();
                    const fuzzyMatch = apiData.find(info => info.battleTag.toLowerCase() === lowerCasePlayerTag);
                    if (fuzzyMatch) {
                        const fuzzyMatchBattleTag = fuzzyMatch.battleTag.replace("#", "-");
                        return fuzzyMatchBattleTag;
                    } else {
                        throw new Error("No data found.");
                    }
                }
            } else {
                throw new Error("No data found.");
            }
        })
        .catch(error => {
            throw error;
        });
};
