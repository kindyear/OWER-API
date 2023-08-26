module.exports = function nameSearch(playerTag) {
    const axios = require('axios');
    const config = require("../../config/config");
    console.log(playerTag)
    const rawPlayerTag = playerTag.replace("-", "#");
    const searchApiURL = `${config.NAME_SEARCH}/${encodeURIComponent(rawPlayerTag)}`;

    return axios.get(searchApiURL)
        .then(response => {
            const apiData = response.data;
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
                        return "Player Not Found.";
                    }
                }
            } else {
                return "Player Not Found.";
            }
        });
};
