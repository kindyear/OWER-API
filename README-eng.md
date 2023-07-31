<div align="center">
     <img width="400" src="./docs/logo.svg" alt="logo">
----
OWER is a player career data acquisition program based on NodeJS and Puppeteer for Overwatch 2 (Overwatch2) international servers running on all platforms.

The name of this project comes from Overwatch Player, so it was abbreviated as OWER
</div>

#

#OWER-API

[简体中文](./README.md) | English

# deployment

Requirement: NodeJS V18.15.0 (normal operation on this version, other versions have not been tested)

The port defaults to ``16524``

> Note: Due to the network environment in mainland China, the data acquisition speed of the international server may be
> very slow or even impossible, so it is recommended to deploy it on a foreign server

Make sure that Git has been installed on the deployment host, and execute the following command in the directory to be
deployed:

```bash
git clone https://github.com/kindyear/OWER-API.git
```

then run the project

```bash
node app.js
```

It is not recommended to set the port to 80 or other commonly used ports to prevent conflicts with existing services
such as Nginx or Apache. You can use the reverse proxy function to proxy it to port 80 or other ports you want to set

# API documentation

The API path is: ``http(s)://yourdomain.com:port/v1/api/xxxx``

Replace xxxx with the routing interface you want to request

## Global parameters

``apiKey``: Required, the access key used to authenticate access to the API. Can be modified
in ``project directory/config/config.js``

`playerTag`: required, the player's BattleTag (Battle ID), for example: ``KINDYEAR-1336``, replace ``#`` with ``-``

## API endpoints

### Get the player's basic career information

- URL: ``/v1/api/PlayerInfo?{playerTag}&{apiKey}``
- Method: ``GET``
- response

```json
{
  "playerBaseInfo": {
    "playerTag": "KINDYEAR-1336",
    "playerName": "KINDYEAR",
    "playerTitle": "Extraterrestrial",
    "playerIcon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/5c670baeda5a7b2ed707c940f6b17773e9fd41fe783a8810ea9283cd55d6fd43.png",
    "endorsementLevel": 2
  },
  "playerCompetitiveInfo": {
    "PC": {
      "Tank": {
        "playerCompetitivePCTank": "Platinum",
        "playerCompetitivePCTankTier": 2
      },
      "Damage": {
        "playerCompetitivePCDamage": "Gold",
        "playerCompetitivePCDamageTier": 2
      },
      "Support": {
        "playerCompetitivePCSupport": "Gold",
        "playerCompetitivePCSupportTier": 3
      }
    }
  },
  "currentTime": 1690110879
}
```

Data Interpretation:

* ``playerBaseInfo``: player base information
    * ``playerTag``: Player's BattleTag (Battle.net ID)
    * ``playerName``: The nickname of the player
    * ``playerTitle``: The title of the player
    * ``playerIcon``: The player's avatar
    * ``endorsementLevel``: The player's endorsement level
* ``playerCompetitiveInfo``: The player's competitive information
    * ``PC``: Player's PC competitive game information
        * ``Tank``: Player's tank information
            * ``playerCompetitivePCTank``: Player's tank rank
            * ``playerCompetitivePCTankTier``: Player's tank rank
        * ``Damage``: The player's output information
            * ``playerCompetitivePCDamage``: Player's output rank
            * ``playerCompetitivePCDamageTier``: player's output tier
        * ``Support``: player's auxiliary information
            * ``playerCompetitivePCSupport``: player's auxiliary rank
            * ``playerCompetitivePCSupportTier``: The player's auxiliary tier
* ``currentTime``: current timestamp

> Due to the restrictions of Blizzard, the specific ranking of the top 500 cannot be obtained, and the ranks of all the
> top 500 are displayed as GrandMaster-1, which is Grandmaster 1
>
> The rank only shows the rank of the current season, and the rank of the previous season cannot be viewed
>
> In addition, Blizzard does not seem to provide information about the tiers of open responsibilities (it is in the game
> but I can’t find it), so all the tiers of default responsibilities are displayed here

> Don't ask why there is no console, just ask friends who don't play consoles and are too lazy to be consoles

### PC platform port data

#### Get player quick game ranking information

- URL: `/v1/api/playerPCQuickInfo?{playerTag}&{apiKey}&{type}`

- Method: ``GET``

- Parameters: `{type}`: required, the requested leaderboard type, the specific parameters are explained as follows

|       `type` type       |                 Explanation                  |
|:-----------------------:|:--------------------------------------------:|
|      `time-played`      |             character play time              |
|       `games-won`       |     Number of games won by the character     |
|    `weapon-accuracy`    |          character weapon accuracy           |
| `eliminations-per-life` |     Number of character kills / per life     |
| `critical-hit-accuracy` |         Character critical hit rate          |
|    `multikill-best`     |      Maximum single kill of a character      |
|    `objective-kills`    | kills within the character's objective point |

Note: The kills within the target point are the total number of players killed by the player in/near the target,
including the delivery target or the target point. In addition, the data arrangement format is from more to less, see
the response for details

- response

```json
{
  "playerTag": "KINDYEAR-1336",
  "gameMode": "quickPlay",
  "type": "weapon-accuracy",
  "heroRankings": [
    {
      "heroName": "Sigma",
      "heroData": "46%"
    },
    {
      "heroName": "Mei",
      "heroData": "44%"
    },
    {
      "heroName": ".......",
      "heroData": "......."
    },
    {
      "heroName": "Moira",
      "heroData": "0"
    }
  ],
  "currentTime": 1690184120150
}
```

Data Interpretation:

* ``playerTag``: Player's BattleTag (Battle.net ID)
* ``gameMode``: game mode (divided into `quickPlay` fast mode and `competitive` competitive mode)
* ``type``: the requested data ranking type
* ``heroRankings``: hero ranking data
    * ``heroName``: hero name
    * ``heroData``: hero data
      *......
* ``currentTime``: current timestamp

#### Get player ranking information

- URL: `/v1/api/playerPCCompetitiveInfo?{playerTag}&{apiKey}&{type}`

- Method: ``GET``

- Parameters: `{type}`: required, the requested leaderboard type, the specific parameters are explained as follows

|       `type` type       |                     Explanation                     |
|:-----------------------:|:---------------------------------------------------:|
|      `time-played`      |                 character play time                 |
|       `games-won`       |        Number of games won by the character         |
|    `weapon-accuracy`    |              character weapon accuracy              |
|    `win-percentage`     | Character win percentage (only in competitive mode) |
| `eliminations-per-life` |        Number of character kills / per life         |
| `critical-hit-accuracy` |             Character critical hit rate             |
|    `multikill-best`     |         Maximum single kill of a character          |
|    `objective-kills`    |    kills within the character's objective point     |

Note: ``win-percentage`` parameter is **competitive mode**
Exclusive, not available in Quick Mode where kills within objective is the total number of players killed by players
in/near the objective, including payloads or objective points. In addition, the data arrangement format is arranged from
more to less, and the response and data interpretation are similar to the quick game mode, which will not be repeated
here.
In addition, the data of the competitive mode only shows the data of the current season, and the data of the previous
season cannot be viewed.

#### Get the player's quick game hero data information

- URL: `/v1/api/playerPCQuickHerosInfo?{playerTag}&{apiKey}&{heroID}`

- Method: ``GET``

- Parameters: `{heroID}`: required, the requested hero ID, for the specific heroID and hero name correspondence table,
  please refer to: [heroID and hero name correspondence table] (#heroID and hero name correspondence table)

- Response (take ALL HEROS as an example here, different heroes have different corresponding data)

```json

"playerTag": "KINDYEAR-1336",
"heroID": 0,
"heroName": "ALL HEROES",
"heroSourceID": "0",
"quickHeroData": [
{
"categoryName": "Best",
"categoryData": [
{
"statName": "Eliminations - Most in Game",
"statValue": "42"
},
{
"statName": "Final Blows - Most in Game",
"statValue": "19"
},
{
"statName": "Healing Done - Most in Game",
"statValue": "18075"
},
{
"statName": "Objective Kills - Most in Game",
"statValue": "24"
},
{
"statName": "Objective Time - Most in Game",
"statValue": "06:42"
},
{
"statName": "Multikill - Best",
"statValue": "4"
},
{
"statName": "Solo Kills - Most in Game",
"statValue": "19"
},
{
"statName": "Melee Final Blows - Most in Game",
"statValue": "4"
},
{
"statName": "Kill Streak - Best",
"statValue": "22"
},
{
"statName": "Hero Damage Done - Most in Game",
"statValue": "19236"
},
{
"statName": "Assists - Most in Game",
"statValue": "30"
},
{
"statName": "Objective Contest Time - Most in Game",
"statValue": "05:09"
},
{
"statName": "Recon Assists - Most in Game",
"statValue": "14"
}
]
},
{
"categoryName": "Average",
"categoryData": [
{
"statName": "Hero Damage Done - Avg per 10 Min",
"statValue": "4747"
},
{
"statName": "Deaths - Avg per 10 Min",
"statValue": "4.82"
},
{
"statName": "Assists - Avg per 10 min",
"statValue": "11.65"
},
{
"statName": "Eliminations - Avg per 10 Min",
"statValue": "12.37"
},
{
"statName": "Healing Done - Avg per 10 Min",
"statValue": "5783"
},
{
"statName": "Objective Kills - Avg per 10 Min",
"statValue": "5.05"
},
{
"statName": "Objective Time - Avg per 10 Min",
"statValue": "01:23"
},
{
"statName": "Final Blows - Avg per 10 Min",
"statValue": "4.73"
},
{
"statName": "Time Spent on Fire - Avg per 10 Min",
"statValue": "00:32"
},
{
"statName": "Objective Contest Time - Avg per 10 Min",
"statValue": "00:43"
},
{
"statName": "Solo Kills - Avg per 10 Min",
"statValue": "0.61"
}
]
},
{
"categoryName": "Game",
"categoryData": [
{
"statName": "Time Played",
"statValue": "51:59:15"
},
{
"statName": "Games Played",
"statValue": "368"
},
{
"statName": "Games Won",
"statValue": "192"
},
{
"statName": "Games Lost",
"statValue": "176"
}
]
},
{
"categoryName": "Combat",
"categoryData": [
{
"statName": "Environmental Kills",
"statValue": "12"
},
{
"statName": "Multikills",
"statValue": "24"
},
{
"statName": "Hero Damage Done",
"statValue": "1480665"
},
{
"statName": "Deaths",
"statValue": "1504"
},
{
"statName": "Eliminations",
"statValue": "3858"
},
{
"statName": "Damage Done",
"statValue": "1480665"
},
{
"statName": "Objective Kills",
"statValue": "1575"
},
{
"statName": "Final Blows",
"statValue": "1475"
},
{
"statName": "Objective Time",
"statValue": "07:09:06"
},
{
"statName": "Melee Final Blows",
"statValue": "65"
},
{
"statName": "Time Spent on Fire",
"statValue": "02:44:23"
},
{
"statName": "Objective Contest Time",
"statValue": "03:45:18"
},
{
"statName": "Solo Kills",
"statValue": "189"
}
]
},
{
"categoryName": "Assists",
"categoryData": [
{
"statName": "Recon Assists",
"statValue": "81"
},
{
"statName": "Assists",
"statValue": "3633"
},
{
"statName": "Healing Done",
"statValue": "1803937"
},
{
"statName": "Defensive Assists",
"statValue": "2951"
},
{
"statName": "Offensive Assists",
"statValue": "1422"
}
]
}
],
"currentTime": 1690344710459
}
```

Data Interpretation:

* ``playerTag``: Player's BattleTag (Battle.net ID)
* ``heroID``: hero ID
* ``heroName``: hero name
* ``heroSourceID``: hero source ID (users do not need to pay attention to this data, the explanation of this value can
  be seen later)
* ``quickHeroData``: hero data
    * ``categoryName``: data category name
    * ``categoryData``: data classification data
        * ``statName``: data name
        * ``statValue``: data value
        * …
        * …
* ``currentTime``: current timestamp

#### Obtain the player's competitive game hero data information

- URL: `/v1/api/playerPCCompetitiveHerosInfo?{playerTag}&{apiKey}&{heroID}`

- Method: ``GET``

- Parameters: `{heroID}`: required, the requested hero ID, for the specific heroID and hero name correspondence table,
  please refer to: [heroID and hero name correspondence table] (#heroID and hero name correspondence table)

- Response to quick mode hero data is similar, and data interpretation is also similar, so I won’t go into details here

### Console host platform port data

Don’t ask, it’s because I don’t have a console and I don’t have friends who play consoles, and I’m lazy. Anyway, the
files, routing, and codes have reserved the functions of the console. If I have a chance in the future, I may fill in
the pits.

Also welcome to fork or submit code that supports hosts

### Partial data interpretation

1. **``heroSourceID``**: Since different players have different hero lists, it is possible that a certain player does
   not play a certain hero, resulting in `heroID` in the `herosData.json` file
   There is no one-to-one correspondence, so a temporary built-in maintenance of a `heroID` correspondence table
   dedicated to the player itself during the processing, and the heroSourceID is the `heroID`
   The actual ID value on the page, if it does not exist, it will be a `null` value, so that the accuracy of the data
   can be guaranteed, and the integrity of the data can also be guaranteed, and the data will not be lost because the
   data of a certain hero does not exist. incomplete.

### heroID and hero name correspondence table

| heroID | 英雄名称（heroName） |  英雄简体中文名称   |
|:------:|:--------------:|:-----------:|
|   0    |   ALL HEROS    |    全部英雄     |
|   1    |      Ana       |     安娜      |
|   2    |      Ashe      |     艾什      |
|   3    |    Baptiste    |    巴蒂斯特     |
|   4    |    Bastion     |     堡垒      |
|   5    |    Brigitte    |    布里吉塔     |
|   6    |    Cassidy     | 卡西迪（永远的麦克雷） |
|   7    |      D.Va      |    D.Va     |
|   8    |    Doomfist    |    末日铁拳     |
|   9    |      Echo      |     回声      |
|   10   |     Genji      |     源氏      |
|   11   |     Hanzo      |     半藏      |
|   12   |  Junker Queen  |    渣客女王     |
|   13   |    Junkrat     |     狂鼠      |
|   14   |     Kiriko     |     雾子      |
|   15   |   Lifeweaver   |    生命之梭     |
|   16   |     Lúcio      |     卢西奥     |
|   17   |      Mei       |      美      |
|   18   |     Mercy      |     天使      |
|   19   |     Moira      |     莫伊拉     |
|   20   |     Orisa      |     奥丽莎     |
|   21   |     Pharah     |    法老之鹰     |
|   22   |    Ramattra    |     拉玛刹     |
|   23   |     Reaper     |     死神      |
|   24   |   Reinhardt    |    莱因哈特     |
|   25   |    Roadhog     |     路霸      |
|   26   |     Sigma      |     西格玛     |
|   27   |    Sojourn     |     索杰恩     |
|   28   |  Soldier: 76   |    士兵：76    |
|   29   |     Sombra     |     黑影      |
|   30   |    Symmetra    |    秩序之光     |
|   31   |    Torbjörn    |     托比昂     |
|   32   |     Tracer     |     猎空      |
|   33   |   Widowmaker   |     黑百合     |
|   34   |    Winston     |     温斯顿     |
|   35   | Wrecking Ball  |     破坏球     |
|   36   |     Zarya      |     查莉娅     |
|   37   |    Zenyatta    |     禅雅塔     |

# TODO

- [x] Player base game information
- [x] Quick game info for PC players
- [x] Competitive game information for PC players
- [x] PC players quickly play each hero information
- [x] Hero information for competitive games for PC players
- [ ] Quick game information for host players
- [ ] Quick game information for host players
- [ ] host player quick game hero information
- [ ] Hero information of competitive games for console players

# inspiration / thanks

> No ranking

- https://zusor.io/
- Linus
- 花散里
- 低调做人

# Disclaimer

The OWER Project is not affiliated with Blizzard and does not reflect the views or opinions of Blizzard or anyone
officially involved in the production or management of Overwatch. Overwatch and Blizzard is Blizzard
Entertainment, Inc. trademarks or registered trademarks. Overwatch © Blizzard Entertainment, Inc.

The copyright of part of the data content generated in it belongs to Blizzard Entertainment, and the OWER project is
only used for learning and communication, and shall not be used for commercial purposes.

In addition, Blizzard may adjust the access rules or data format of the data source webpage at any time, and the project
does not guarantee immediate updates.

We do not guarantee uptime, response time or support. Your use of this item is at your own risk.

# license

Copyright (c) 2023, KINDYEAR. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
following conditions are met:

- Redistributions of source code must retain the above copyright notice, this list of conditions and the following
  disclaimer.

- Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following
  disclaimer in the documentation and/or other materials provided with the distribution.

- Neither the name of OWER nor the names of its contributors may be used to endorse or promote products derived from
  this software without prior written permission.

This software is provided "as is" by the copyright owners and contributors without warranty of any kind, either express
or implied, including, but not limited to, the implied warranties of merchantability and fitness for a particular
purpose. IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, THE ACQUISITION OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION ) shall be liable in any way and on any theory of
liability, whether in contract, strict liability or tort (including negligence or otherwise), arising out of the use of
the software, even if advised of the possibility of such damages.