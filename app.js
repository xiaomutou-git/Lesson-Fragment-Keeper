/* ============================================================
 * 教案碎片收纳盒 —— 应用逻辑
 * 类名：LessonBoxApp
 * 核心功能：素材录入 / 标签管理 / 拖拽排序 / 导出 Markdown / localStorage 持久化
 * 创建时间：2026-09-09
 * 运行环境：现代浏览器（Chrome / Edge / Firefox / Safari），可直接双击打开运行
 * ============================================================ */

/* ================================================================
 *  内置示例数据
 *  用途：首次启动且本地无数据时注入一批贴近真实备课场景的素材，
 *        便于演示与体验搜索、筛选、导出等完整功能。
 * ============================================================ */

const SEED_HOUR_MS = 3600 * 1000; // 1 小时的毫秒数

/**
 * 生成示例素材的时间戳（相对当前时间倒推）
 * @param {number} offsetH - 距当前时间多少小时以前
 * @returns {number} 毫秒时间戳
 */
function seedTime(offsetH) {
  return Date.now() - offsetH * SEED_HOUR_MS;
}

// 示例标签（id 固定，便于素材引用）
const SEED_TAGS = [
  { id: 's-class', name: '课堂实录' },
  { id: 's-idea', name: '教学灵感' },
  { id: 's-exercise', name: '习题积累' },
  { id: 's-quote', name: '学生金句' },
  { id: 's-plan', name: '教案要点' },
  { id: 's-ref', name: '参考素材' },
];

// 示例素材（每个标签各 10 条，内容依教师备课场景编写，含长短文本）
const SEED_FRAGMENTS = [
  // ==================== 课堂实录（10 条） ====================
  {
    id: 's-f01',
    content: '勾股定理课上，有学生问："老师，为什么一定是 a²+b²=c²，不能是 a+b=c？"\n\n我没有直接回答，让学生用方格纸剪拼验证。下课前，有两个孩子自己拼出了第二种证法。',
    tagIds: ['s-class'],
    createdAt: seedTime(0),
    updatedAt: seedTime(0),
  },
  {
    id: 's-f02',
    content: '讲分数时学生突然举手："老师，二分之一加三分之一，能直接写成五分之二吗？"\n\n我没有说不行，给他两块大小不同的月饼演示，他很快就自己否定了自己。',
    tagIds: ['s-class'],
    createdAt: seedTime(4),
    updatedAt: seedTime(4),
  },
  {
    id: 's-f03',
    content: '朗读课文时，小陈把"踱步"读成"度步"，全班笑。我顺势考了考大家："踱"为什么是足字旁？—— 借错字讲字理，错得值。',
    tagIds: ['s-class'],
    createdAt: seedTime(8),
    updatedAt: seedTime(8),
  },
  {
    id: 's-f04',
    content: '今天讲《背影》第一课时，说到"蹒跚"，有孩子接话："老师，就是老爷爷走路那种样子。"\n\n不用我解释了，孩子的语言最直接。',
    tagIds: ['s-class'],
    createdAt: seedTime(12),
    updatedAt: seedTime(12),
  },
  {
    id: 's-f05',
    content: '推导平行四边形面积时，小雅突然问：剪拼后多出来的那块为什么要丢掉？\n\n好问题——其实它没有丢，只是变成了长方形的一部分。概念串起来了。',
    tagIds: ['s-class'],
    createdAt: seedTime(16),
    updatedAt: seedTime(16),
  },
  {
    id: 's-f06',
    content: '课堂小测，小明分不清 x² 和 2x 的区别。\n\n我把两个式子抄在黑板上，让全班一起辨析：一个表示"两个 x 相乘"，一个表示"两个 x 相加"。错因比答案重要。',
    tagIds: ['s-class'],
    createdAt: seedTime(20),
    updatedAt: seedTime(20),
  },
  {
    id: 's-f07',
    content: '课后一个学生追出来问："老师，分数线上下的数，为什么一个叫分子，一个叫分母？"\n\n名字里就有答案——"分母"是把整体分成了几份，顺着名字讲了一遍来历。',
    tagIds: ['s-class'],
    createdAt: seedTime(24),
    updatedAt: seedTime(24),
  },
  {
    id: 's-f08',
    content: '作文课下课，小丽写完不肯交，说"我还能再改一版"。晚上她妈妈发消息说，小丽在家改了四稿。\n\n这种较真，值得在全班面前表扬。',
    tagIds: ['s-class'],
    createdAt: seedTime(28),
    updatedAt: seedTime(28),
  },
  {
    id: 's-f09',
    content: '复习课上，把上次的错题重新发回去，让同桌互相讲，讲不明白的举手我再讲。\n\n效果比我再讲一遍好——讲的人懂了，听的人也会了。',
    tagIds: ['s-class'],
    createdAt: seedTime(32),
    updatedAt: seedTime(32),
  },
  {
    id: 's-f10',
    content: '今天有学生带来一道"超纲题"问我，是他爸手机里刷到的。\n\n我夸他会提问，让他下课当小老师讲给全班听。会的孩子讲给不会的听，比老师讲强。',
    tagIds: ['s-class'],
    createdAt: seedTime(36),
    updatedAt: seedTime(36),
  },
  // ==================== 教学灵感（10 条） ====================
  {
    id: 's-f11',
    content: '引入"百分数"，想用"奶茶店第二杯半价"开场，先问学生：这到底是打几折？',
    tagIds: ['s-idea'],
    createdAt: seedTime(40),
    updatedAt: seedTime(40),
  },
  {
    id: 's-f12',
    content: '讲圆周率，考虑带一个呼啦圈进教室，让学生量周长和直径，自己发现 3.14。',
    tagIds: ['s-idea'],
    createdAt: seedTime(44),
    updatedAt: seedTime(44),
  },
  {
    id: 's-f13',
    content: '汉字"门"字框的字——问、间、闲、闻，可以编一个"门里有什么"的口诀课，帮低年级学生记字形。',
    tagIds: ['s-idea'],
    createdAt: seedTime(48),
    updatedAt: seedTime(48),
  },
  {
    id: 's-f14',
    content: '讲分数除法，想用"分果子"的情境：整袋花生平均分到几个盘子里，先讲含义，再讲算法。',
    tagIds: ['s-idea'],
    createdAt: seedTime(52),
    updatedAt: seedTime(52),
  },
  {
    id: 's-f15',
    content: '作文写人，让学生观察同桌三个细节：一个习惯动作、一句口头禅、一种表情。\n\n有了细节，写起来就不空洞了。',
    tagIds: ['s-idea'],
    createdAt: seedTime(56),
    updatedAt: seedTime(56),
  },
  {
    id: 's-f16',
    content: '代数式可以讲成"藏起来的数"：先猜后验。课上多问"你们觉得这个数可能是——？"，学生的兴趣就来了。',
    tagIds: ['s-idea'],
    createdAt: seedTime(60),
    updatedAt: seedTime(60),
  },
  {
    id: 's-f17',
    content: '讲对称图形，让学生带一面小镜子，把不对称的字照成对称的，比如"山""林"。动手之后印象深。',
    tagIds: ['s-idea'],
    createdAt: seedTime(64),
    updatedAt: seedTime(64),
  },
  {
    id: 's-f18',
    content: '几何复习课，把知识画成"路线图"板书：从直线到角到图形，让学生自己补分支，比背概念有用。',
    tagIds: ['s-idea'],
    createdAt: seedTime(68),
    updatedAt: seedTime(68),
  },
  {
    id: 's-f19',
    content: '练口算，设计"口算接龙"：答错要"借"前一个人的题重算。课堂气氛一下子就能调起来。',
    tagIds: ['s-idea'],
    createdAt: seedTime(72),
    updatedAt: seedTime(72),
  },
  {
    id: 's-f20',
    content: '古诗可以配"五感"任务：找出诗里的颜色、声音、气味。\n\n比单纯背诵更有画面感，学生也记得住。',
    tagIds: ['s-idea'],
    createdAt: seedTime(76),
    updatedAt: seedTime(76),
  },
  // ==================== 习题积累（10 条） ====================
  {
    id: 's-f21',
    content: '简便计算：25×12 有几种拆法？\n\n答案不唯一：25×4×3、25×10+25×2，让学生比一比哪种更妙。',
    tagIds: ['s-exercise'],
    createdAt: seedTime(80),
    updatedAt: seedTime(80),
  },
  {
    id: 's-f22',
    content: '易错题：25×4÷25×4，许多学生一股脑按"乘除先算"答 1。\n\n其实同级运算从左往右，正确答案是 16。',
    tagIds: ['s-exercise'],
    createdAt: seedTime(84),
    updatedAt: seedTime(84),
  },
  {
    id: 's-f23',
    content: '好题：用 1、3、5、7 组成的所有两位数中，最大的和与最小的差分别是多少？',
    tagIds: ['s-exercise'],
    createdAt: seedTime(88),
    updatedAt: seedTime(88),
  },
  {
    id: 's-f24',
    content: '周长与面积混淆题：长 6 宽 4 的长方形，"围一圈"和"盖满"各要多少？\n\n画图解决，让学生看清这两个概念不是一回事。',
    tagIds: ['s-exercise'],
    createdAt: seedTime(92),
    updatedAt: seedTime(92),
  },
  {
    id: 's-f25',
    content: '分数比大小：3/4 和 4/5 不让通分，问谁大？\n\n用"离 1 差多少"来比：一个差 1/4，一个差 1/5，离 1 越近越大。',
    tagIds: ['s-exercise'],
    createdAt: seedTime(96),
    updatedAt: seedTime(96),
  },
  {
    id: 's-f26',
    content: '余数问题："一个数除以 7 余 3，除以 8 余 4"，最小是多少？\n\n列单表枚举可行，适合学有余力的孩子挑战。',
    tagIds: ['s-exercise'],
    createdAt: seedTime(100),
    updatedAt: seedTime(100),
  },
  {
    id: 's-f27',
    content: '缩句练习："高大的梧桐树上挂满了金黄的叶子。"\n\n缩成"树上挂满叶子"。先找主干，再去枝叶。',
    tagIds: ['s-exercise'],
    createdAt: seedTime(104),
    updatedAt: seedTime(104),
  },
  {
    id: 's-f28',
    content: '错别字辨析："再接再厉"还是"再接再励"？\n\n"厉"本义是磨刀石，引申为磨砺，所以是"厉"不是"励"。',
    tagIds: ['s-exercise'],
    createdAt: seedTime(108),
    updatedAt: seedTime(108),
  },
  {
    id: 's-f29',
    content: '数学应用：一瓶牛奶 5 元，买四送一，买 20 瓶最少花多少？\n\n注意"送"与"折"的区别——送的那瓶是白拿，不是打折。',
    tagIds: ['s-exercise'],
    createdAt: seedTime(112),
    updatedAt: seedTime(112),
  },
  {
    id: 's-f30',
    content: '逻辑小题：甲说"不是我"，乙说"是甲"，丙说"不是我"。只有一人说真话，是谁拿了糖？',
    tagIds: ['s-exercise'],
    createdAt: seedTime(116),
    updatedAt: seedTime(116),
  },
  // ==================== 学生金句（10 条） ====================
  {
    id: 's-f31',
    content: '"老师，我把错题本当成了我的预习题，做题之前总会先看看。"\n\n下课后念给全班听，比老师讲十遍管用。',
    tagIds: ['s-quote'],
    createdAt: seedTime(120),
    updatedAt: seedTime(120),
  },
  {
    id: 's-f32',
    content: '"分数就像切披萨：分母是切了几块，分子是拿了几块。"\n\n这个讲法比我生动，以后教分数就用它开场。',
    tagIds: ['s-quote'],
    createdAt: seedTime(124),
    updatedAt: seedTime(124),
  },
  {
    id: 's-f33',
    content: '课文背不会时小胡说："老师，我不是记性差，是大脑在排队，前面的还没走。"\n\n这孩子，嘴皮子一向可以。',
    tagIds: ['s-quote'],
    createdAt: seedTime(128),
    updatedAt: seedTime(128),
  },
  {
    id: 's-f34',
    content: '"您别生气，我这次错，是为了下次不错更多。"\n\n乐观得让人没脾气，得表扬。',
    tagIds: ['s-quote'],
    createdAt: seedTime(132),
    updatedAt: seedTime(132),
  },
  {
    id: 's-f35',
    content: '讲与人相处时，小雯说："礼貌不是表演，是让别人和你在一起觉得舒服。"\n\n这觉悟，比很多大人都强。',
    tagIds: ['s-quote'],
    createdAt: seedTime(136),
    updatedAt: seedTime(136),
  },
  {
    id: 's-f36',
    content: '"老师，我爸爸说手机比书方便，可我觉得书不会叫我去刷视频。"\n\n六年级的孩子，活得明明白白。',
    tagIds: ['s-quote'],
    createdAt: seedTime(140),
    updatedAt: seedTime(140),
  },
  {
    id: 's-f37',
    content: '数学课："老师，0 是不是偶数？"\n\n问得干脆，我答得也干脆："是。"',
    tagIds: ['s-quote'],
    createdAt: seedTime(144),
    updatedAt: seedTime(144),
  },
  {
    id: 's-f38',
    content: '"我妈妈凶我的时候像老虎，笑的时候像安安。"\n\n安安是他们家的猫。孩子眼里，大人真是动物世界。',
    tagIds: ['s-quote'],
    createdAt: seedTime(148),
    updatedAt: seedTime(148),
  },
  {
    id: 's-f39',
    content: '自习课有人讲话，班长说："把说话钮关一下。"\n\n班里流传的流行语，比老师的话管用。',
    tagIds: ['s-quote'],
    createdAt: seedTime(152),
    updatedAt: seedTime(152),
  },
  {
    id: 's-f40',
    content: '"老师，长大以后，我想当您。"\n\n一线教师最值钱的一句话。',
    tagIds: ['s-quote'],
    createdAt: seedTime(156),
    updatedAt: seedTime(156),
  },
  // ==================== 教案要点（10 条） ====================
  {
    id: 's-f41',
    content: '《落花生》教学设计：以"议花生"为线索，花生品格与做人的联系，板书落点"借物喻人"。',
    tagIds: ['s-plan'],
    createdAt: seedTime(160),
    updatedAt: seedTime(160),
  },
  {
    id: 's-f42',
    content: '分数乘法单元复习课三步走：看图说意义 → 竖写算理 → 对照验算。',
    tagIds: ['s-plan'],
    createdAt: seedTime(164),
    updatedAt: seedTime(164),
  },
  {
    id: 's-f43',
    content: '小数除法教案：商的小数点要和被除数对齐。重点设计三个易错示范，先错后对。',
    tagIds: ['s-plan'],
    createdAt: seedTime(168),
    updatedAt: seedTime(168),
  },
  {
    id: 's-f44',
    content: '《草原》第二课时：抓住"一碧千里""翠色欲流"，设计演读理解画面。',
    tagIds: ['s-plan'],
    createdAt: seedTime(172),
    updatedAt: seedTime(172),
  },
  {
    id: 's-f45',
    content: '周长概念课流程：摸一摸（桌面）→ 量一量（书本）→ 算一算（相框）→ 比一比（哪个周长长）。',
    tagIds: ['s-plan'],
    createdAt: seedTime(176),
    updatedAt: seedTime(176),
  },
  {
    id: 's-f46',
    content: '面积单位授课：先建立"1 平方厘米"的手感（大拇指指甲盖），再逐级扩展，避免一上来就背公式。',
    tagIds: ['s-plan'],
    createdAt: seedTime(180),
    updatedAt: seedTime(180),
  },
  {
    id: 's-f47',
    content: '习作《我的拿手好戏》：从"动作分解"入手，一段写一个动作，先写慢动作，再串起来。',
    tagIds: ['s-plan'],
    createdAt: seedTime(184),
    updatedAt: seedTime(184),
  },
  {
    id: 's-f48',
    content: '混合运算教案：同级与异级的对比表，配两道"同一算式、不同括号位置"的对比题。',
    tagIds: ['s-plan'],
    createdAt: seedTime(188),
    updatedAt: seedTime(188),
  },
  {
    id: 's-f49',
    content: '复习比例：把比、分数、除法放进一张表里横着比较，一表打通三个概念。',
    tagIds: ['s-plan'],
    createdAt: seedTime(192),
    updatedAt: seedTime(192),
  },
  {
    id: 's-f50',
    content: '文言文初接触不逐字翻译，先学会"猜读"：看注释、看插图、猜大意，再核对。',
    tagIds: ['s-plan'],
    createdAt: seedTime(196),
    updatedAt: seedTime(196),
  },
  // ==================== 参考素材（10 条） ====================
  {
    id: 's-f51',
    content: '"教是为了不教。"——叶圣陶',
    tagIds: ['s-ref'],
    createdAt: seedTime(200),
    updatedAt: seedTime(200),
  },
  {
    id: 's-f52',
    content: '班级规则参考：错题本每周末拍照给家长看，家长签字后带回，形成一个闭环。',
    tagIds: ['s-ref'],
    createdAt: seedTime(204),
    updatedAt: seedTime(204),
  },
  {
    id: 's-f53',
    content: '《给数学老师的建议》摘录：每节课留 3 分钟"无压力提问"，专收不敢当堂问的问题。',
    tagIds: ['s-ref'],
    createdAt: seedTime(208),
    updatedAt: seedTime(208),
  },
  {
    id: 's-f54',
    content: '小步子原则也适合习惯养成：每天 10 分钟口算，比周末"补练一小时"有效。',
    tagIds: ['s-ref'],
    createdAt: seedTime(212),
    updatedAt: seedTime(212),
  },
  {
    id: 's-f55',
    content: '黑板报素材：高斯 7 岁算 1 到 100 的和，把加法变成了乘法——(1+100)×100÷2。',
    tagIds: ['s-ref'],
    createdAt: seedTime(216),
    updatedAt: seedTime(216),
  },
  {
    id: 's-f56',
    content: '家长沟通话术：以"孩子最近进步最大的一点是……"开场，比一上来挑毛病更有效。',
    tagIds: ['s-ref'],
    createdAt: seedTime(220),
    updatedAt: seedTime(220),
  },
  {
    id: 's-f57',
    content: '课外书单：李毓佩数学童话系列，适合给怕数学的孩子壮胆。',
    tagIds: ['s-ref'],
    createdAt: seedTime(224),
    updatedAt: seedTime(224),
  },
  {
    id: 's-f58',
    content: '"教育就是一棵树摇动另一棵树，一朵云推动另一朵云。"——雅思贝尔斯',
    tagIds: ['s-ref'],
    createdAt: seedTime(228),
    updatedAt: seedTime(228),
  },
  {
    id: 's-f59',
    content: '课堂公约参考：听讲时不举手不发言；别人发言时，眼睛要看着发言人。',
    tagIds: ['s-ref'],
    createdAt: seedTime(232),
    updatedAt: seedTime(232),
  },
  {
    id: 's-f60',
    content: '运动会后的小作文素材：把"冲刺"和"坚持"写进观察日记的备选方向。',
    tagIds: ['s-ref'],
    createdAt: seedTime(236),
    updatedAt: seedTime(236),
  },
];

/**
 * 教案碎片收纳盒应用主类
 *
 * 设计思路：
 *   - 全应用数据（标签、素材）集中管理，渲染层只做 "数据 -> DOM" 的同步；
 *   - 每次数据变更统一走 save() -> render()，保证展示与存储一致；
 *   - 右键/交互事件全部通过事件委托绑定，避免大量重复监听器。
 *
 * 适用场景：
 *   教师备课过程中收集零散教学素材（灵感、引文、题目、学生发言等），
 *   打标签分类、拖拽排序、一键导出 Markdown 复制到别的编辑器中。
 */
class LessonBoxApp {

  /**
   * 构造函数：初始化数据与状态，绑定事件，完成首次渲染
   * @returns {void} 无返回值
   * @throws {Error} localStorage 不可用（隐私模式/被禁用）时给出警告提示
   */
  constructor() {
    // ---- 数据 ----
    this.tags = [];           // 标签数组：[{ id, name }]
    this.fragments = [];      // 素材数组：[{ id, content, tagIds, createdAt, updatedAt }]

    // ---- 界面状态 ----
    this.filterId = 'all';        // 当前筛选项：'all' 或标签 id
    this.searchTerm = '';         // 当前搜索关键词（对内容做包含匹配，与筛选叠加）
    this.selected = new Set();    // 已勾选素材 id 集合
    this.editingId = null;        // 正在编辑的素材 id，null 表示新建模式
    this.pickerSelected = new Set(); // 录入区中选中的标签 id 集合
    this.dragId = null;           // 当前拖拽中的素材 id

    // ---- 本地存储键名 ----
    this.KEY_TAGS = 'lessonbox.tags.v1';
    this.KEY_FRAGS = 'lessonbox.fragments.v1';

    // ---- DOM 引用 ----
    this.el = {
      fragmentInput: document.getElementById('fragmentInput'),
      charCount: document.getElementById('charCount'),
      addBtn: document.getElementById('addBtn'),
      cancelEditBtn: document.getElementById('cancelEditBtn'),
      pickerTags: document.getElementById('pickerTags'),
      pickerTagNew: document.getElementById('pickerTagNew'),
      tagList: document.getElementById('tagList'),
      newTagBtn: document.getElementById('newTagBtn'),
      countAll: document.getElementById('countAll'),
      fragmentList: document.getElementById('fragmentList'),
      listTitle: document.getElementById('listTitle'),
      stat: document.getElementById('stat'),
      selectAll: document.getElementById('selectAll'),
      deleteSelectedBtn: document.getElementById('deleteSelectedBtn'),
      exportBtn: document.getElementById('exportBtn'),
      exportDataBtn: document.getElementById('exportDataBtn'),
      importDataBtn: document.getElementById('importDataBtn'),
      importFile: document.getElementById('importFile'),
      searchInput: document.getElementById('searchInput'),
      searchClear: document.getElementById('searchClear'),
      toast: document.getElementById('toast'),
      chalk: document.getElementById('chalk'),
      // 弹窗
      tagModal: document.getElementById('tagModal'),
      tagModalTitle: document.getElementById('tagModalTitle'),
      tagNameInput: document.getElementById('tagNameInput'),
      tagModalOk: document.getElementById('tagModalOk'),
      confirmModal: document.getElementById('confirmModal'),
      confirmTitle: document.getElementById('confirmTitle'),
      confirmMsg: document.getElementById('confirmMsg'),
      confirmOk: document.getElementById('confirmOk'),
      greetModal: document.getElementById('greetModal'),
      exportModal: document.getElementById('exportModal'),
      exportHint: document.getElementById('exportHint'),
      exportTextarea: document.getElementById('exportTextarea'),
      exportCopyBtn: document.getElementById('exportCopyBtn'),
      exportWordBtn: document.getElementById('exportWordBtn'),
    };

    this.bindEvents();
    this.load();
    this.seedIfFirstRun(); // 首次启动且无数据时注入演示素材
    this.render();
  }

  /* ================================================================
   *  数据持久化
   * ================================================================ */

  /**
   * 从 localStorage 读取数据并校验结构
   * @returns {void} 无返回值
   * @throws {Error} 读取到的内容 JSON 解析失败时，按「无数据」兜底处理
   */
  load() {
    try {
      const rawTags = localStorage.getItem(this.KEY_TAGS);
      const rawFrags = localStorage.getItem(this.KEY_FRAGS);
      this.tags = rawTags ? JSON.parse(rawTags) : [];
      this.fragments = rawFrags ? JSON.parse(rawFrags) : [];
      // 结构兜底：避免旧数据缺字段导致渲染报错
      if (!Array.isArray(this.tags)) this.tags = [];
      if (!Array.isArray(this.fragments)) this.fragments = [];
      this.fragments.forEach((f) => {
        if (!Array.isArray(f.tagIds)) f.tagIds = [];
      });
    } catch (err) {
      // 数据损坏时重置为空，保证页面可正常使用
      console.warn('读取本地数据失败，已重置：', err);
      this.tags = [];
      this.fragments = [];
    }
  }

  /**
   * 首次启动注入示例数据（仅当本地无任何用户数据，或现存的是旧版演示数据时执行）
   * @returns {void} 无返回值
   */
  seedIfFirstRun() {
    // 版本标记：升级示例数据时递增版本号，使已注入过旧示例的用户也能更新
    const SEED_FLAG = `lessonbox.seeded.v${this.SEED_VERSION || 2}`;
    try {
      if (this.tags.length > 0 || this.fragments.length > 0) {
        // 已有数据时：仅当现存数据全部是内置示例（s- 前缀）才升级替换，用户真实数据一律不打扰
        const allSeed =
          this.tags.every((t) => /^s-/.test(t.id)) &&
          this.fragments.length > 0 &&
          this.fragments.every((f) => /^s-f/.test(f.id));
        if (!allSeed) return;
      } else if (localStorage.getItem(SEED_FLAG)) {
        return; // 用户曾删光过数据，示例数据不再复活
      }

      // 深拷贝示例数据，避免常量被后续编辑污染
      this.tags = SEED_TAGS.map((t) => ({ ...t }));
      this.fragments = SEED_FRAGMENTS.map((f) => ({ ...f, tagIds: [...f.tagIds] }));
      this.save();
      localStorage.setItem(SEED_FLAG, '1');
    } catch (err) {
      // 存储异常（如隐私模式）时静默忽略，不影响正常使用
      console.warn('注入示例数据失败：', err);
    }
  }

  /**
   * 将当前数据写入 localStorage
   * @returns {boolean} 是否保存成功，失败时为 false（通常为隐私模式下存储不可用）
   * @throws {Error} localStorage 写入异常时被捕获并提示用户
   */
  save() {
    try {
      localStorage.setItem(this.KEY_TAGS, JSON.stringify(this.tags));
      localStorage.setItem(this.KEY_FRAGS, JSON.stringify(this.fragments));
      return true;
    } catch (err) {
      console.warn('本地存储写入失败：', err);
      this.toast('数据未能保存到本地，请检查浏览器隐私模式设置');
      return false;
    }
  }

  /* ================================================================
   *  事件绑定（统一委托）
   * ================================================================ */

  /**
   * 绑定所有交互事件
   * @returns {void} 无返回值
   */
  bindEvents() {
    const { el } = this;

    // 录入区
    el.addBtn.addEventListener('click', () => this.submitFragment());
    el.fragmentInput.addEventListener('keydown', (e) => this.onComposerKeydown(e));
    el.fragmentInput.addEventListener('input', () => this.updateCharCount());
    el.cancelEditBtn.addEventListener('click', () => this.cancelEdit());
    el.pickerTagNew.addEventListener('click', () => this.openTagModal('create'));

    // 标签栏
    el.newTagBtn.addEventListener('click', () => this.openTagModal('create'));
    el.tagList.addEventListener('click', (e) => this.onTagListClick(e));
    el.tagList.addEventListener('keydown', (e) => this.onTagListKeydown(e));

    // 素材列表（事件委托：勾选 / 编辑 / 删除 / 拖拽）
    const list = el.fragmentList;
    list.addEventListener('click', (e) => this.onListClick(e));
    list.addEventListener('change', (e) => this.onListChange(e));
    list.addEventListener('dragstart', (e) => this.onDragStart(e));
    list.addEventListener('dragover', (e) => this.onDragOver(e));
    list.addEventListener('drop', (e) => this.onDrop(e));
    list.addEventListener('dragleave', (e) => this.onDragLeave(e));
    list.addEventListener('dragend', () => this.clearDragState());

    // 列表工具
    el.selectAll.addEventListener('change', () => this.toggleSelectAll());
    el.deleteSelectedBtn.addEventListener('click', () => this.deleteSelected());
    el.exportBtn.addEventListener('click', () => this.exportMarkdown());

    // 素材搜索：输入实时重渲，清空按钮一键恢复
    el.searchInput.addEventListener('input', (e) => this.onSearchInput(e));
    el.searchClear.addEventListener('click', () => this.clearSearch());

    // 数据备份：导出 / 导入
    el.exportDataBtn.addEventListener('click', () => this.exportData());
    el.importDataBtn.addEventListener('click', () => el.importFile.click());
    el.importFile.addEventListener('change', (e) => this.importData(e));

    // 导出预览弹窗：复制当前内容
    el.exportCopyBtn.addEventListener('click', () => this.copyExport());
    el.exportWordBtn.addEventListener('click', () => this.downloadWord());

    // 弹窗
    el.tagModalOk.addEventListener('click', () => this.saveTagModal());
    // 标签名称输入框按回车直接保存
    el.tagNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.saveTagModal();
      }
    });
    el.confirmOk.addEventListener('click', () => this.confirmResolve());
    document.addEventListener('click', (e) => this.onDocClick(e));
    document.addEventListener('keydown', (e) => this.onDocKeydown(e));

    // 粉笔彩蛋
    el.chalk.addEventListener('click', () => this.openModal(el.greetModal));
  }

  /**
   * 录入区键盘事件：Ctrl/Cmd + Enter 快速收入
   * @param {KeyboardEvent} e - 键盘事件对象
   * @returns {void} 无返回值
   */
  onComposerKeydown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      this.submitFragment();
    }
  }

  /**
   * 文档级点击：点击遮罩关闭弹窗
   * @param {MouseEvent} e - 鼠标事件对象
   * @returns {void} 无返回值
   */
  onDocClick(e) {
    const closer = e.target.closest('[data-close]');
    if (closer) this.closeTopModal();
  }

  /**
   * 文档级键盘事件：Esc 关闭最上层弹窗
   * @param {KeyboardEvent} e - 键盘事件对象
   * @returns {void} 无返回值
   */
  onDocKeydown(e) {
    if (e.key === 'Escape') this.closeTopModal();
  }

  /* ================================================================
   *  渲染
   * ================================================================ */

  /**
   * 全量渲染：顶栏统计、标签栏、录入区标签选择、素材列表
   * @returns {void} 无返回值
   */
  render() {
    this.renderStat();
    this.renderTagList();
    this.renderComposerTags();
    this.renderList();
  }

  /**
   * 渲染顶栏统计信息（含素材总数、标签数、累计字数）
   * @returns {void} 无返回值
   */
  renderStat() {
    // 累计字数：所有素材 content 长度之和
    const totalChars = this.fragments.reduce((sum, f) => sum + (f.content || '').length, 0);
    this.el.stat.textContent =
      `共 ${this.fragments.length} 条素材 · ${this.tags.length} 个标签 · 累计 ${this.formatNum(totalChars)} 字`;
    this.el.countAll.textContent = this.fragments.length;
  }

  /**
   * 渲染左侧标签栏（含「全部素材」与每个标签及数量）
   * @returns {void} 无返回值
   */
  renderTagList() {
    const listEl = this.el.tagList;
    // 清空后重建，避免累积
    listEl.querySelectorAll('.tag-item:not([data-filter="all"])').forEach((n) => n.remove());

    this.tags.forEach((tag) => {
      const count = this.fragments.filter((f) => f.tagIds.includes(tag.id)).length;

      const li = document.createElement('li');
      li.className = 'tag-item' + (this.filterId === tag.id ? ' active' : '');
      li.dataset.filter = tag.id;
      li.setAttribute('role', 'button');
      li.setAttribute('tabindex', '0');
      li.title = '点击筛选，悬停可重命名或删除';

      const name = document.createElement('span');
      name.className = 'tag-name';
      name.textContent = tag.name;

      const ops = document.createElement('span');
      ops.className = 'tag-ops';
      ops.innerHTML =
        '<button class="tag-op" data-op="edit" title="重命名">重命名</button>' +
        '<button class="tag-op" data-op="del" title="删除">删除</button>';

      const countEl = document.createElement('span');
      countEl.className = 'tag-count';
      countEl.textContent = count;

      li.append(name, ops, countEl);
      listEl.appendChild(li);
    });
  }

  /**
   * 渲染录入区的标签选择条（chip 形式，点击即可选中/取消）
   * @returns {void} 无返回值
   */
  renderComposerTags() {
    const box = this.el.pickerTags;
    box.textContent = '';

    if (this.tags.length === 0) {
      const empty = document.createElement('span');
      empty.className = 'picker-empty';
      empty.textContent = '尚未创建标签，可先不选或新建';
      empty.style.color = 'var(--ink-weak)';
      empty.style.fontSize = '13px';
      box.appendChild(empty);
      return;
    }

    this.tags.forEach((tag) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'tag-chip' + (this.pickerSelected.has(tag.id) ? ' active' : '');
      chip.textContent = tag.name;
      chip.addEventListener('click', () => {
        if (this.pickerSelected.has(tag.id)) this.pickerSelected.delete(tag.id);
        else this.pickerSelected.add(tag.id);
        this.renderComposerTags();
      });
      box.appendChild(chip);
    });
  }

  /**
   * 获取当前筛选与搜索共同作用下的可见素材列表
   * @returns {Array} 可见素材数组（保持全局顺序）
   */
  visibleFragments() {
    let list = this.fragments;
    // 先按标签分类筛选
    if (this.filterId !== 'all') {
      list = list.filter((f) => f.tagIds.includes(this.filterId));
    }
    // 再叠加关键词过滤：对 content 做大小写不敏感的包含匹配
    const kw = (this.searchTerm || '').trim().toLowerCase();
    if (kw) {
      list = list.filter((f) => (f.content || '').toLowerCase().includes(kw));
    }
    return list;
  }

  /**
   * 渲染右侧素材列表
   * @returns {void} 无返回值
   */
  renderList() {
    const listEl = this.el.fragmentList;
    listEl.textContent = '';
    // 同步搜索框清空按钮显隐
    const kw = (this.searchTerm || '').trim();
    this.el.searchClear.classList.toggle('hidden', !kw);

    const visible = this.visibleFragments();

    // 空状态：区分「完全没有素材」「筛选无结果」「搜索无结果」
    if (visible.length === 0) {
      let kind = 'filter';
      if (kw) kind = 'search';
      else if (this.filterId === 'all') kind = 'all';
      listEl.appendChild(this.buildEmpty(kind));
      // 标题：搜索时显示「搜索：xxx」
      if (kw) this.el.listTitle.textContent = `搜索：${kw}`;
      else this.el.listTitle.textContent = this.filterId === 'all' ? '全部素材' : '筛选结果';
      this.syncSelectAllState();
      return;
    }

    visible.forEach((f) => listEl.appendChild(this.buildCard(f)));

    // 刷新标题
    if (kw) this.el.listTitle.textContent = `搜索：${kw}`;
    else if (this.filterId === 'all') this.el.listTitle.textContent = '全部素材';
    else {
      const tag = this.tags.find((t) => t.id === this.filterId);
      this.el.listTitle.textContent = tag ? `「${tag.name}」下的素材` : '筛选结果';
    }

    this.syncSelectAllState();
  }

  /**
   * 构建空状态节点
   * @param {string} kind - 空状态类型：'all' 完全没有素材 / 'filter' 分类下无素材 / 'search' 搜索无结果
   * @returns {HTMLElement} 空状态容器元素（含图标、文案与引导按钮）
   */
  buildEmpty(kind) {
    const div = document.createElement('div');
    div.className = 'empty';
    // icon 为静态 SVG，无用户输入，安全
    const svg =
      '<svg class="empty-icon" viewBox="0 0 48 48" aria-hidden="true">' +
      '<rect x="8" y="14" width="32" height="24" rx="3" fill="none" stroke="#cfc4aa" stroke-width="2"/>' +
      '<path d="M8 20h32" stroke="#cfc4aa" stroke-width="2"/>' +
      '<rect x="13" y="25" width="22" height="3" fill="#e1d7c2"/>' +
      '<rect x="13" y="31" width="14" height="3" fill="#e1d7c2"/>' +
      '</svg>';

    let textHtml;
    let showBtns = false;
    if (kind === 'search') {
      textHtml = '<p>未找到匹配的素材<br>换个关键词试试</p>';
    } else if (kind === 'all') {
      textHtml = '<p>盒子里还空空的<br>从上方记录第一条备课素材吧</p>';
      showBtns = true;
    } else {
      textHtml = '<p>该分类下还没有素材<br>换一个标签看看，或把它归到别的标签下</p>';
    }

    // 引导按钮：写第一条素材 / 新建标签（事件委托到 data-empty）
    let extraHtml = '';
    if (showBtns) {
      extraHtml =
        '<div class="empty-actions">' +
        '<button class="btn" type="button" data-empty="write">写第一条素材</button>' +
        '<button class="btn" type="button" data-empty="newtag">新建标签</button>' +
        '</div>';
    }

    div.innerHTML = svg + textHtml + extraHtml;
    return div;
  }

  /**
   * 构建单条素材卡片
   * @param {Object} f - 素材对象 { id, content, tagIds, createdAt, updatedAt }
   * @returns {HTMLElement} 卡片 DOM 元素（含拖拽手柄、勾选框、内容、标签、操作按钮）
   */
  buildCard(f) {
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.id = f.id;
    card.draggable = true;

    // 拖拽手柄
    const handle = document.createElement('span');
    handle.className = 'drag-handle';
    handle.textContent = '⋮⋮';
    handle.title = '按住拖动以调整顺序';

    // 勾选框
    const label = document.createElement('label');
    label.className = 'check';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = this.selected.has(f.id);
    label.appendChild(cb);

    // 主体：内容 + 元信息
    const main = document.createElement('div');
    main.className = 'card-main';

    const content = document.createElement('p');
    content.className = 'card-content';
    content.textContent = f.content;

    const meta = document.createElement('div');
    meta.className = 'card-meta';

    // 标签组
    const tagsBox = document.createElement('div');
    tagsBox.className = 'card-tags';
    const tagIds = f.tagIds.filter((id) => this.tags.some((t) => t.id === id)); // 过滤已删除的标签
    if (tagIds.length === 0) {
      const none = document.createElement('span');
      none.className = 'card-tag';
      none.textContent = '未分类';
      tagsBox.appendChild(none);
    } else {
      tagIds.forEach((tid) => {
        const tag = this.tags.find((t) => t.id === tid);
        const chip = document.createElement('span');
        chip.className = 'card-tag';
        chip.textContent = tag.name;
        tagsBox.appendChild(chip);
      });
    }

    // 操作组
    const ops = document.createElement('div');
    ops.className = 'card-actions';
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'card-action';
    copyBtn.textContent = '复制';
    copyBtn.dataset.op = 'copy';
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'card-action';
    editBtn.textContent = '编辑';
    editBtn.dataset.op = 'edit';
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'card-action';
    delBtn.textContent = '删除';
    delBtn.dataset.op = 'del';
    ops.append(copyBtn, editBtn, delBtn);

    // 时间
    const time = document.createElement('span');
    time.className = 'card-time';
    time.textContent = this.formatDate((f.createdAt || Date.now()));

    meta.append(tagsBox, ops);
    main.append(content, meta);
    card.append(handle, label, main, time);

    return card;
  }

  /* ================================================================
   *  素材录入 / 编辑
   * ================================================================ */

  /**
   * 提交录入区内容：新建或保存修改
   * @returns {void} 无返回值
   */
  submitFragment() {
    try {
      const content = this.el.fragmentInput.value.trim();
      if (!content) {
        this.toast('请先写下素材内容');
        this.el.fragmentInput.focus();
        return;
      }
      if (content.length > 1000) {
        this.toast('素材内容不能超过 1000 字');
        return;
      }

      const tagIds = Array.from(this.pickerSelected);
      const now = Date.now();

      if (this.editingId) {
        const frag = this.fragments.find((f) => f.id === this.editingId);
        if (frag) {
          frag.content = content;
          frag.tagIds = tagIds;
          frag.updatedAt = now;
          this.toast('已保存修改');
        }
      } else {
        this.fragments.push({
          id: this.uid(),
          content,
          tagIds,
          createdAt: now,
          updatedAt: now,
        });
        this.toast('已收入盒中');
      }

      this.resetComposer();
      this.save();
      this.render();
    } catch (err) {
      console.error('提交素材失败：', err);
      this.toast('操作失败，请重试');
    }
  }

  /**
   * 重置录入区为「新建」模式
   * @returns {void} 无返回值
   */
  resetComposer() {
    this.editingId = null;
    this.pickerSelected = new Set();
    this.el.fragmentInput.value = '';
    this.el.fragmentInput.placeholder = '记录一条备课素材：一段教学灵感、一个课堂问题、一句学生精彩回答……\n（Ctrl / ⌘ + Enter 快速收入）';
    this.el.addBtn.textContent = '收入盒中';
    this.el.cancelEditBtn.classList.add('hidden');
    this.updateCharCount();
    this.renderComposerTags();
  }

  /**
   * 进入素材编辑模式：把素材内容与标签回填到录入区
   * @param {string} id - 素材 id
   * @returns {void} 无返回值
   */
  startEdit(id) {
    const frag = this.fragments.find((f) => f.id === id);
    if (!frag) return;

    this.editingId = id;
    this.pickerSelected = new Set(frag.tagIds.filter((tid) => this.tags.some((t) => t.id === tid)));
    this.el.fragmentInput.value = frag.content;
    this.el.fragmentInput.placeholder = '正在编辑素材…';
    this.el.addBtn.textContent = '保存修改';
    this.el.cancelEditBtn.classList.remove('hidden');
    this.updateCharCount();
    this.renderComposerTags();
    this.el.fragmentInput.focus();
    // 滚回顶部，让用户看到正在编辑的入口
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * 取消编辑模式
   * @returns {void} 无返回值
   */
  cancelEdit() {
    this.resetComposer();
    this.toast('已取消编辑');
  }

  /**
   * 更新字数统计
   * @returns {void} 无返回值
   */
  updateCharCount() {
    const len = this.el.fragmentInput.value.length;
    this.el.charCount.textContent = `${len} / 1000`;
  }

  /* ================================================================
   *  标签管理
   * ================================================================ */

  /**
   * 打开标签弹窗（新建或重命名）
   * @param {string} mode - 'create' 新建 或 'edit' 重命名
   * @param {string|null} tagId - edit 模式下被编辑的标签 id
   * @returns {void} 无返回值
   */
  openTagModal(mode, tagId = null) {
    this.tagModalMode = mode;
    this.tagModalTargetId = tagId;

    if (mode === 'edit' && tagId) {
      const tag = this.tags.find((t) => t.id === tagId);
      if (!tag) return;
      this.el.tagModalTitle.textContent = '重命名标签';
      this.el.tagNameInput.value = tag.name;
    } else {
      this.el.tagModalTitle.textContent = '新建标签';
      this.el.tagNameInput.value = '';
    }

    this.openModal(this.el.tagModal);
    this.el.tagNameInput.focus(); // 自动聚焦便于输入
  }

  /**
   * 保存标签弹窗内容（执行新建或重命名）
   * @returns {void} 无返回值
   */
  saveTagModal() {
    try {
      const name = this.el.tagNameInput.value.trim();

      // 输入校验
      if (!name) {
        this.toast('标签名称不能为空');
        return;
      }
      if (name.length > 12) {
        this.toast('标签名称不能超过 12 个字');
        return;
      }

      const duplicate = this.tags.some((t) => t.name === name && t.id !== this.tagModalTargetId);
      if (duplicate) {
        this.toast('已有同名标签');
        return;
      }

      if (this.tagModalMode === 'edit' && this.tagModalTargetId) {
        const tag = this.tags.find((t) => t.id === this.tagModalTargetId);
        if (tag) {
          tag.name = name;
          this.toast('标签已重命名');
        }
      } else {
        this.tags.push({ id: this.uid(), name });
        this.toast(`已新建标签「${name}」`);
      }

      this.closeModal(this.el.tagModal);
      this.save();
      this.render();
    } catch (err) {
      console.error('保存标签失败：', err);
      this.toast('操作失败，请重试');
    }
  }

  /**
   * 删除标签：同时从所有素材上解除该标签
   * @param {string} tagId - 要删除的标签 id
   * @returns {void} 无返回值
   */
  deleteTag(tagId) {
    const tag = this.tags.find((t) => t.id === tagId);
    if (!tag) return;

    this.confirm(
      '删除标签',
      `确定删除标签「${tag.name}」吗？标注了该标签的素材不会被删除，仅解除关联。`,
      () => {
        this.tags = this.tags.filter((t) => t.id !== tagId);
        this.fragments.forEach((f) => {
          f.tagIds = f.tagIds.filter((id) => id !== tagId);
        });
        if (this.filterId === tagId) this.filterId = 'all'; // 正在查看的分类被删除时，回到全部
        this.pickerSelected.delete(tagId);
        this.save();
        this.render();
        this.toast('标签已删除');
      }
    );
  }

  /**
   * 标签栏点击处理（事件委托）
   * @param {MouseEvent} e - 点击事件
   * @returns {void} 无返回值
   */
  onTagListClick(e) {
    const opBtn = e.target.closest('[data-op]');
    const item = e.target.closest('.tag-item');
    if (!item) return;

    if (opBtn) {
      const tagId = item.dataset.filter;
      if (opBtn.dataset.op === 'edit') this.openTagModal('edit', tagId);
      if (opBtn.dataset.op === 'del') this.deleteTag(tagId);
      return;
    }
    // 其余点击即筛选
    this.setFilter(item.dataset.filter);
  }

  /**
   * 标签栏键盘操作（Enter 触发筛选）
   * @param {KeyboardEvent} e - 键盘事件
   * @returns {void} 无返回值
   */
  onTagListKeydown(e) {
    if (e.key === 'Enter') {
      const item = e.target.closest('.tag-item');
      if (item) this.setFilter(item.dataset.filter);
    }
  }

  /**
   * 切换当前筛选分类
   * @param {string} filterId - 'all' 或标签 id
   * @returns {void} 无返回值
   */
  setFilter(filterId) {
    if (this.filterId === filterId) return;
    this.filterId = filterId;
    this.renderTagList();
    this.renderList();
  }

  /* ================================================================
   *  素材列表交互（勾选 / 编辑 / 删除）
   * ================================================================ */

  /**
   * 列表点击处理：编辑 / 删除按钮
   * @param {MouseEvent} e - 点击事件
   * @returns {void} 无返回值
   */
  onListClick(e) {
    // 空状态引导按钮：写第一条素材 / 新建标签
    const emptyAction = e.target.closest('[data-empty]');
    if (emptyAction) {
      if (emptyAction.dataset.empty === 'write') this.focusComposer();
      if (emptyAction.dataset.empty === 'newtag') this.openTagModal('create');
      return;
    }

    const btn = e.target.closest('[data-op]');
    if (!btn) return;
    const card = e.target.closest('.card');
    if (!card) return;
    const id = card.dataset.id;

    if (btn.dataset.op === 'edit') this.startEdit(id);
    if (btn.dataset.op === 'del') this.deleteFragment(id);
    if (btn.dataset.op === 'copy') this.copyFragment(id);
  }

  /**
   * 聚焦录入区输入框，供空状态「写第一条素材」引导按钮使用
   * @returns {void} 无返回值
   */
  focusComposer() {
    this.el.fragmentInput.focus();
    // 滚动回顶部，暴露录入区
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * 列表勾选状态变化：同步选中集合
   * @param {Event} e - change 事件
   * @returns {void} 无返回值
   */
  onListChange(e) {
    if (e.target.type !== 'checkbox') return;
    const card = e.target.closest('.card');
    if (!card) return;
    if (e.target.checked) this.selected.add(card.dataset.id);
    else this.selected.delete(card.dataset.id);
    this.syncSelectAllState();
  }

  /**
   * 同步「全选」复选框状态
   * @returns {void} 无返回值
   */
  syncSelectAllState() {
    const visible = this.visibleFragments();
    const allChecked = visible.length > 0 && visible.every((f) => this.selected.has(f.id));
    this.el.selectAll.checked = allChecked;
  }

  /**
   * 全选 / 取消全选（作用于当前筛选下的可见素材）
   * @returns {void} 无返回值
   */
  toggleSelectAll() {
    const visible = this.visibleFragments();
    if (this.el.selectAll.checked) {
      visible.forEach((f) => this.selected.add(f.id));
    } else {
      visible.forEach((f) => this.selected.delete(f.id));
    }
    this.renderList();
  }

  /**
   * 删除单条素材（带确认）
   * @param {string} id - 素材 id
   * @returns {void} 无返回值
   */
  deleteFragment(id) {
    const frag = this.fragments.find((f) => f.id === id);
    if (!frag) return;
    this.confirm(
      '删除素材',
      '确定删除这条素材吗？删除后无法恢复。',
      () => {
        this.fragments = this.fragments.filter((f) => f.id !== id);
        this.selected.delete(id);
        if (this.editingId === id) this.resetComposer();
        this.save();
        this.render();
        this.toast('素材已删除');
      }
    );
  }

  /**
   * 批量删除选中素材（带确认）
   * @returns {void} 无返回值
   */
  deleteSelected() {
    const ids = Array.from(this.selected);
    if (ids.length === 0) {
      this.toast('请先勾选要删除的素材');
      return;
    }
    this.confirm(
      '批量删除',
      `确定删除选中的 ${ids.length} 条素材吗？删除后无法恢复。`,
      () => {
        this.fragments = this.fragments.filter((f) => !this.selected.has(f.id));
        this.selected.clear();
        if (this.editingId && this.fragments.every((f) => f.id !== this.editingId)) this.resetComposer();
        this.save();
        this.render();
        this.toast('已删除选中素材');
      }
    );
  }

  /* ================================================================
   *  拖拽排序
   * ================================================================ */

  /**
   * 拖拽开始
   * @param {DragEvent} e - 拖拽事件
   * @returns {void} 无返回值
   */
  onDragStart(e) {
    const card = e.target.closest('.card');
    if (!card) return;
    this.dragId = card.dataset.id;
    // Firefox 需要主动设置数据才会开始拖拽
    e.dataTransfer.setData('text/plain', this.dragId);
    e.dataTransfer.effectAllowed = 'move';
    card.classList.add('dragging');
  }

  /**
   * 拖拽经过：根据鼠标在目标卡片的上下位置，给出插入指示
   * @param {DragEvent} e - 拖拽事件
   * @returns {void} 无返回值
   */
  onDragOver(e) {
    e.preventDefault();
    if (!this.dragId) return;
    const card = e.target.closest('.card');
    if (!card || card.dataset.id === this.dragId) return;

    e.dataTransfer.dropEffect = 'move';
    this.clearDropFlags();
    const rect = card.getBoundingClientRect();
    if (e.clientY < rect.top + rect.height / 2) card.classList.add('drop-before');
    else card.classList.add('drop-after');
  }

  /**
   * 拖拽离开时清除指示
   * @param {DragEvent} e - 拖拽事件
   * @returns {void} 无返回值
   */
  onDragLeave(e) {
    if (e.target instanceof HTMLElement) e.target.closest('.card')?.classList.remove('drop-before', 'drop-after');
  }

  /**
   * 放下：把被拖素材移动到目标位置（前 / 后）
   * @param {DragEvent} e - 拖拽事件
   * @returns {void} 无返回值
   */
  onDrop(e) {
    e.preventDefault();
    const card = e.target.closest('.card');
    if (!card || !this.dragId || card.dataset.id === this.dragId) {
      this.clearDragState();
      return;
    }

    const rect = card.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    this.moveFragment(this.dragId, card.dataset.id, after);
  }

  /**
   * 移动素材位置（在全局数组中重新插入）
   * @param {string} dragId - 被拖动的素材 id
   * @param {string} targetId - 目标素材 id
   * @param {boolean} after - true 放到目标之后，false 放到目标之前
   * @returns {void} 无返回值
   */
  moveFragment(dragId, targetId, after) {
    const arr = this.fragments.slice();
    const from = arr.findIndex((f) => f.id === dragId);
    const to = arr.findIndex((f) => f.id === targetId);
    if (from === -1 || to === -1) return;

    const [moved] = arr.splice(from, 1);
    // 重新定位目标索引（被移除后索引可能前移）
    const newTo = arr.findIndex((f) => f.id === targetId);
    arr.splice(newTo + (after ? 1 : 0), 0, moved);

    this.fragments = arr;
    this.clearDragState();
    this.save();
    this.renderList();
  }

  /**
   * 清除全部拖拽痕迹
   * @returns {void} 无返回值
   */
  clearDragState() {
    this.dragId = null;
    this.clearDropFlags();
    document.querySelectorAll('.card.dragging').forEach((n) => n.classList.remove('dragging'));
  }

  /**
   * 清除所有插入指示线
   * @returns {void} 无返回值
   */
  clearDropFlags() {
    document.querySelectorAll('.card.drop-before, .card.drop-after').forEach((n) => n.classList.remove('drop-before', 'drop-after'));
  }

  /* ================================================================
   *  导出 Markdown
   * ================================================================ */

  /**
   * 把勾选的素材组装为 Markdown，并打开预览弹窗供用户确认 / 修改后复制
   * @returns {void} 无返回值
   */
  exportMarkdown() {
    try {
      const selected = this.fragments.filter((f) => this.selected.has(f.id));
      if (selected.length === 0) {
        this.toast('请先勾选要导出的素材');
        return;
      }

      const lines = [];
      lines.push('# 教案碎片素材导出');
      lines.push('');
      lines.push(`> 导出时间：${this.formatDateTime(Date.now())}`);
      lines.push(`> 素材数量：${selected.length} 条`);
      lines.push('');

      selected.forEach((f, i) => {
        const tagNames = f.tagIds
          .filter((tid) => this.tags.some((t) => t.id === tid))
          .map((tid) => this.tags.find((t) => t.id === tid).name);

        lines.push(`## 素材 ${i + 1}`);
        lines.push('');
        lines.push(f.content.trim());
        lines.push('');
        lines.push(tagNames.length > 0 ? `标签：${tagNames.map((n) => `\`${n}\``).join('、')}` : '标签：无');
        lines.push('');
        lines.push('---');
        lines.push('');
      });

      const md = lines.join('\n').trim();
      // 组装素材数量与总字数提示（在 textarea 中可修改）
      const totalChars = selected.reduce((sum, f) => sum + (f.content || '').length, 0);
      this.el.exportHint.textContent = `共 ${selected.length} 条素材 · 约 ${this.formatNum(totalChars)} 字，可在此编辑后再复制`;
      this.el.exportTextarea.value = md;
      this.openModal(this.el.exportModal);
    } catch (err) {
      console.error('导出失败：', err);
      this.toast('导出失败，请重试');
    }
  }

  /**
   * 将导出预览弹窗中（用户可编辑后）的内容复制到剪贴板
   * @returns {void} 无返回值
   */
  async copyExport() {
    try {
      const text = this.el.exportTextarea.value;
      const ok = await this.copyText(text);
      this.toast(ok ? '已复制到剪贴板' : '复制失败，可手动选择导出内容');
    } catch (err) {
      console.error('复制导出内容失败：', err);
      this.toast('复制失败，请重试');
    }
  }

  /**
   * 将预览内容导出为 Word 兼容的 .doc 文件并下载
   * 原理：把 Markdown 文本转为内嵌样式 CSS 的 HTML，以 .doc 扩展名保存，
   *       Word / WPS 可直接打开，不依赖任何第三方库，断网也可用。
   * @returns {void} 无返回值
   * @throws {Error} Blob/下载被浏览器拦截时被捕获并提示
   */
  downloadWord() {
    try {
      const text = this.el.exportTextarea.value; // 使用预览区当前内容（含用户手动修改）
      const html = this.markdownToHtml(text);
      // BOM 前缀用于新版 Word 正确识别 UTF-8 编码
      const blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `教案碎片-word-${this.formatDate(Date.now())}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // 及时释放对象 URL
      this.toast('Word 文档已生成，开始下载');
    } catch (err) {
      console.error('导出 Word 失败：', err);
      this.toast('导出 Word 失败，请重试');
    }
  }

  /**
   * 把 Markdown 文本转换为 Word 兼容的 HTML 文档
   * 实现已提取到独立模块 markdown-export.js（UMD，浏览器/Node 双端可用），此处仅委托。
   * @param {string} md - Markdown 文本
   * @returns {string} 完整 HTML 文档字符串
   */
  markdownToHtml(md) {
    return MarkdownExport.markdownToHtml(md);
  }

  /**
   * Markdown 行内语法转换（委托 markdown-export.js，逻辑与测试均复用同一实现）
   * @param {string} s - 已转义的纯文本
   * @returns {string} 处理行内语法后的 HTML 片段
   */
  inlineMarkdown(s) {
    return MarkdownExport.inlineMarkdown(s);
  }

  /**
   * HTML 特殊字符转义（委托 markdown-export.js，防注入）
   * @param {string} s - 原始字符串
   * @returns {string} 转义后的安全字符串
   */
  escapeHtml(s) {
    return MarkdownExport.escapeHtml(s);
  }

  /**
   * 复制单条素材的纯文本正文到剪贴板
   * @param {string} id - 素材 id
   * @returns {void} 无返回值
   */
  async copyFragment(id) {
    try {
      const frag = this.fragments.find((f) => f.id === id);
      if (!frag) return;
      const ok = await this.copyText(frag.content);
      this.toast(ok ? '已复制该条素材' : '复制失败，可手动选择内容');
    } catch (err) {
      console.error('复制素材失败：', err);
      this.toast('复制失败，请重试');
    }
  }

  /**
   * 复制文本到剪贴板（优先使用 Clipboard API，降级到 execCommand）
   * @param {string} text - 要复制的文本
   * @returns {Promise<boolean>} 复制是否成功
   */
  async copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      // Clipboard API 失败（如 file:// 权限限制），继续走降级方案
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  /* ================================================================
   *  素材搜索 / 数据备份
   * ================================================================ */

  /**
   * 搜索框输入事件：实时更新关键词并重渲列表
   * @param {InputEvent} e - 输入事件对象
   * @returns {void} 无返回值
   */
  onSearchInput(e) {
    this.searchTerm = e.target.value;
    // 同步清空按钮显隐，并重渲列表
    this.renderList();
  }

  /**
   * 清空搜索词，恢复完整列表
   * @returns {void} 无返回值
   */
  clearSearch() {
    this.searchTerm = '';
    this.el.searchInput.value = '';
    this.el.searchClear.classList.add('hidden');
    this.renderList();
  }

  /**
   * 导出当前全部数据为 JSON 备份文件（通过 Blob + <a download> 触发下载）
   * @returns {void} 无返回值
   */
  exportData() {
    try {
      const payload = {
        version: 1,                       // 备份格式版本号，便于后续迁移
        exportedAt: new Date().toISOString(),
        tags: this.tags,
        fragments: this.fragments,
      };
      const json = JSON.stringify(payload, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      // 使用临时 <a> 元素触发浏览器下载
      const a = document.createElement('a');
      a.href = url;
      a.download = `教案碎片备份-${this.formatDate(Date.now())}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.toast('已导出数据备份');
    } catch (err) {
      console.error('导出数据失败：', err);
      this.toast('导出数据失败，请重试');
    }
  }

  /**
   * 导入 JSON 备份文件：解析、校验结构后确认覆盖
   * @param {Event} e - 文件选择的 change 事件
   * @returns {void} 无返回值
   */
  importData(e) {
    const file = e.target.files && e.target.files[0];
    // 重置 value，允许重复选择同一个文件
    e.target.value = '';
    if (!file) return;

    // 文件大小上限 10MB，防止超大备份文件导致 JSON.parse 阻塞主线程
    if (file.size > 10 * 1024 * 1024) {
      this.toast('备份文件过大（上限 10MB），无法导入');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result || '');
        // 结构校验失败则中止，不覆盖现有数据
        if (!this.validBackup(data)) {
          this.toast('备份文件格式不正确');
          return;
        }
        this.confirm('导入数据', '导入将覆盖当前全部数据，确定吗？', () => {
          // 替换数据并重置全部界面状态
          this.tags = data.tags;
          this.fragments = data.fragments;
          this.selected = new Set();
          this.pickerSelected = new Set();
          this.editingId = null;
          this.filterId = 'all';
          this.searchTerm = '';
          this.el.searchInput.value = '';
          this.el.searchClear.classList.add('hidden');
          this.resetComposer();
          this.save();
          this.render();
          this.toast('导入成功');
        });
      } catch (err) {
        console.warn('导入数据解析失败：', err);
        this.toast('备份文件格式不正确');
      }
    };
    reader.onerror = () => this.toast('读取文件失败');
    reader.readAsText(file);
  }

  /**
   * 校验备份对象结构是否合法
   * @param {Object} data - 待校验的备份对象
   * @returns {boolean} true 表示结构正确（tags 含字符串 name，fragments 含 content 字符串与 tagIds 数组）
   */
  validBackup(data) {
    if (!data || typeof data !== 'object') return false;
    if (!Array.isArray(data.tags)) return false;
    if (data.tags.some((t) => !t || typeof t.name !== 'string')) return false;
    if (!Array.isArray(data.fragments)) return false;
    return data.fragments.every((f) => f && typeof f.content === 'string' && Array.isArray(f.tagIds));
  }

  /**
   * 数字千分位格式化
   * @param {number} n - 原始数值
   * @returns {string} 千分位分隔后的字符串（如 1,234）
   */
  formatNum(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /* ================================================================
   *  弹窗 / 轻提示
   * ================================================================ */

  /**
   * 打开指定弹窗
   * @param {HTMLElement} modal - 弹窗根元素
   * @returns {void} 无返回值
   */
  openModal(modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // 弹窗时锁定页面滚动
  }

  /**
   * 关闭指定弹窗
   * @param {HTMLElement} modal - 弹窗根元素
   * @returns {void} 无返回值
   */
  closeModal(modal) {
    modal.classList.add('hidden');
    if (!document.querySelector('.modal:not(.hidden)')) {
      document.body.style.overflow = '';
    }
  }

  /**
   * 关闭当前打开的任意弹窗（供 Esc / 遮罩点击使用）
   * @returns {void} 无返回值
   */
  closeTopModal() {
    const open = document.querySelector('.modal:not(.hidden)');
    if (open) this.closeModal(open);
  }

  /**
   * 弹出通用确认框，回调在确认后执行
   * @param {string} title - 弹窗标题
   * @param {string} message - 提示内容
   * @param {Function} onOk - 确认后的回调函数
   * @returns {void} 无返回值
   */
  confirm(title, message, onOk) {
    this.el.confirmTitle.textContent = title;
    this.el.confirmMsg.textContent = message;
    this.confirmResolveFn = onOk;
    this.openModal(this.el.confirmModal);
  }

  /**
   * 执行确认回调并关闭确认框
   * @returns {void} 无返回值
   */
  confirmResolve() {
    const fn = this.confirmResolveFn;
    this.confirmResolveFn = null;
    this.closeModal(this.el.confirmModal);
    if (typeof fn === 'function') fn();
  }

  /**
   * 显示轻提示，2.4 秒后自动消失
   * @param {string} message - 提示文案
   * @returns {void} 无返回值
   */
  toast(message) {
    const t = this.el.toast;
    t.textContent = message;
    t.classList.remove('hidden');

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => t.classList.add('hidden'), 2400);
  }

  /* ================================================================
   *  工具方法
   * ================================================================ */

  /**
   * 生成唯一 id
   * @returns {string} 由时间戳与随机数组合的唯一标识
   */
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /**
   * 格式化为 yyyy-MM-dd
   * @param {number} ts - 时间戳（毫秒）
   * @returns {string} 格式化后的日期字符串
   */
  formatDate(ts) {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /**
   * 格式化为 yyyy-MM-dd HH:mm
   * @param {number} ts - 时间戳（毫秒）
   * @returns {string} 格式化后的日期时间字符串
   */
  formatDateTime(ts) {
    const d = new Date(ts);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${this.formatDate(ts)} ${h}:${m}`;
  }
}

// 页面加载完成后初始化应用
window.addEventListener('DOMContentLoaded', () => {
  // 初始化失败时兜底，避免白屏
  try {
    window.lessonBoxApp = new LessonBoxApp();
  } catch (err) {
    console.error('应用初始化失败：', err);
  }
});