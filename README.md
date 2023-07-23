# OWER-API

OWER API是用于获取Overwatch（守望先锋）国际服玩家数据的一个API程序

数据来源于[Overwatch官方网站](https://overwatch.blizzard.com/en-us/career)

# 部署及使用

## 部署

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

## API文档

API路径为：``http(s)://yourdomain.com:port/v1/api/xxxx``

其中将xxxx替换为你要请求的路由接口

### 全局参数

``apiKey``：必需，用于认证访问API的访问密钥。可在``项目目录/config/config.js``中修改

### API端点

#### 获取玩家基础生涯信息

- URL：``/v1/api/PlayerInfo/{playerTag}``
- 方法：``GET``
- 参数：``{playerTag}``：必需，玩家的BattleTag（战网ID），例如：``KINDYEAR-1336``，将``#``替换为``-``
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

#### 获取玩家快速游戏信息（未完成）

- URL：`/v1/api/playerQuickInfo/{playerTag}`
- 方法：``GET``
- 参数：``{playerTag}``：必需，玩家的BattleTag（战网ID），例如：``KINDYEAR-1336``，将``#``替换为``-``
- 响应

```json
null
```

数据解释：

#### 获取玩家竞技游戏信息（未完成）

- URL：`/v1/api/playerCompetitiveInfo/{playerTag}`
- 方法：``GET``
- 参数：``{playerTag}``：必需，玩家的BattleTag（战网ID），例如：``KINDYEAR-1336``，将``#``替换为``-``
- 响应

```json
null
```

数据解释：

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