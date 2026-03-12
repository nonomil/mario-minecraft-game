const HANZI_SIMILAR_GROUPS = [
  ["日", "目", "白", "田"],
  ["木", "本", "末", "未", "林", "树"],
  ["人", "入", "八", "大", "天"],
  ["土", "士", "干", "千"],
  ["口", "中", "回", "因", "园"],
  ["水", "河", "湖", "海", "洗", "清", "浅", "深", "浪", "消", "混", "露"],
  ["火", "灯", "光", "烟"],
  ["女", "妈", "奶", "妹", "男"],
  ["马", "牛", "羊", "鸟", "鱼", "虫", "狗", "猫"],
  ["说", "话", "讲", "问", "告", "论", "计", "示"],
  ["手", "指", "打", "推", "投"],
  ["走", "路", "进", "退", "追"],
  ["心", "忙", "恨", "悲", "忧", "怒", "感", "急", "想"],
  ["学", "书", "文", "字", "语", "读", "写"],
  ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"],
  ["上", "下", "左", "右", "中", "东", "西", "南", "北", "前", "后"],
  ["日", "月", "年", "早", "晚", "时", "今", "明", "昨"],
  ["山", "石", "田", "河", "海", "风", "雨", "云", "雪"],
  ["米", "面", "饭", "果", "菜", "茶", "豆", "麦"],
  ["红", "黄", "绿", "白", "黑", "色"],
  ["手", "足", "口", "眼", "耳", "头", "心", "牙"],
  ["车", "门", "桥", "船", "屋", "家"]
];

const PICTOGRAPHS = new Set([
  "日", "月", "山", "水", "火", "木", "田", "口", "人",
  "马", "牛", "鸟", "鱼", "云", "雨"
]);

function buildHanziRelations(groups) {
  const relations = {};
  for (const group of groups) {
    for (const char of group) {
      if (!relations[char]) {
        relations[char] = { similar: new Set(), pictograph: false };
      }
      for (const peer of group) {
        if (peer !== char) relations[char].similar.add(peer);
      }
    }
  }

  for (const [char, relation] of Object.entries(relations)) {
    relation.pictograph = PICTOGRAPHS.has(char);
    relation.similar = Array.from(relation.similar).slice(0, 8);
  }

  return relations;
}

const HANZI_RELATIONS = buildHanziRelations(HANZI_SIMILAR_GROUPS);
