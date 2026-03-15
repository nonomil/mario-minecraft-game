# Words 词库内容盘点与重复扫描报告

## 数据总览
- 扫描文件总数: 140
- 主词库文件: 18
- _archive 文件: 122
- 提取的唯一词条总数: 10350
- 重复词条总数: 7763

## 目录层级词条提取量（基于 word/chinese/english 字段）
- 01_幼儿园: 1690
- 03_小学_高年级: 2304
- 04_我的世界: 2594
- 05_初中: 6610
- 06_汉字: 800
- 07_拼音: 1014
- 08_幼小衔接: 0
- _archive: 46279

## _archive 覆盖情况
- 仅在 _archive 出现的词条: 2411
- 仅在主词库出现的词条: 3496
- 主词库与 _archive 同时出现: 4443

## 重复词条 Top 30（按覆盖文件数）
- light (56 files)
- red (55 files)
- blue (53 files)
- 红色 (52 files)
- dark (51 files)
- 蓝色 (51 files)
- day (50 files)
- strong (50 files)
- weak (50 files)
- egg (49 files)
- chest (48 files)
- green (48 files)
- teacher (48 files)
- heavy (47 files)
- morning (47 files)
- rabbit (47 files)
- 鸡蛋 (47 files)
- hospital (46 files)
- night (46 files)
- sleep (46 files)
- tomorrow (46 files)
- train (46 files)
- yellow (46 files)
- 一 (46 files)
- boat (45 files)
- snow (45 files)
- 绿色 (45 files)
- elephant (44 files)
- library (44 files)
- spider (44 files)

## 幼儿园词库复杂词候选（规则: 多词短语 / 长度>=8）
- afternoon
- airplane
- alphabet chart
- art easel
- baby animal
- backpack
- backward
- balance scale
- bead maze
- beautiful
- blackboard
- bookshelf
- bow tie
- broccoli
- brush teeth
- building blocks
- butterfly
- calendar
- cardigan
- cash register
- change clothes
- classmate
- classroom
- coloring book
- comb hair
- computer
- confused
- construction paper
- coordinates
- countryside
- crayon box
- crescent
- crocodile
- cucumber
- cylinder
- dangerous
- dinosaur
- doctor kit
- dollhouse
- dress-up clothes
- dumpling
- durability
- earmuffs
- eat lunch
- eighteen
- elephant
- environment
- excuse me
- experience
- farm animal
- finger paint
- firefighter
- forehead
- fourteen
- friendly
- glue stick
- good morning
- good night
- grandfather
- grandmother

## 结论与建议
- _archive 含有大量重复词条，但仍存在数千个仅在 _archive 出现的词条，后续重组前需要确认是否迁移。
- 08_幼小衔接 词库当前为生成型结构，基于简单字段扫描可能低估数量，必要时需补充专用解析器。
- 幼儿园复杂词候选可作为迁移到小学阶段的初筛清单，后续需结合年龄认知与教学目标再做人工筛选。
