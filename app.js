// app.js
const express = require('express');
const userData = require('./DataTable/UserData');

const app = express();
const PORT = 3000;

app.get('/api/scrape', async (req, res) => {
    try {
        const {playerTag} = req.query;

        if (!playerTag) {
            return res.status(400).json({error: 'playerTag is required.'});
        }

        const playerData = await userData.scrapeUserData(playerTag);

        res.json(playerData);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({error: 'Failed to scrape data.'});
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
