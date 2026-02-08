# 马里奥我的世界游戏 - AI 绘图提示词文档

本文档整理了游戏中所有角色、敌人、方块和环境元素的详细描述，以及适用于 Google Imagen 3 的 AI 绘图提示词。

---

## 目录
- [主角 - Steve](#主角---steve)
- [敌人角色](#敌人角色)
- [生物群系环境](#生物群系环境)
- [方块和装饰物](#方块和装饰物)
- [物品和道具](#物品和道具)

---

## 主角 - Steve

### 当前设计
**颜色配置**：
- 上衣：青色 (#00AAAA)
- 裤子：深蓝色 (#0000AA)
- 皮肤：浅肤色 (#F5BCA9)
- 头发：深棕色 (#4A332A)
- 眼睛：黑色 (#000000)
- 武器：灰色剑 (#888888)

**尺寸**：26x52 像素（宽x高）

### AI 绘图提示词

```
Minecraft Steve character, pixel art style, blocky cubic design,
wearing cyan t-shirt and dark blue pants, light tan skin tone,
dark brown hair, simple black dot eyes, holding gray diamond sword,
standing pose, front view, 8-bit retro game aesthetic,
clean pixel borders, Minecraft official art style,
white background, character sprite sheet ready
```

**中文提示词**：
```
我的世界史蒂夫角色，像素艺术风格，方块立方体设计，
穿着青色T恤和深蓝色裤子，浅棕色皮肤，
深棕色头发，简单的黑点眼睛，手持灰色钻石剑，
站立姿势，正面视图，8位复古游戏美学，
清晰的像素边框，我的世界官方艺术风格，
白色背景，角色精灵图准备
```

---

## 敌人角色

### 1. 僵尸 (Zombie)

**当前设计**：
- 头部：绿色 (#4CAF50)，带深绿色纹理 (#2E7D32)
- 上衣：青蓝色 (#2E7D9A)
- 裤子：紫色 (#5E35B1)
- 眼睛：深灰色 (#1B1B1B)
- 嘴巴：灰色 (#2B2B2B)
- 尺寸：32x48 像素
- 属性：生命值 20，速度 0.55，伤害 10

**AI 绘图提示词**：
```
Minecraft zombie character, pixel art style, blocky design,
green rotting skin with darker green patches, wearing tattered cyan shirt,
purple torn pants, dark hollow eyes, simple mouth line,
menacing pose, arms extended forward, front view,
8-bit retro game style, clean pixel art, Minecraft aesthetic,
transparent background, game sprite ready
```

---

### 2. 苦力怕 (Creeper)

**当前设计**：
- 主体：亮绿色 (#3AAE2A)
- 纹理：深绿色 (#2E7D32)
- 特征：四条腿，方形头部，像素化面部表情
- 尺寸：32x48 像素
- 属性：生命值 20，速度 0.4，伤害 40（爆炸）

**AI 绘图提示词**：
```
Minecraft Creeper mob, pixel art style, bright green blocky body,
darker green texture patches, iconic sad face pattern,
four short legs, square head, no arms, standing pose,
front view, 8-bit retro game aesthetic, clean pixel borders,
Minecraft official art style, transparent background,
explosive enemy character sprite
```

---

### 3. 蜘蛛 (Spider)

**当前设计**：
- 身体：深黑色 (#1B1B1B)
- 背部：灰黑色 (#2B2B2B)
- 眼睛：红色 (#D50000)
- 腿：8条黑色细腿
- 尺寸：44x24 像素（宽扁型）
- 属性：生命值 16，速度 1.2，伤害 8

**AI 绘图提示词**：
```
Minecraft spider mob, pixel art style, dark black blocky body,
gray-black back section, glowing red eyes, eight thin black legs,
wide flat body shape, menacing crawling pose, front view,
8-bit retro game style, clean pixel art, Minecraft aesthetic,
transparent background, hostile mob sprite
```

---

### 4. 骷髅 (Skeleton)

**当前设计**：
- 骨骼：浅灰色 (#E0E0E0)
- 身体：银灰色 (#D6D6D6)
- 肋骨细节：中灰色 (#BDBDBD)
- 眼睛：黑色 (#111111)
- 武器：弓箭
- 尺寸：32x48 像素
- 属性：生命值 15，速度 0.5，伤害 12（远程）

**AI 绘图提示词**：
```
Minecraft skeleton mob, pixel art style, light gray bone structure,
silver-gray body with darker gray rib details, black hollow eye sockets,
holding bow and arrow, standing pose, front view,
8-bit retro game aesthetic, clean pixel borders,
Minecraft official art style, transparent background,
undead archer enemy sprite
```

---

### 5. 末影人 (Enderman)

**当前设计**：
- 身体：深黑色 (#0B0B0B)
- 眼睛：紫色 (#AA00FF)
- 特征：细长身体，长臂长腿
- 尺寸：32x64 像素（高瘦型）
- 属性：生命值 40，速度 1.4，伤害 25（传送攻击）

**AI 绘图提示词**：
```
Minecraft Enderman mob, pixel art style, tall slender black body,
glowing purple eyes, very long arms and legs, thin blocky design,
mysterious standing pose, front view, 8-bit retro game style,
clean pixel art, Minecraft aesthetic, transparent background,
teleporting enemy character sprite, intimidating presence
```

---

### 6. 猪灵 (Piglin)

**当前设计**：
- 皮肤：棕褐色 (#C68642)
- 特征：猪鼻子，金色装饰
- 尺寸：32x52 像素
- 属性：生命值 60，速度 1.1，伤害 20

**AI 绘图提示词**：
```
Minecraft Piglin mob, pixel art style, tan-brown pig-like skin,
golden armor pieces, pig snout nose, pointed ears,
holding golden sword, aggressive stance, front view,
8-bit retro game aesthetic, clean pixel borders,
Minecraft Nether mob style, transparent background,
warrior enemy sprite
```

---

### 7. 末影龙 (Ender Dragon) - BOSS

**当前设计**：
- 身体：黑色 (#000000)
- 特征：巨大龙形，翅膀，紫色能量
- 尺寸：120x60 像素（超大型）
- 属性：生命值 200，速度 1.5，伤害 30

**AI 绘图提示词**：
```
Minecraft Ender Dragon boss, pixel art style, massive black dragon body,
large wings spread, purple energy particles, fierce dragon head,
long tail, intimidating flying pose, side view,
8-bit retro game aesthetic, clean pixel borders,
Minecraft End dimension boss style, transparent background,
epic final boss character sprite, dramatic presence
```

---

## 生物群系环境

### 1. 森林 (Forest)

**当前设计**：
- 天空颜色：浅绿色 (#88CC88)
- 地面：草地 (#4CAF50)
- 装饰：橡树、桦树、暗橡树、灌木、花朵、蘑菇、藤蔓
- 天气：晴天、雨天、雾天

**AI 绘图提示词**：
```
Minecraft forest biome background, pixel art style,
light green sky, lush grass ground blocks, oak and birch trees,
colorful flowers, mushrooms, hanging vines, bushes,
layered parallax mountains in background, white clouds,
golden sun in corner, 8-bit retro game aesthetic,
clean pixel borders, Minecraft landscape style,
horizontal scrolling game background
```

---

### 2. 雪地 (Snow)

**当前设计**：
- 天空颜色：浅蓝色 (#CCE6FF)
- 地面：雪地 (#FFFFFF)
- 装饰：云杉树、冰刺、雪堆、冰块
- 粒子效果：雪花
- 天气：下雪

**AI 绘图提示词**：
```
Minecraft snow biome background, pixel art style,
light blue winter sky, white snow-covered ground blocks,
spruce pine trees, ice spikes, snow piles, ice blocks,
falling snowflake particles, layered snowy mountains,
white clouds, cold atmosphere, 8-bit retro game aesthetic,
clean pixel borders, Minecraft winter landscape,
horizontal scrolling game background
```

---

### 3. 沙漠 (Desert)

**当前设计**：
- 天空颜色：暖黄色 (#FFEECC)
- 地面：沙子 (#FDD835)
- 装饰：仙人掌、枯木、岩石、骨头
- 粒子效果：沙尘
- 天气：晴天、沙尘暴

**AI 绘图提示词**：
```
Minecraft desert biome background, pixel art style,
warm yellow-cream sky, golden sand ground blocks,
tall cacti, dead bushes, scattered rocks, bone remains,
dust particles, heat wave effect, layered sandy dunes,
bright sun, 8-bit retro game aesthetic, clean pixel borders,
Minecraft arid landscape style, horizontal scrolling game background
```

---

### 4. 山地/洞穴 (Mountain/Cave)

**当前设计**：
- 天空颜色：深灰蓝 (#666688)
- 地面：石头 (#757575)
- 装饰：煤矿、铁矿、金矿、钻石矿、钟乳石、水晶、岩浆池
- 粒子效果：闪光
- 环境：黑暗（30%暗度）

**AI 绘图提示词**：
```
Minecraft mountain cave biome background, pixel art style,
dark gray-blue sky, stone gray ground blocks,
coal ore, iron ore, gold ore, diamond ore veins,
stalactites hanging, glowing crystals, lava pools,
sparkle particles, layered rocky mountains, dim lighting,
8-bit retro game aesthetic, clean pixel borders,
Minecraft underground cave style, horizontal scrolling game background
```

---

### 5. 海滨 (Ocean/Beach)

**当前设计**：
- 天空颜色：浅蓝色 (#AAD4F5)
- 地面：沙滩 (#2196F3)
- 装饰：棕榈树、贝壳、海星、海草、小船
- 粒子效果：气泡
- 特殊：水位线

**AI 绘图提示词**：
```
Minecraft ocean beach biome background, pixel art style,
light blue sky, sandy beach ground, blue water surface,
palm trees, seashells, starfish, seaweed, wooden boat,
bubble particles, layered ocean waves, white clouds,
tropical atmosphere, 8-bit retro game aesthetic,
clean pixel borders, Minecraft coastal landscape,
horizontal scrolling game background
```

---

### 6. 地狱 (Nether)

**当前设计**：
- 天空颜色：深红色 (#CC3333)
- 地面：地狱岩 (#8B0000)
- 装饰：岩浆池、火焰、灵魂沙、地狱疣、玄武岩、岩浆瀑布
- 粒子效果：火焰
- 环境：持续伤害

**AI 绘图提示词**：
```
Minecraft Nether dimension background, pixel art style,
dark red hellish sky, crimson netherrack ground blocks,
lava pools, fire flames, soul sand patches, nether wart,
basalt columns, lava waterfalls, flame particles,
layered hellish landscape, ominous atmosphere,
8-bit retro game aesthetic, clean pixel borders,
Minecraft underworld style, horizontal scrolling game background
```

---

## 方块和装饰物

### 地面方块

#### 1. 草地方块 (Grass Block)
**颜色**：
- 土壤：棕色 (#5D4037)
- 草面：绿色 (#4CAF50)
- 边缘：深棕 (#3E2723)

**AI 绘图提示词**：
```
Minecraft grass block, pixel art style, cubic block shape,
brown dirt sides, bright green grass top surface,
darker brown edges, simple texture, front isometric view,
8-bit retro game aesthetic, clean pixel borders,
Minecraft block style, transparent background
```

---

#### 2. 雪地方块 (Snow Block)
**颜色**：
- 主体：白色 (#FFFFFF)
- 阴影：浅灰 (#E0E0E0)

**AI 绘图提示词**：
```
Minecraft snow block, pixel art style, cubic block shape,
pure white snow surface, light gray shadows,
simple clean texture, front isometric view,
8-bit retro game aesthetic, clean pixel borders,
Minecraft winter block style, transparent background
```

---

#### 3. 沙子方块 (Sand Block)
**颜色**：
- 主体：金黄色 (#FDD835)
- 纹理：浅黄 (#FFF59D)

**AI 绘图提示词**：
```
Minecraft sand block, pixel art style, cubic block shape,
golden yellow sand surface, lighter yellow texture spots,
grainy appearance, front isometric view,
8-bit retro game aesthetic, clean pixel borders,
Minecraft desert block style, transparent background
```

---

#### 4. 石头方块 (Stone Block)
**颜色**：
- 主体：灰色 (#757575)
- 纹理：深灰 (#616161)

**AI 绘图提示词**：
```
Minecraft stone block, pixel art style, cubic block shape,
medium gray stone surface, darker gray texture cracks,
rough rocky appearance, front isometric view,
8-bit retro game aesthetic, clean pixel borders,
Minecraft cave block style, transparent background
```

---

#### 5. 地狱岩方块 (Netherrack Block)
**颜色**：
- 主体：深红色 (#8B0000)
- 纹理：暗红 (#5D0000)

**AI 绘图提示词**：
```
Minecraft netherrack block, pixel art style, cubic block shape,
dark crimson red surface, darker red texture spots,
hellish rough appearance, front isometric view,
8-bit retro game aesthetic, clean pixel borders,
Minecraft Nether block style, transparent background
```

---

### 装饰物

#### 1. 橡树 (Oak Tree)
**颜色**：
- 树干：棕色 (#795548)
- 树叶：绿色 (#4CAF50)

**AI 绘图提示词**：
```
Minecraft oak tree, pixel art style, blocky design,
brown trunk blocks, green leafy crown, cubic foliage,
simple tree shape, side view, 8-bit retro game aesthetic,
clean pixel borders, Minecraft forest decoration,
transparent background, game environment sprite
```

---

#### 2. 仙人掌 (Cactus)
**颜色**：
- 主体：深绿色 (#2E7D32)
- 刺：黄色点缀

**AI 绘图提示词**：
```
Minecraft cactus plant, pixel art style, blocky tall design,
dark green cactus body, yellow spike details,
segmented vertical blocks, side view,
8-bit retro game aesthetic, clean pixel borders,
Minecraft desert decoration, transparent background,
game environment sprite
```

---

#### 3. 宝箱 (Chest)
**颜色**：
- 箱体：棕色 (#795548)
- 边框：深棕 (#3E2723)
- 锁扣：金色 (#FFD700)

**AI 绘图提示词**：
```
Minecraft chest, pixel art style, cubic wooden box,
brown wood texture, dark brown edges, golden lock clasp,
closed state, front view, 8-bit retro game aesthetic,
clean pixel borders, Minecraft loot container style,
transparent background, game item sprite
```

---

#### 4. 矿石 (Ores)

**钻石矿 (Diamond Ore)**：
```
Minecraft diamond ore block, pixel art style, cubic block,
gray stone base, bright cyan diamond crystals embedded,
sparkling appearance, front isometric view,
8-bit retro game aesthetic, clean pixel borders,
Minecraft valuable ore style, transparent background
```

**金矿 (Gold Ore)**：
```
Minecraft gold ore block, pixel art style, cubic block,
gray stone base, golden yellow ore veins embedded,
shiny appearance, front isometric view,
8-bit retro game aesthetic, clean pixel borders,
Minecraft precious ore style, transparent background
```

**铁矿 (Iron Ore)**：
```
Minecraft iron ore block, pixel art style, cubic block,
gray stone base, beige-tan iron ore spots embedded,
metallic appearance, front isometric view,
8-bit retro game aesthetic, clean pixel borders,
Minecraft common ore style, transparent background
```

---

## 物品和道具

### 武器

#### 1. 木剑 (Wooden Sword)
**颜色**：棕色 (#8D6E63)

**AI 绘图提示词**：
```
Minecraft wooden sword, pixel art style, simple sword shape,
brown wood texture, basic starter weapon, flat 2D design,
8-bit retro game aesthetic, clean pixel borders,
Minecraft weapon item style, transparent background,
inventory icon ready
```

---

#### 2. 石剑 (Stone Sword)
**颜色**：灰色 (#757575)

**AI 绘图提示词**：
```
Minecraft stone sword, pixel art style, simple sword shape,
gray stone texture, basic weapon, flat 2D design,
8-bit retro game aesthetic, clean pixel borders,
Minecraft weapon item style, transparent background,
inventory icon ready
```

---

#### 3. 铁剑 (Iron Sword)
**颜色**：银灰色 (#BDBDBD)

**AI 绘图提示词**：
```
Minecraft iron sword, pixel art style, simple sword shape,
silver-gray metal texture, intermediate weapon, flat 2D design,
8-bit retro game aesthetic, clean pixel borders,
Minecraft weapon item style, transparent background,
inventory icon ready
```

---

#### 4. 钻石剑 (Diamond Sword)
**颜色**：青色 (#00BCD4)

**AI 绘图提示词**：
```
Minecraft diamond sword, pixel art style, simple sword shape,
bright cyan diamond texture, powerful weapon, flat 2D design,
sparkling appearance, 8-bit retro game aesthetic,
clean pixel borders, Minecraft legendary weapon style,
transparent background, inventory icon ready
```

---

### 食物和恢复道具

#### 1. 苹果 (Apple)
**颜色**：红色 (#F44336)

**AI 绘图提示词**：
```
Minecraft apple, pixel art style, simple round apple shape,
bright red color, small green leaf on top, flat 2D design,
8-bit retro game aesthetic, clean pixel borders,
Minecraft food item style, transparent background,
inventory icon ready, health restoration item
```

---

#### 2. 面包 (Bread)
**颜色**：棕黄色 (#D4A574)

**AI 绘图提示词**：
```
Minecraft bread loaf, pixel art style, simple bread shape,
tan-brown color, rectangular loaf design, flat 2D design,
8-bit retro game aesthetic, clean pixel borders,
Minecraft food item style, transparent background,
inventory icon ready, hunger restoration item
```

---

#### 3. 金苹果 (Golden Apple)
**颜色**：金色 (#FFD700)

**AI 绘图提示词**：
```
Minecraft golden apple, pixel art style, apple shape,
shiny golden color, magical glow effect, small green leaf,
flat 2D design, 8-bit retro game aesthetic,
clean pixel borders, Minecraft rare food item style,
transparent background, inventory icon ready,
powerful healing item with sparkles
```

---

### 特殊道具

#### 1. 末影珍珠 (Ender Pearl)
**颜色**：紫色 (#9C27B0)

**AI 绘图提示词**：
```
Minecraft ender pearl, pixel art style, spherical pearl shape,
glowing purple color, magical particle effect, flat 2D design,
8-bit retro game aesthetic, clean pixel borders,
Minecraft teleportation item style, transparent background,
inventory icon ready, mystical appearance
```

---

#### 2. 钻石 (Diamond)
**颜色**：青色 (#00BCD4)

**AI 绘图提示词**：
```
Minecraft diamond gem, pixel art style, geometric crystal shape,
bright cyan color, sparkling facets, flat 2D design,
8-bit retro game aesthetic, clean pixel borders,
Minecraft precious gem style, transparent background,
inventory icon ready, valuable resource
```

---

## 使用说明

### 针对 Google Imagen 3 的优化建议

1. **保持简洁**：Imagen 3 对简洁明确的提示词响应更好
2. **强调风格**：始终包含 "pixel art style" 和 "8-bit retro game aesthetic"
3. **指定视角**：明确说明 "front view"、"side view" 或 "isometric view"
4. **背景要求**：使用 "transparent background" 或 "white background"
5. **尺寸提示**：可以添加 "16x16 pixels" 或 "32x32 pixels" 等具体尺寸

### 批量生成建议

1. **角色系列**：先生成主角和主要敌人
2. **环境系列**：按生物群系顺序生成背景
3. **方块系列**：按材质类型批量生成
4. **道具系列**：按功能分类生成

### 后期处理

生成后可能需要：
- 调整像素对齐
- 统一色板
- 添加透明背景
- 调整尺寸比例

---

## 版本信息

- **文档版本**：1.0
- **游戏版本**：1.2.15
- **创建日期**：2026-02-08
- **AI 模型**：适配 Google Imagen 3

---

## 附录：颜色参考表

| 元素 | 主色 | 辅色 | 用途 |
|------|------|------|------|
| Steve | #00AAAA | #0000AA | 主角服装 |
| 僵尸 | #4CAF50 | #2E7D32 | 敌人皮肤 |
| 苦力怕 | #3AAE2A | #2E7D32 | 敌人身体 |
| 蜘蛛 | #1B1B1B | #D50000 | 身体/眼睛 |
| 骷髅 | #E0E0E0 | #111111 | 骨骼/眼睛 |
| 末影人 | #0B0B0B | #AA00FF | 身体/眼睛 |
| 森林 | #88CC88 | #4CAF50 | 天空/地面 |
| 雪地 | #CCE6FF | #FFFFFF | 天空/地面 |
| 沙漠 | #FFEECC | #FDD835 | 天空/地面 |
| 山地 | #666688 | #757575 | 天空/地面 |
| 海滨 | #AAD4F5 | #2196F3 | 天空/水面 |
| 地狱 | #CC3333 | #8B0000 | 天空/地面 |

---

**注意**：所有提示词均为建议性质，实际生成效果可能因 AI 模型版本和参数设置而异。建议进行多次迭代和微调以获得最佳效果。
