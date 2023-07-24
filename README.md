# OWER-API

OWER API是用于获取Overwatch2（守望先锋2）国际服玩家生涯数据的一个API程序

数据来源于[Overwatch官方网站](https://overwatch.blizzard.com/en-us/career)

# 部署

要求：NodeJS V18.15.0（此版本上正常运行，其他版本未做测试）

端口默认为``16524``

> 注意：由于中国大陆的网络环境，国际服的数据获取速度可能会很慢，甚至无法获取，所以建议在国外的服务器上部署

确保部署主机上已经安装了Git，并在准备部署的目录下执行以下命令：

```bash
git clone https://github.com/kindyear/OWER-API.git
```

然后运行项目

```bash
node app.js
```

不建议将端口设置为80或者其它常用端口，防止和已有服务，例如Nginx或者Apache等服务冲突，你可以使用反向代理功能将其代理到80端口或者其它你想设置的端口上

# API文档

API路径为：``http(s)://yourdomain.com:port/v1/api/xxxx``

其中将xxxx替换为你要请求的路由接口

## 全局参数

``apiKey``：必需，用于认证访问API的访问密钥。可在``项目目录/config/config.js``中修改

`playerTag`：必需，玩家的BattleTag（战网ID），例如：``KINDYEAR-1336``，将``#``替换为``-``

## API端点

### 获取玩家基础生涯信息

- URL：``/v1/api/PlayerInfo?{playerTag}&{apiKey}``
- 方法：``GET``
- 响应

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

数据解释：

* ``playerBaseInfo``：玩家基础信息
    * ``playerTag``：玩家的BattleTag（战网ID）
    * ``playerName``：玩家的昵称
    * ``playerTitle``：玩家的头衔
    * ``playerIcon``：玩家的头像
    * ``endorsementLevel``：玩家的赞赏等级
* ``playerCompetitiveInfo``：玩家的竞技比赛信息
    * ``PC``：玩家的PC端竞技比赛信息
        * ``Tank``：玩家的坦克信息
            * ``playerCompetitivePCTank``：玩家的坦克段位
            * ``playerCompetitivePCTankTier``：玩家的坦克段位等级
        * ``Damage``：玩家的输出信息
            * ``playerCompetitivePCDamage``：玩家的输出段位
            * ``playerCompetitivePCDamageTier``：玩家的输出段位等级
        * ``Support``：玩家的辅助信息
            * ``playerCompetitivePCSupport``：玩家的辅助段位
            * ``playerCompetitivePCSupportTier``：玩家的辅助段位等级
* ``currentTime``：当前时间戳

> 别问为什么没有主机，问就是没有玩主机的朋友和懒得做主机

### PC平台端口数据

#### 获取玩家快速游戏排行信息

- URL：`/v1/api/playerPCQuickInfo?{playerTag}&{apiKey}&{type}`

- 方法：``GET``

- 参数：`{type}`：必需，请求的排行榜类型，具体参数以解释如下

  |       `type`类型        |       解释说明        |
      | :---------------------: | :-------------------: |
  |      `time-played`      |     角色游戏时间      |
  |       `games-won`       |     角色胜利场数      |
  |    `weapon-accuracy`    |    角色武器命中率     |
  | `eliminations-per-life` | 角色击杀数 / 每条生命 |
  | `critical-hit-accuracy` |      角色暴击率       |
  |    `multikill-best`     |   角色最多单次消灭    |
  |    `objective-kills`    |   角色目标点内击杀    |

  注释：其中目标点内击杀为玩家在目标内/附近击杀的玩家总数，包含运载目标或者目标点。此外数据排列格式为由多到少排列，具体可看响应

- 响应

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
            "heroName": "Pharah",
            "heroData": "34%"
        },
        {
            "heroName": "Winston",
            "heroData": "34%"
        },
        {
            "heroName": "Wrecking Ball",
            "heroData": "32%"
        },
        {
            "heroName": "Mercy",
            "heroData": "32%"
        },
        {
            "heroName": "Widowmaker",
            "heroData": "31%"
        },
        {
            "heroName": "Baptiste",
            "heroData": "31%"
        },
        {
            "heroName": "Cassidy",
            "heroData": "30%"
        },
        {
            "heroName": "Zarya",
            "heroData": "30%"
        },
        {
            "heroName": "Soldier: 76",
            "heroData": "30%"
        },
        {
            "heroName": "Junker Queen",
            "heroData": "30%"
        },
        {
            "heroName": "Symmetra",
            "heroData": "28%"
        },
        {
            "heroName": "Orisa",
            "heroData": "27%"
        },
        {
            "heroName": "Kiriko",
            "heroData": "27%"
        },
        {
            "heroName": "Hanzo",
            "heroData": "27%"
        },
        {
            "heroName": "Zenyatta",
            "heroData": "26%"
        },
        {
            "heroName": "Bastion",
            "heroData": "26%"
        },
        {
            "heroName": "Ashe",
            "heroData": "25%"
        },
        {
            "heroName": "Reaper",
            "heroData": "24%"
        },
        {
            "heroName": "Lifeweaver",
            "heroData": "22%"
        },
        {
            "heroName": "Echo",
            "heroData": "22%"
        },
        {
            "heroName": "D.Va",
            "heroData": "22%"
        },
        {
            "heroName": "Junkrat",
            "heroData": "22%"
        },
        {
            "heroName": "Doomfist",
            "heroData": "22%"
        },
        {
            "heroName": "Lúcio",
            "heroData": "20%"
        },
        {
            "heroName": "Ramattra",
            "heroData": "20%"
        },
        {
            "heroName": "Tracer",
            "heroData": "19%"
        },
        {
            "heroName": "Genji",
            "heroData": "16%"
        },
        {
            "heroName": "Ana",
            "heroData": "14%"
        },
        {
            "heroName": "Reinhardt",
            "heroData": "0"
        },
        {
            "heroName": "Sombra",
            "heroData": "0"
        },
        {
            "heroName": "Brigitte",
            "heroData": "0"
        },
        {
            "heroName": "Moira",
            "heroData": "0"
        }
    ],
    "currentTime": 1690184120150
}
```

数据解释：

* ``playerTag``：玩家的BattleTag（战网ID）
* ``gameMode``：游戏模式（分为`quickPlay`快速模式和`competitive`竞技模式）
* ``type``：请求的数据排行类型
* ``heroRankings``：英雄排行数据
    * ``heroName``：英雄名称
    * ``heroData``：英雄数据
    * ........
* ``currentTime``：当前时间戳

#### 获取玩家竞技游戏排行信息

- URL：`/v1/api/playerPCCompetitiveInfo?{playerTag}&{apiKey}&{type}`

- 方法：``GET``

- 参数：`{type}`：必需，请求的排行榜类型，具体参数以解释如下

  |       `type`类型        |         解释说明         |
      | :---------------------: | :----------------------: |
  |      `time-played`      |       角色游戏时间       |
  |       `games-won`       |       角色胜利场数       |
  |    `weapon-accuracy`    |      角色武器命中率      |
  |    `win-percentage`     | 角色胜率（竞技模式独有） |
  | `eliminations-per-life` |  角色击杀数 / 每条生命   |
  | `critical-hit-accuracy` |        角色暴击率        |
  |    `multikill-best`     |     角色最多单次消灭     |
  |    `objective-kills`    |     角色目标点内击杀     |

  注释：``win-percentage``参数为**竞技模式**
  独有，快速模式不可用其中目标点内击杀为玩家在目标内/附近击杀的玩家总数，包含运载目标或者目标点。此外数据排列格式为由多到少排列，响应和数据解释与快速游戏模式相似，这里不再复述。

### Console主机平台端口数据

别问，问就是没主机而且没有玩主机的好友而且懒，反正文件和路由还有代码留了主机部分的功能，未来有机会说不定会填坑

也欢迎fork或者提交支持主机的代码

# TODO

- [x] 玩家基础游戏信息
- [x] PC玩家快速游戏信息
- [x] PC玩家竞技游戏信息
- [ ] PC玩家快速游戏各英雄信息
- [ ] PC玩家竞技游戏各英雄信息
- [ ] 主机玩家快速游戏信息
- [ ] 主机玩家快速游戏信息

# 启发 / 感谢

> 排名不分前后

- https://zusor.io/
- Linus
- 花散里
- 低调做人

# 免责声明

OWER项目不隶属于暴雪，也不反映暴雪或任何正式参与制作或管理《守望先锋》的人的观点或意见。Overwatch 和 Blizzard 是 Blizzard
Entertainment, Inc. 的商标或注册商标。 Overwatch © Blizzard Entertainment, Inc.

其中所产生的部分数据内容版权归暴雪娱乐所有，OWER项目仅用于学习交流，不得用于商业用途。

此外，暴雪随时可能会调整数据来源网页的访问规则或者数据格式，项目不保证即时更新。

我们不保证正常运行时间、响应时间或支持。您使用此项目的风险由您自行承担。

# 许可证

Copyright (c) 2023, KINDYEAR. All rights reserved.

如果满足以下条件，则允许以源代码和二进制形式重新分发和使用，无论是否经过修改：

- 源代码的重新分发必须保留上述版权声明、此条件列表和以下免责声明。

- 以二进制形式重新分发必须在随分发提供的文档和/或其他材料中复制上述版权声明、此条件列表以及以下免责声明。

- 未经事先书面许可，OWER 的名称及其贡献者的名称均不得用于认可或推广源自本软件的产品。

本软件由版权所有者和贡献者“按原样”提供，不承担任何明示或默示的保证，包括但不限于适销性和特定用途适用性的默示保证。在任何情况下，版权持有人或贡献者均不对任何直接、间接、附带、特殊、惩戒性或后果性损害（包括但不限于采购替代商品或服务；使用、数据或利润损失；或业务中断）承担责任因使用本软件而以任何方式引起的以及基于任何责任理论的责任，无论是合同责任、严格责任还是侵权行为（包括疏忽或其他），即使已被告知可能发生此类损害。

# 碎碎念

傻逼暴雪还老子国服，草