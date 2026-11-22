/* ============================================================
   FitPlan 智能健身计划生成器
   核心：基于规则 + 加权评分的推荐引擎（纯前端实现）
   ============================================================ */

/* ---------- 1. 动作库 ----------
   每个动作包含：名称、目标肌群、所需器材、难度(1-3)、动作模式、要点
   equipment: none(徒手) / dumbbell(哑铃) / gym(健身房器械)
   pattern: push(推) / pull(拉) / squat(蹲) / hinge(髋铰链) / core(核心) / cardio(有氧)
*/
const EXERCISES = [
  // —— 徒手动作 ——
  { name: '徒手深蹲', kind: 'compound', sub: '股四头', part: '腿部', equipment: 'none', level: 1, pattern: 'squat', focus: ['strength','muscle','health','tone'], tip: '挺胸收腹，膝盖朝向脚尖，下蹲至大腿接近水平，臀部向后坐。' },
  { name: '跪姿俯卧撑', kind: 'compound', sub: '中胸', part: '胸部', equipment: 'none', level: 1, pattern: 'push', focus: ['health','fatloss','tone','posture'], tip: '身体保持一条直线，下降时肘部约 45 度，适合新手建立基础力量。' },
  { name: '标准俯卧撑', kind: 'compound', sub: '中胸', part: '胸部', equipment: 'none', level: 2, pattern: 'push', focus: ['muscle','strength','health','tone'], tip: '双手略宽于肩，核心收紧，推起时不要耸肩。' },
  { name: '臀桥', kind: 'compound', sub: '臀大肌', part: '臀部', equipment: 'none', level: 1, pattern: 'hinge', focus: ['muscle','health','fatloss','tone','posture'], tip: '脚跟发力将臀部顶起，顶端停留 1 秒，感受臀部收缩。' },
  { name: '平板支撑', kind: 'isolation', timed: true, sub: '整体', part: '核心', equipment: 'none', level: 1, pattern: 'core', focus: ['health','fatloss','strength','posture','tone'], tip: '肘部在肩正下方，身体成一条直线，不要塌腰或撅臀。' },
  { name: '卷腹', kind: 'isolation', sub: '上腹', part: '核心', equipment: 'none', level: 1, pattern: 'core', focus: ['muscle','fatloss','tone'], tip: '只用腹部力量卷起上半身，下背贴地，不要用脖子发力。' },
  { name: '弓步蹲', kind: 'compound', sub: '股四头', part: '腿部', equipment: 'none', level: 2, pattern: 'squat', focus: ['muscle','fatloss','health','tone'], tip: '前脚掌踩稳，后膝接近地面，身体保持直立。' },
  { name: '超人式', kind: 'isolation', sub: '下背', part: '背部', equipment: 'none', level: 1, pattern: 'pull', focus: ['health','muscle','posture'], tip: '俯卧同时抬起手臂和双腿，感受背部发力，避免颈部过度后仰。' },
  { name: '开合跳', kind: 'cardio', sub: '全身', part: '全身', equipment: 'none', level: 1, pattern: 'cardio', focus: ['fatloss','health','endurance'], tip: '落地时膝盖微屈缓冲，保持节奏均匀。' },
  { name: '高抬腿', kind: 'cardio', sub: '全身', part: '全身', equipment: 'none', level: 2, pattern: 'cardio', focus: ['fatloss','health','endurance'], tip: '上身挺直，膝盖抬至腰部高度，落地轻盈。' },
  { name: '波比跳', kind: 'cardio', sub: '全身', part: '全身', equipment: 'none', level: 3, pattern: 'cardio', focus: ['fatloss','endurance'], tip: '全身协调发力，注意落地稳定；体力不足时可去掉跳跃。' },
  { name: '反向划船', kind: 'compound', sub: '上背', part: '背部', equipment: 'none', level: 2, pattern: 'pull', focus: ['muscle','strength','health','posture'], tip: '利用稳固的桌沿或栏杆，身体越水平难度越大，肩胛骨主动后收。' },
  { name: '靠墙静蹲', kind: 'compound', timed: true, sub: '股四头', part: '腿部', equipment: 'none', level: 1, pattern: 'squat', focus: ['health','strength','endurance'], tip: '背部贴墙，膝盖不超过脚尖，保持大腿与地面平行。' },
  { name: '俯身 Y-T-W', kind: 'isolation', sub: '后束', part: '肩部', equipment: 'none', level: 1, pattern: 'pull', focus: ['posture','health','tone'], tip: '俯卧依次摆出 Y、T、W 手型，感受上背部与肩后束发力，改善圆肩。' },
  { name: '登山跑', kind: 'cardio', sub: '全身', part: '全身', equipment: 'none', level: 2, pattern: 'cardio', focus: ['fatloss','endurance','tone'], tip: '俯身交替提膝，核心收紧，保持臀部稳定不上下起伏。' },
  { name: '侧平板支撑', kind: 'isolation', timed: true, sub: '侧腹', part: '核心', equipment: 'none', level: 2, pattern: 'core', focus: ['tone','posture','health'], tip: '身体侧向成一条直线，髋部抬起，感受侧腹发力。' },
  { name: '保加利亚分腿蹲', kind: 'compound', sub: '股四头', part: '腿部', equipment: 'none', level: 2, pattern: 'squat', focus: ['muscle','strength','tone','health'], tip: '后脚搭在凳上，重心放前腿，膝盖朝脚尖不内扣——凯圣王推荐的新手单腿王牌动作。' },
  { name: '单腿硬拉', kind: 'compound', sub: '腘绳', part: '臀部', equipment: 'none', level: 2, pattern: 'hinge', focus: ['muscle','strength','posture','tone'], tip: '以髋部为轴转动而非弯腰，全脚掌踩稳、骨盆保持正——谭成义称它能同时练臀、腘绳与平衡。' },
  { name: '反向卷腹', kind: 'isolation', sub: '下腹', part: '核心', equipment: 'none', level: 1, pattern: 'core', focus: ['tone','health','posture'], tip: '仰卧屈膝，用下腹把臀部卷离地面，下背贴地，避免用惯性甩腿。' },

  { name: '窄距俯卧撑', kind: 'compound', sub: '中缝', part: '胸部', equipment: 'none', level: 2, pattern: 'push', focus: ['muscle','tone','strength'], tip: '双手间距略窄于肩，下降时肘贴近身体，重点刺激胸肌内侧中缝——谭成义建议放在夹胸之后收尾。' },
  { name: '双杠臂屈伸', kind: 'compound', sub: '下胸', part: '胸部', equipment: 'none', level: 3, pattern: 'push', focus: ['muscle','strength','tone'], tip: '身体前倾含胸练下胸、直立练三头；下沉到大臂平行即停——凯圣王推日经典下胸动作。' },
  { name: '原地提踵', kind: 'isolation', sub: '小腿', part: '腿部', equipment: 'none', level: 1, pattern: 'squat', focus: ['muscle','tone','health'], tip: '前脚掌踩台阶边缘，踮起脚尖顶端停 1 秒，缓慢下放拉伸小腿。' },

  { name: '跳绳', kind: 'cardio', sub: '全身', part: '全身', equipment: 'none', level: 1, pattern: 'cardio', focus: ['fatloss','health','endurance'], tip: '手腕发力摇绳，前脚掌轻点地，保持匀速呼吸——单位时间燃脂效率高。' },
  { name: '原地慢跑', kind: 'cardio', sub: '全身', part: '全身', equipment: 'none', level: 1, pattern: 'cardio', focus: ['fatloss','health','endurance'], tip: '原地小跑步，以能完整说话的强度为准，适合作为训练收尾有氧。' },

  // —— 哑铃 / 居家小器材 ——
  { name: '哑铃深蹲', kind: 'compound', sub: '股四头', part: '腿部', equipment: 'dumbbell', level: 2, pattern: 'squat', focus: ['muscle','strength','fatloss','tone'], tip: '双手持哑铃自然垂于体侧，下蹲时保持躯干挺直。' },
  { name: '哑铃卧推', kind: 'compound', sub: '中胸', part: '胸部', equipment: 'dumbbell', level: 2, pattern: 'push', focus: ['muscle','strength','tone'], tip: '躺在长凳或地面，下放至胸部两侧，推起时不要完全锁死手肘。' },
  { name: '单臂哑铃划船', kind: 'compound', sub: '上背', part: '背部', equipment: 'dumbbell', level: 2, pattern: 'pull', focus: ['muscle','strength','posture'], tip: '一手一膝支撑，背部保持平直，将哑铃拉向髋部。' },
  { name: '哑铃肩推', kind: 'compound', sub: '前束', part: '肩部', equipment: 'dumbbell', level: 2, pattern: 'push', focus: ['muscle','strength','health','tone'], tip: '坐姿或站姿向上推举，避免耸肩，控制下落速度。' },
  { name: '哑铃弯举', kind: 'isolation', sub: '肱二头', part: '手臂', equipment: 'dumbbell', level: 1, pattern: 'pull', focus: ['muscle','tone'], tip: '大臂贴紧身体不动，只靠前臂弯举，顶端稍作停顿。' },
  { name: '哑铃罗马尼亚硬拉', kind: 'compound', sub: '腘绳', part: '臀部', equipment: 'dumbbell', level: 2, pattern: 'hinge', focus: ['muscle','strength','health','tone','posture'], tip: '膝盖微屈，臀部向后推，感受大腿后侧拉伸，背部始终挺直。' },
  { name: '哑铃箭步蹲', kind: 'compound', sub: '股四头', part: '腿部', equipment: 'dumbbell', level: 2, pattern: 'squat', focus: ['muscle','fatloss','tone'], tip: '双手持铃，交替向前迈步下蹲，保持躯干稳定。' },
  { name: '俯身哑铃飞鸟', kind: 'isolation', sub: '后束', part: '肩部', equipment: 'dumbbell', level: 3, pattern: 'pull', focus: ['muscle','posture'], tip: '俯身微屈肘，双臂向两侧打开，感受后束发力。' },
  { name: '哑铃俄罗斯转体', kind: 'isolation', sub: '侧腹', part: '核心', equipment: 'dumbbell', level: 2, pattern: 'core', focus: ['fatloss','muscle','tone'], tip: '坐姿转体，跟随动作呼气，控制幅度避免腰部扭伤。' },
  { name: '哑铃锤式弯举', kind: 'isolation', sub: '前臂', part: '手臂', equipment: 'dumbbell', level: 1, pattern: 'pull', focus: ['muscle','tone','strength'], tip: '手握哑铃如握锤，交替弯举，锻炼肱肌与前臂。' },
  { name: '臀推', kind: 'compound', sub: '臀大肌', part: '臀部', equipment: 'dumbbell', level: 2, pattern: 'hinge', focus: ['muscle','tone','health'], tip: '上背靠凳，哑铃置于髋部，向上顶髋至身体成一条直线。' },
  { name: '高脚杯深蹲', kind: 'compound', sub: '股四头', part: '腿部', equipment: 'dumbbell', level: 1, pattern: 'squat', focus: ['muscle','strength','tone','health'], tip: '哑铃托于胸前，手肘贴身，蹲至大腿接近水平——谭成义推荐的新手最友好深蹲，不压腰。' },
  { name: '上斜哑铃卧推', kind: 'compound', sub: '上胸', part: '胸部', equipment: 'dumbbell', level: 2, pattern: 'push', focus: ['muscle','strength','tone'], tip: '凳面约 30–45 度，下放时哑铃向外延伸，顶端提前 1–2 厘米回放维持张力。' },
  { name: '单腿哑铃硬拉', kind: 'compound', sub: '腘绳', part: '臀部', equipment: 'dumbbell', level: 2, pattern: 'hinge', focus: ['muscle','strength','posture','tone'], tip: '单手持铃，以髋为轴后坐，后腿伸直，感受臀部与大腿后侧拉伸。' },
  { name: '哑铃侧平举', kind: 'isolation', sub: '中束', part: '肩部', equipment: 'dumbbell', level: 1, pattern: 'push', focus: ['muscle','tone','posture'], tip: '小重量、微屈肘向两侧抬起至肩高，全程不耸肩——练肩中束改善溜肩。' },

  { name: '下斜哑铃卧推', kind: 'compound', sub: '下胸', part: '胸部', equipment: 'dumbbell', level: 2, pattern: 'push', focus: ['muscle','strength','tone'], tip: '凳面下斜约 15–25 度，重点刺激胸肌下缘；高血压人群谨慎采用。' },
  { name: '哑铃飞鸟', kind: 'isolation', sub: '中缝', part: '胸部', equipment: 'dumbbell', level: 2, pattern: 'push', focus: ['muscle','tone'], tip: '仰卧微屈肘，双臂像抱大树向中间合拢，顶端挤压胸肌 1 秒，只做上半程保护肩关节。' },
  { name: '上斜哑铃飞鸟', kind: 'isolation', sub: '上胸', part: '胸部', equipment: 'dumbbell', level: 2, pattern: 'push', focus: ['muscle','tone'], tip: '凳面 30 度，只做向上夹的那一段，想象把哑铃"挤"向锁骨下方——谭成义胸日首选。' },
  { name: '仰卧臂屈伸', kind: 'isolation', sub: '肱三头', part: '手臂', equipment: 'dumbbell', level: 1, pattern: 'push', focus: ['muscle','tone','strength'], tip: '凳面倾斜 15 度，哑铃置于额头上方，肘部外旋，只伸肘不耸肩——凯圣王称三头长头王牌动作。' },
  { name: '哑铃提踵', kind: 'isolation', sub: '小腿', part: '腿部', equipment: 'dumbbell', level: 1, pattern: 'squat', focus: ['muscle','tone'], tip: '双手持铃自然垂于体侧，踮起脚尖到最高点停 1 秒再缓慢落下。' },
  { name: '哑铃卷腹', kind: 'isolation', sub: '上腹', part: '核心', equipment: 'dumbbell', level: 1, pattern: 'core', focus: ['muscle','tone'], tip: '双手抱铃于胸前，用腹部卷起上半身，下背贴地，避免脖子借力。' },

  // —— 健身房器械 ——
  { name: '杠铃深蹲', kind: 'compound', sub: '股四头', part: '腿部', equipment: 'gym', level: 3, pattern: 'squat', focus: ['strength','muscle'], tip: '杠铃置于斜方肌上，下蹲时膝盖与脚尖同向，起身时髋膝同步伸展。' },
  { name: '杠铃卧推', kind: 'compound', sub: '中胸', part: '胸部', equipment: 'gym', level: 3, pattern: 'push', focus: ['strength','muscle'], tip: '躺在卧推凳，肩胛骨后收下沉，杠铃下放至乳头连线附近。' },
  { name: '高位下拉', kind: 'compound', sub: '背阔', part: '背部', equipment: 'gym', level: 1, pattern: 'pull', focus: ['muscle','strength','health','posture'], tip: '握住横杆拉向锁骨，先沉肩再拉肘，避免用身体后仰借力。' },
  { name: '坐姿划船', kind: 'compound', sub: '上背', part: '背部', equipment: 'gym', level: 1, pattern: 'pull', focus: ['muscle','strength','posture'], tip: '挺胸坐稳，肩胛骨主动后收，把把手拉向腹部。' },
  { name: '器械推胸', kind: 'compound', sub: '中胸', part: '胸部', equipment: 'gym', level: 1, pattern: 'push', focus: ['muscle','health','tone'], tip: '调整座椅使把手与胸部同高，推起时保持手腕中立。' },
  { name: '杠铃硬拉', kind: 'compound', sub: '臀大肌', part: '臀部', equipment: 'gym', level: 3, pattern: 'hinge', focus: ['strength','muscle'], tip: '杠铃贴近身体，用臀部带动起身，全程保持背部挺直。' },
  { name: '腿举', kind: 'compound', sub: '股四头', part: '腿部', equipment: 'gym', level: 1, pattern: 'squat', focus: ['muscle','strength','tone'], tip: '双脚踩稳踏板，下放至膝盖约 90 度，不要锁死膝关节。' },
  { name: '坐姿肩推', kind: 'compound', sub: '前束', part: '肩部', equipment: 'gym', level: 2, pattern: 'push', focus: ['muscle','strength','tone'], tip: '背部贴紧靠垫，向上推起时不耸肩，控制离心阶段。' },
  { name: '绳索面拉', kind: 'isolation', sub: '后束', part: '肩部', equipment: 'gym', level: 1, pattern: 'pull', focus: ['health','muscle','posture'], tip: '把绳索拉向面部，肘部高于手腕，改善肩部健康。' },
  { name: '腿弯举', kind: 'isolation', sub: '腘绳', part: '腿部', equipment: 'gym', level: 1, pattern: 'hinge', focus: ['muscle','health','tone'], tip: '俯卧或坐姿，弯曲膝盖将小腿靠近臀部，顶端停顿。' },
  { name: '悬垂举腿', kind: 'isolation', sub: '下腹', part: '核心', equipment: 'gym', level: 3, pattern: 'core', focus: ['muscle','strength'], tip: '悬挂时控制身体不摆动，用腹部力量抬起双腿。' },
  { name: '跑步机快走', kind: 'cardio', sub: '全身', part: '全身', equipment: 'gym', level: 1, pattern: 'cardio', focus: ['fatloss','health','endurance'], tip: '坡度 5–8，速度 5–6 km/h，适合作为训练后有氧。' },
  { name: '椭圆机', kind: 'cardio', sub: '全身', part: '全身', equipment: 'gym', level: 1, pattern: 'cardio', focus: ['fatloss','health','endurance'], tip: '保持匀速，阻力适中，对膝盖冲击较小。' },
  { name: '坐姿腿屈伸', kind: 'isolation', sub: '股四头', part: '腿部', equipment: 'gym', level: 1, pattern: 'squat', focus: ['muscle','tone'], tip: '坐稳后缓慢伸直小腿，顶端停顿 1 秒，不要锁死膝盖。' },
  { name: '绳索下压', kind: 'isolation', sub: '肱三头', part: '手臂', equipment: 'gym', level: 1, pattern: 'push', focus: ['muscle','tone'], tip: '大臂夹紧体侧，只用前臂下压，感受肱三头肌收缩。' },
  { name: '史密斯深蹲', kind: 'compound', sub: '股四头', part: '腿部', equipment: 'gym', level: 1, pattern: 'squat', focus: ['muscle','strength','tone'], tip: '沿固定轨迹下蹲，脚略前置，膝盖与脚尖同向，适合新手建立蹲的模式。' },
  { name: '罗马尼亚硬拉', kind: 'compound', sub: '腘绳', part: '臀部', equipment: 'gym', level: 2, pattern: 'hinge', focus: ['muscle','strength','posture','tone'], tip: '杠铃贴近身体下滑，髋部后推，感受大腿后侧拉伸——谭成义腿日必练，练臀不伤腰。' },
  { name: '绳索卷腹', kind: 'isolation', sub: '上腹', part: '核心', equipment: 'gym', level: 1, pattern: 'core', focus: ['muscle','tone','fatloss'], tip: '跪姿双手握绳，用腹部卷起上半身，下背保持固定不借力。' },
  { name: '直臂下压', kind: 'isolation', sub: '背阔', part: '背部', equipment: 'gym', level: 1, pattern: 'pull', focus: ['muscle','posture','tone'], tip: '手臂微屈固定，用背阔肌把横杆压向大腿，感受背阔下缘发力——谭成义推荐的练背动作。' },
  { name: '蝴蝶机夹胸', kind: 'isolation', sub: '中缝', part: '胸部', equipment: 'gym', level: 1, pattern: 'push', focus: ['muscle','tone','health'], tip: '坐稳贴背，双臂环抱向中间夹，顶峰收缩 1 秒，感受胸肌挤压。' },
  { name: '绳索弯举', kind: 'isolation', sub: '肱二头', part: '手臂', equipment: 'gym', level: 1, pattern: 'pull', focus: ['muscle','tone'], tip: '身体稳定不晃动，手腕勾起不塌，全程二头肌发力。' },
  { name: '杠铃臀推', kind: 'compound', sub: '臀大肌', part: '臀部', equipment: 'gym', level: 2, pattern: 'hinge', focus: ['muscle','strength','tone'], tip: '上背靠凳，杠铃置于髋部，顶峰骨盆后倾、臀部收缩，下放有控制。' },
  { name: '上斜杠铃卧推', kind: 'compound', sub: '上胸', part: '胸部', equipment: 'gym', level: 2, pattern: 'push', focus: ['muscle','strength'], tip: '凳面 30–45 度，杠铃下放至锁骨附近，重点刺激上胸——凯圣王推日主项之一。' },
  { name: '下斜杠铃卧推', kind: 'compound', sub: '下胸', part: '胸部', equipment: 'gym', level: 2, pattern: 'push', focus: ['muscle','strength'], tip: '凳面下斜 15–25 度，杠铃轨迹指向下胸，推起时不锁死手肘。' },
  { name: '绳索夹胸', kind: 'isolation', sub: '中缝', part: '胸部', equipment: 'gym', level: 1, pattern: 'push', focus: ['muscle','tone'], tip: '滑轮调至中位，双臂向中间交叉夹，顶峰收缩 1–2 秒——高位练下胸、低位练上胸。' },
  { name: 'T 杠划船', kind: 'compound', sub: '上背', part: '背部', equipment: 'gym', level: 2, pattern: 'pull', focus: ['muscle','strength'], tip: '俯身握 T 杠，肘沿身体两侧后拉，肩胛骨主动后收，练背肌厚度与中下斜方肌。' },
  { name: '山羊挺身', kind: 'isolation', sub: '下背', part: '背部', equipment: 'gym', level: 1, pattern: 'hinge', focus: ['muscle','health','posture'], tip: '俯卧固定于罗马椅，用竖脊肌把上身抬起至与地面平行，不要过度后仰——谭成义腿日必练。' },
  { name: '引体向上', kind: 'compound', sub: '背阔', part: '背部', equipment: 'gym', level: 3, pattern: 'pull', focus: ['strength','muscle'], tip: '宽握正手，先沉肩再拉肘，拉至锁骨过杠；力量不足可用高位下拉过渡。' },
  { name: 'Y 字侧平举', kind: 'isolation', sub: '中束', part: '肩部', equipment: 'gym', level: 1, pattern: 'push', focus: ['muscle','tone','posture'], tip: '俯身双手举成 Y 字，向两侧平举至肩高，专注肩中束——凯圣王推日收尾动作。' },
  { name: '绳索侧平举', kind: 'isolation', sub: '中束', part: '肩部', equipment: 'gym', level: 1, pattern: 'push', focus: ['muscle','tone'], tip: '低位滑轮单手侧平举，全程保持张力，顶端不耸肩，改善溜肩。' },
  { name: '杠铃弯举', kind: 'isolation', sub: '肱二头', part: '手臂', equipment: 'gym', level: 1, pattern: 'pull', focus: ['muscle','tone'], tip: '大臂贴紧体侧不摆动，只靠前臂弯举，顶端稍停顿。' },
  { name: '仰卧臂屈伸（杠铃）', kind: 'isolation', sub: '肱三头', part: '手臂', equipment: 'gym', level: 2, pattern: 'push', focus: ['muscle','strength'], tip: '仰卧屈臂将杠铃置于额头上方，只伸肘不借力，专注三头长头。' },
  { name: '绳索体侧屈', kind: 'isolation', sub: '侧腹', part: '核心', equipment: 'gym', level: 1, pattern: 'core', focus: ['muscle','tone'], tip: '单手持铃侧屈，感受侧腹收缩，不要前后借力。' },
  { name: '站姿提踵', kind: 'isolation', sub: '小腿', part: '腿部', equipment: 'gym', level: 1, pattern: 'squat', focus: ['muscle','tone'], tip: '前脚掌踩踏板边缘，踮起到最高停 1 秒，缓慢下放充分拉伸。' },
  { name: '颈前深蹲', kind: 'compound', sub: '股四头', part: '腿部', equipment: 'gym', level: 2, pattern: 'squat', focus: ['muscle','strength'], tip: '杠铃置于颈前，躯干更直立，股四头刺激更强——凯圣王腿日主项。' },

  { name: '划船机', kind: 'cardio', sub: '全身', part: '全身', equipment: 'gym', level: 1, pattern: 'cardio', focus: ['fatloss','health','endurance'], tip: '先蹬腿再拉桨、回程顺序相反，背部挺直，全身协同有氧。' },
  { name: '动感单车', kind: 'cardio', sub: '全身', part: '全身', equipment: 'gym', level: 1, pattern: 'cardio', focus: ['fatloss','health','endurance'], tip: '坐姿稳定，阻力适中保持踏频 80–100 转/分，注意补水。' },

];

/* ---------- 2. 配置表 ---------- */
// 目标：每种目标有一套组数/次数/休息，并映射到动作库 focus 标签
// cardioRatio：有氧占比。增肌 / 力量以力量训练为主，不额外安排有氧；
// 减脂 / 耐力最需要有氧，塑形与健康安排少量有氧保心肺。
const GOALS = {
  fatloss:   { label:'减脂瘦身', sets:3, reps:'12–15 次', rest:'45 秒',  cardio:true,  cardioRatio:0.4,  tag:'fatloss' },
  muscle:    { label:'增大肌肉', sets:4, reps:'8–12 次',  rest:'90 秒',  cardio:false, cardioRatio:0,    tag:'muscle' },
  strength:  { label:'增强力量', sets:5, reps:'4–6 次',   rest:'150 秒', cardio:false, cardioRatio:0,    tag:'strength' },
  endurance: { label:'提升耐力', sets:3, reps:'15–20 次', rest:'30 秒',  cardio:true,  cardioRatio:0.5,  tag:'endurance' },
  tone:      { label:'塑形紧致', sets:3, reps:'12–15 次', rest:'60 秒',  cardio:false, cardioRatio:0.25, tag:'muscle' },
  posture:   { label:'改善体态', sets:3, reps:'12–15 次', rest:'60 秒',  cardio:false, cardioRatio:0.1,  tag:'posture' },
  health:    { label:'健康养生', sets:3, reps:'10–12 次', rest:'60 秒',  cardio:false, cardioRatio:0.2,  tag:'health' }
};
// 单次训练动作总数硬上限：再多会拖长训练时间、降低动作质量
const MAX_EXERCISES = 7;

// 处方表：动作类型（复合/孤立）× 主导目标 → 组数 / 次数 / 组间休息
// 依据：复合动作 4–6 组、休息 2–3 分钟；孤立动作 2–3 组、休息 60–90 秒；
//       力量低次长休、增肌中次中休、减脂塑形减组不减重量、耐力高次短休
const PRESCRIPTION = {
  compound: {
    strength:  { sets:5, reps:'4–6 次',   rest:'180 秒' },
    muscle:    { sets:4, reps:'8–10 次',  rest:'120 秒' },
    fatloss:   { sets:3, reps:'10–12 次', rest:'75 秒' },
    tone:      { sets:3, reps:'10–12 次', rest:'75 秒' },
    endurance: { sets:3, reps:'12–15 次', rest:'45 秒' },
    posture:   { sets:3, reps:'10–12 次', rest:'90 秒' },
    health:    { sets:3, reps:'10–12 次', rest:'90 秒' }
  },
  isolation: {
    strength:  { sets:3, reps:'8–10 次',  rest:'90 秒' },
    muscle:    { sets:3, reps:'10–12 次', rest:'75 秒' },
    fatloss:   { sets:2, reps:'12–15 次', rest:'45 秒' },
    tone:      { sets:3, reps:'12–15 次', rest:'45 秒' },
    endurance: { sets:2, reps:'15–20 次', rest:'30 秒' },
    posture:   { sets:2, reps:'12–15 次', rest:'60 秒' },
    health:    { sets:2, reps:'12–15 次', rest:'60 秒' }
  }
};
function getPrescription(ex, profile, primary) {
  if (ex.kind === 'cardio' || ex.pattern === 'cardio') {
    return { isCardio:true, sets:0, reps:'20–30 分钟', rest:'—' };
  }
  const kind = ex.kind === 'compound' ? 'compound' : 'isolation';
  const base = PRESCRIPTION[kind][primary] || PRESCRIPTION[kind].health;
  let sets = base.sets;
  const lv = lvIndex(profile.level);
  if (lv === 1) sets = Math.max(2, sets - 1);                          // 新手降 1 组起步
  if (lv === 3) sets = Math.min(kind === 'compound' ? 6 : 4, sets + 1); // 进阶最多复合 6 / 孤立 4
  if (ex.timed) return { isTimed:true, sets, reps:'30–45 秒', rest:base.rest };
  return { sets, reps:base.reps, rest:base.rest };
}

// 训练周期：决定阶段划分（分几段、每段周数、每段侧重）
const DURATIONS = {
  '1m': { label:'1 个月',  weeks:4,   phases:['适应期'] },
  '3m': { label:'3 个月',  weeks:12,  phases:['适应期','提升期','巩固期'] },
  '6m': { label:'6 个月',  weeks:24,  phases:['适应期','增量期','强化期','巩固期'] },
  '1y': { label:'1 年',    weeks:52,  phases:['适应期','增量期','强化期','平台突破期','巩固期'] },
  '5y': { label:'5 年+',   weeks:260, phases:['打基础','渐进超负荷','力量峰值','周期性调整','长期维持'] }
};

const LEVELS = { beginner:1, intermediate:2, advanced:3 };
const EQUIP_ORDER = { none:0, dumbbell:1, gym:2 };
const EQUIP_LABEL = { none:'徒手 / 无器材', home:'居家小器材', gym:'健身房' };
const GENDER_LABEL = { female:'女性', male:'男性' };
const DAY_LABEL = ['第 1 天','第 2 天','第 3 天','第 4 天','第 5 天','第 6 天'];

// 薄弱部位 → 细分部位（用于补强编排）
const FOCUS_MAP = {
  chest:    { part:'胸部', subs:['上胸','中胸','下胸','中缝'] },
  back:     { part:'背部', subs:['背阔','上背','下背'] },
  shoulder: { part:'肩部', subs:['前束','中束','后束'] },
  arm:      { part:'手臂', subs:['肱二头','肱三头','前臂'] },
  core:     { part:'核心', subs:['上腹','下腹','侧腹','整体'] },
  leg:      { part:'腿部', subs:['股四头','腘绳','小腿'] },
  glute:    { part:'臀部', subs:['臀大肌'] }
};

// 单次训练时长 → 动作数量（时长越长，安排的针对性动作越多）
const SESSION_TIMES = {
  '30': { label:'30 分钟',  min:30, count:4, hint:'精简高效，聚焦复合动作' },
  '45': { label:'45 分钟',  min:45, count:5, hint:'标准时长，覆盖主要肌群' },
  '60': { label:'60 分钟',  min:60, count:6, hint:'从容训练，可加入孤立动作' },
  '90': { label:'90 分钟+', min:90, count:7, hint:'充分训练，多角度细化刺激（单次最多 7 个动作）' }
};

// 是否练腿：yes 正常 / light 少量（每次最多 2 个腿部动作）/ no 不练（腿日改上肢、全程无腿部动作）
const LEGS_LABEL = { yes:'正常练腿', light:'少量练腿', no:'不练腿' };
// 腿部细分标签（臀部单列，不视为“练腿”，便于只想练臀的人群）
const LEG_SUBS = ['股四头', '腘绳', '小腿'];
// 腿部槽位被移除后，用来补位的上肢 / 核心细分槽位（不重复覆盖同一细分）
const UPPER_FILL_SLOTS = [
  {p:'push',s:'中胸'}, {p:'pull',s:'背阔'}, {p:'push',s:'上胸'}, {p:'pull',s:'上背'},
  {p:'push',s:'中束'}, {p:'pull',s:'后束'}, {p:'push',s:'肱三头'}, {p:'pull',s:'肱二头'},
  {p:'push',s:'前束'}, {p:'core',s:'上腹'}
];

// 训练日模板：每个槽位精确指定动作模式与细分部位
// 关键约束（依据 Dr.Mike / 容量处方）：同一细分部位在一次训练里只出现一次——
// 避免"中胸用杠铃+器械练两遍"的低效重复；胸部最多 4 个动作（上/中/下/中缝各有侧重）
// 每个槽位都是不同细分部位，让一次训练覆盖多个角度而非堆垃圾容量
const DAY_TEMPLATES = {
  full:  [ {p:'squat',s:'股四头'}, {p:'push',s:'中胸'}, {p:'pull',s:'背阔'}, {p:'hinge',s:'臀大肌'}, {p:'core',s:'上腹'}, {p:'push',s:'中束'}, {p:'hinge',s:'腘绳'}, {p:'squat',s:'小腿'} ],
  upper: [ {p:'push',s:'中胸'}, {p:'pull',s:'背阔'}, {p:'push',s:'上胸'}, {p:'pull',s:'上背'}, {p:'push',s:'中束'}, {p:'pull',s:'肱二头'}, {p:'push',s:'肱三头'}, {p:'pull',s:'后束'} ],
  lower: [ {p:'squat',s:'股四头'}, {p:'hinge',s:'臀大肌'}, {p:'hinge',s:'腘绳'}, {p:'squat',s:'小腿'}, {p:'hinge',s:'下背'}, {p:'core',s:'上腹'}, {p:'core',s:'侧腹'}, {p:'core',s:'下腹'} ],
  push:  [ {p:'push',s:'中胸'}, {p:'push',s:'上胸'}, {p:'push',s:'下胸'}, {p:'push',s:'中缝'}, {p:'push',s:'中束'}, {p:'push',s:'前束'}, {p:'push',s:'肱三头'} ],
  pull:  [ {p:'pull',s:'背阔'}, {p:'pull',s:'上背'}, {p:'pull',s:'后束'}, {p:'pull',s:'肱二头'}, {p:'pull',s:'下背'}, {p:'pull',s:'前臂'}, {p:'core',s:'下腹'} ],
  legs:  [ {p:'squat',s:'股四头'}, {p:'hinge',s:'臀大肌'}, {p:'hinge',s:'腘绳'}, {p:'squat',s:'小腿'}, {p:'hinge',s:'下背'}, {p:'core',s:'上腹'}, {p:'core',s:'侧腹'}, {p:'core',s:'下腹'} ]
};
const DAY_TEMPLATE_NAMES = { full:'全身日', upper:'上肢日', lower:'下肢日', push:'推日（胸肩三头）', pull:'拉日（背后束二头）', legs:'腿日' };

// 训练分化由「训练年限 + 每周天数」共同决定（依据谭成义/凯圣王及主流训练科学共识）
// 新手先全身建立动作模式；有基础才上下肢分化；进阶才推拉腿高频
const SPLIT_BY_LEVEL = {
  beginner: {
    2: ['full','full'],
    3: ['full','full','full'],
    4: ['full','upper','full','lower'],
    5: ['full','upper','full','lower','full'],
    6: ['upper','lower','upper','lower','full','full']
  },
  intermediate: {
    2: ['full','full'],
    3: ['push','pull','legs'],
    4: ['upper','lower','upper','lower'],
    5: ['push','pull','legs','upper','lower'],
    6: ['push','pull','legs','push','pull','legs']
  },
  advanced: {
    2: ['upper','lower'],
    3: ['push','pull','legs'],
    4: ['upper','lower','upper','lower'],
    5: ['push','pull','legs','upper','lower'],
    6: ['push','pull','legs','push','pull','legs']
  }
};
function splitName(level, days, keys) {
  const t = keys || SPLIT_BY_LEVEL[level][days];
  const set = new Set(t);
  if (set.size === 1) return { full:'全身训练', upper:'上肢训练', lower:'下肢训练', push:'推类训练', pull:'拉类训练', legs:'腿部训练' }[t[0]] + ' ×' + days;
  if (set.has('push') && set.has('pull') && set.has('legs')) return days === 6 ? '推拉腿分化 ×2' : '推拉腿分化';
  if (set.has('push') && set.has('pull') && set.has('upper')) return '上肢推拉分化';
  if (set.has('upper') && set.has('lower')) return days >= 5 ? '上下肢 + 全身结合' : '上下肢分化';
  return '全身 + 分化结合';
}

/* ---------- 3. 推荐引擎 ---------- */
let variation = 0; // “换一批”变体计数

const AVOID_MAP = {
  knee: ['腿部'],
  shoulder: ['肩部','胸部'],
  waist: ['核心']
};

// 器材许可：健身房用户只排健身房器械动作，不再混入徒手；居家可用哑铃+徒手；徒手仅徒手
function equipAllowed(ex, userEquip) {
  if (userEquip === 'gym') return ex.equipment === 'gym';
  if (userEquip === 'home') return ex.equipment === 'dumbbell' || ex.equipment === 'none';
  return ex.equipment === 'none';
}
function isAvoided(ex, profile) {
  for (const a of profile.avoid) if (AVOID_MAP[a] && AVOID_MAP[a].includes(ex.part)) return true;
  return false;
}
// 是否属于“练腿”动作：腿部大部位，或股四头/腘绳/小腿细分
function isLegEx(ex) { return ex.part === '腿部' || (ex.sub && LEG_SUBS.includes(ex.sub)); }
// 用户选择“不练腿”时，所有候选池都排除腿部动作；少量练腿在槽位与计数上限制
function legAllowed(ex, profile) { return !(profile.legs === 'no' && isLegEx(ex)); }

// 主目标：多选中取第一个作为主导（按 GOALS 定义顺序），其余作为辅助目标
function primaryGoal(profile) {
  for (const key of Object.keys(GOALS)) if (profile.goals.includes(key)) return key;
  return 'health';
}
function lvIndex(level) { return LEVELS[level] || 1; }

function scoreExercise(ex, profile) {
  let score = 0;
  const userLevel = LEVELS[profile.level];
  const primary = primaryGoal(profile);

  // “换一批”扰动
  if (variation > 0) score += ((EXERCISES.indexOf(ex) * 7 + variation * 11) % 4) * 0.8;

  // 目标匹配：主导目标权重最高，其他被选目标也有加分
  profile.goals.forEach((g, i) => {
    if (ex.focus.includes(g)) score += (i === 0 ? 7 : 4);
  });
  if (ex.focus.includes('health')) score += 1;

  // 薄弱部位补强：细分部位命中权重最高，其次大部位
  for (const f of profile.focus) {
    const map = FOCUS_MAP[f];
    if (!map) continue;
    if (ex.sub && map.subs.includes(ex.sub)) score += 10;
    else if (ex.part === map.part) score += 8;
  }

  // 性别微调：女性偏臀腿/核心，男性偏胸背/肩臂（轻微，不排斥其他）
  if (profile.gender === 'female' && ['臀部','腿部','核心'].includes(ex.part)) score += 1.5;
  if (profile.gender === 'male' && ['胸部','背部','肩部','手臂'].includes(ex.part)) score += 1.5;

  // 难度匹配
  score += 3 - Math.abs(ex.level - userLevel) * 1.5;
  if (ex.level > userLevel + 1) score -= 20;

  // 器材匹配：健身房用户严格排除徒手/哑铃动作；居家/徒手按可用范围
  if (!equipAllowed(ex, profile.equipment)) score -= 100;
  else {
    const need = EQUIP_ORDER[ex.equipment === 'home' ? 'none' : ex.equipment];
    score += -need * 0.15; // 轻微偏好门槛低的动作
  }

  // 避让部位
  if (isAvoided(ex, profile)) score -= 100;

  // 复合动作在增肌/力量目标下加权
  if ((primary === 'muscle' || primary === 'strength') && ex.level >= 2) score += 1;
  // 训练年限阶段侧重
  score += stagePreference(ex, profile.level);
  return score;
}

// 按训练年限/经验阶段推荐动作侧重（来自谭成义、凯圣王训练体系）
// 新手期：优先基础复合动作建立动作模式；进阶期：可安排更高难度的孤立/技巧动作
function stagePreference(ex, level) {
  if (level === 'beginner' && ex.level >= 2) return -0.8;  // 新手少练高难动作
  if (level === 'beginner' && ex.level === 1) return 0.6;  // 新手优先基础动作
  if (level === 'advanced' && ex.level === 3) return 0.8;  // 进阶可用高阶动作
  return 0;
}

// 为指定动作找"平替"：核心是练到同一个目标部位，而非随便换一个动作
// 优先级：同细分部位 > 同大部位 > 同动作模式；允许跨器材（如健身房某器械缺失→哑铃/徒手同部位动作）
// 仍避开不适部位、排除当前计划里已有的动作
function findAlternatives(ex, profile, usedNames) {
  // 有氧动作：优先同器材档有氧池平替，不足时允许跨器材（有氧器械缺失也能换）
  if (ex.kind === 'cardio') {
    const sameEq = EXERCISES.filter(e =>
      e.kind === 'cardio' && e.name !== ex.name &&
      !usedNames.has(e.name) && !isAvoided(e, profile) &&
      equipAllowed(e, profile.equipment)
    );
    if (sameEq.length) return sameEq.slice(0, 4);
    return EXERCISES.filter(e =>
      e.kind === 'cardio' && e.name !== ex.name && !isAvoided(e, profile)
    ).slice(0, 4);
  }
  const rank = (e) => {
    let s = 0;
    if (e.sub && e.sub === ex.sub) s += 12;        // 同一细分部位（上胸→上胸）最佳平替
    else if (e.part === ex.part) s += 7;           // 同一大部位（胸→胸）
    if (e.pattern === ex.pattern) s += 2;          // 动作模式相近加分
    if (e.level === ex.level) s += 2;              // 难度接近
    s += scoreExercise(e, profile) * 0.15;         // 目标/阶段匹配做轻微调节
    return s;
  };
  const pool = EXERCISES.filter(e =>
    e.name !== ex.name &&
    !usedNames.has(e.name) &&
    !isAvoided(e, profile) &&
    legAllowed(e, profile) &&                      // 不练腿时平替也不能换回腿部动作
    e.kind !== 'cardio'                            // 力量动作只换力量动作
  ).map(e => ({ ex: e, s: rank(e) }))
   .filter(x => x.s > 0)
   .sort((a, b) => b.s - a.s);

  // 分级取：先用同细分部位的平替，不足再用同大部位补足，保证练到同一块肌肉
  const sameSub = pool.filter(x => x.ex.sub === ex.sub).map(x => x.ex);
  const samePart = pool.filter(x => x.ex.part === ex.part && x.ex.sub !== ex.sub).map(x => x.ex);
  const result = [...sameSub, ...samePart].slice(0, 4);
  if (result.length) return result;

  // 极端兜底：目标部位被避让 / 器材掏空，给同动作模式的合规动作（功能最接近的替代）
  const fallback = EXERCISES.filter(e =>
    e.name !== ex.name && !usedNames.has(e.name) && !isAvoided(e, profile) && legAllowed(e, profile) &&
    e.kind !== 'cardio' && e.pattern === ex.pattern
  ).map(e => ({ ex: e, s: (e.level === ex.level ? 2 : 0) + scoreExercise(e, profile) * 0.3 }))
   .filter(x => x.s > -30).sort((a, b) => b.s - a.s).map(x => x.ex);
  if (fallback.length) return fallback.slice(0, 4);
  // 最后手段：任意合规力量动作
  return EXERCISES.filter(e =>
    e.name !== ex.name && !usedNames.has(e.name) && !isAvoided(e, profile) && legAllowed(e, profile) && e.kind !== 'cardio'
  ).slice(0, 4);
}

// 细分部位 → 大部位（用于器材档缺该细分动作时的兜底）
const SUB_TO_PART = {
  '上胸':'胸部','中胸':'胸部','下胸':'胸部','中缝':'胸部','背阔':'背部','上背':'背部','下背':'背部',
  '前束':'肩部','中束':'肩部','后束':'肩部','肱二头':'手臂','肱三头':'手臂','前臂':'手臂',
  '股四头':'腿部','腘绳':'腿部','小腿':'腿部','臀大肌':'臀部','上腹':'核心','下腹':'核心','侧腹':'核心','整体':'核心'
};

// 按"训练日模板"逐槽位挑动作：优先精确匹配细分部位，缺档时逐级兜底
// usedSubs 保证同一细分部位在一次训练里只出现一次（避免同部位两个器械重复练）
function pickExercises(slots, profile, usedNames, dayIndex, usedSubs, legBudget) {
  const picked = [];
  usedSubs = usedSubs || new Set();
  legBudget = legBudget === undefined ? Infinity : legBudget;
  let legsUsed = 0;
  const baseOk = ex => !usedNames.has(ex.name) && equipAllowed(ex, profile.equipment) &&
    !isAvoided(ex, profile) && legAllowed(ex, profile) && ex.kind !== 'cardio' &&
    (isLegEx(ex) ? legsUsed < legBudget : true);
  const rank = list => list.map(ex => ({ ex, s: scoreExercise(ex, profile) }))
    .filter(x => x.s > -50).sort((a, b) => b.s - a.s);
  // 细分部位去重：已被占用的 sub 不再重复安排
  const subFree = ex => !ex.sub || !usedSubs.has(ex.sub);

  for (const slot of slots) {
    // ① 精确命中：模式 + 细分部位（保证上胸/下胸/中缝等针对性覆盖）
    let candidates = rank(EXERCISES.filter(ex => baseOk(ex) && subFree(ex) && ex.pattern === slot.p && ex.sub === slot.s));
    // ② 该器材档无此细分动作 → 放宽到同模式其它细分（仍避开已用细分）
    if (!candidates.length) candidates = rank(EXERCISES.filter(ex => baseOk(ex) && subFree(ex) && ex.pattern === slot.p));
    // ③ 同模式也被掏空 → 放宽到同大部位（如徒手无"前束"隔离动作时用推类胸部动作）
    if (!candidates.length) {
      const part = SUB_TO_PART[slot.s];
      candidates = rank(EXERCISES.filter(ex => baseOk(ex) && subFree(ex) && part && ex.part === part));
    }
    // ④ 仍为空：跨到任意未用细分的合规动作，保证"同部位不重复"的底线
    if (!candidates.length) candidates = rank(EXERCISES.filter(ex => baseOk(ex) && subFree(ex)));
    // ⑤ 极端兜底（细分全被占用/避让掏空）：才接受重复，杜绝空白日
    if (!candidates.length) candidates = rank(EXERCISES.filter(ex => baseOk(ex)));
    if (candidates.length) {
      const top = candidates.slice(0, Math.min(3, candidates.length));
      const choice = top[(dayIndex + variation) % top.length];
      picked.push(choice.ex);
      usedNames.add(choice.ex.name);
      if (choice.ex.sub) usedSubs.add(choice.ex.sub);
      if (isLegEx(choice.ex)) legsUsed++;
    }
  }
  return picked;
}

// 挑有氧动作：按器材档可用池轮换，先力量后有氧安排
function pickCardio(count, profile, dayIndex, usedNames) {
  const pool = EXERCISES.filter(ex =>
    ex.kind === 'cardio' && equipAllowed(ex, profile.equipment) && !isAvoided(ex, profile)
  );
  const picked = [];
  if (!pool.length) return picked;
  // 从轮换起点开始取，取满或在池内循环一圈为止，保证同日不重名
  const start = (dayIndex + variation) % pool.length;
  for (let k = 0; k < count && k < pool.length; k++) {
    const ex = pool[(start + k) % pool.length];
    picked.push(ex);
    usedNames.add(ex.name);
  }
  return picked;
}

// 生成分阶段规划：把总周数平均分配到各阶段，并给出每阶段侧重
function buildPhases(profile) {
  const dur = DURATIONS[profile.duration];
  const n = dur.phases.length;
  const base = Math.floor(dur.weeks / n);
  const remainder = dur.weeks % n;
  const hints = [
    '建立动作模式，先求标准不求重，复合动作留 1–2 次余力',
    '渐进超负荷：能标准做满就小幅加重或加次数',
    '强化薄弱环节，加入单侧训练与后束 / 后链补强',
    '巩固成果，安排减载周（容量减半）控制疲劳',
    '周期化调整，长期维持并定期评估进步'
  ];
  let cursor = 1;
  return dur.phases.map((name, i) => {
    const span = base + (i < remainder ? 1 : 0);
    const start = cursor, end = cursor + span - 1;
    cursor = end + 1;
    return { name, start, end, hint: hints[i % hints.length] };
  });
}

function generatePlan(profile) {
  // 不练腿：腿日 / 下肢日改为上肢日；全身日里的腿部槽位换成上肢细分
  let templateKeys = SPLIT_BY_LEVEL[profile.level][profile.days].slice();
  if (profile.legs === 'no') {
    templateKeys = templateKeys.map(k => (k === 'legs' || k === 'lower') ? 'upper' : k);
  }
  const primary = primaryGoal(profile);
  const goalCfg = GOALS[primary];
  const session = SESSION_TIMES[profile.session] || SESSION_TIMES['45'];
  const count = Math.min(session.count, MAX_EXERCISES);
  const split = splitName(profile.level, profile.days, templateKeys) + (profile.legs === 'no' ? '（不含腿）' : '');
  // 补强部位对应的细分标签，编排时优先前置（不练腿时忽略腿部补强）
  const focusSubs = new Set();
  for (const f of profile.focus) {
    const map = FOCUS_MAP[f];
    if (map && !(profile.legs === 'no' && f === 'leg')) map.subs.forEach(s => focusSubs.add(s));
  }
  // 有氧数：按目标比例划槽位，且至少保留 3 个力量动作；增肌 / 力量比例为 0，不安排有氧
  const cardioCount = Math.min(Math.round(count * goalCfg.cardioRatio), Math.max(0, count - 3));
  const legBudget = profile.legs === 'no' ? 0 : (profile.legs === 'light' ? 2 : Infinity);
  const days = templateKeys.map((key, i) => {
    let slots = DAY_TEMPLATES[key].slice(0, count);
    // 按练腿偏好处理腿部槽位，并用上肢细分补位，保持每天动作数量不变
    const legSlots = slots.filter(s => LEG_SUBS.includes(s.s));
    let keepLeg = legSlots;
    if (profile.legs === 'no') keepLeg = [];
    else if (profile.legs === 'light') keepLeg = legSlots.slice(0, 2);
    const dropLeg = new Set(legSlots.filter(s => !keepLeg.includes(s)).map(s => s.s));
    slots = slots.filter(s => !dropLeg.has(s.s));
    const slotSubs = new Set(slots.map(s => s.s));
    for (const f of UPPER_FILL_SLOTS) {
      if (slots.length >= count) break;
      if (!slotSubs.has(f.s)) { slots.push(f); slotSubs.add(f.s); }
    }
    // 补强优先：薄弱部位对应细分部位的槽位提到前面
    slots = [...slots.filter(s => focusSubs.has(s.s)), ...slots.filter(s => !focusSubs.has(s.s))];
    // 划出末尾若干槽位给有氧（减脂/塑形/耐力/健康才安排），力量在前、有氧在后
    const strengthSlots = slots.slice(0, Math.max(1, slots.length - cardioCount));
    const used = new Set(), usedSubs = new Set();
    let list = pickExercises(strengthSlots, profile, used, i, usedSubs, legBudget);
    if (cardioCount > 0) {
      const cardioEx = pickCardio(cardioCount, profile, i, used);
      list = [...list, ...cardioEx];
    }
    // 单次训练动作总数硬上限
    list = list.slice(0, MAX_EXERCISES);
    // 每个动作绑定自己的处方（组数/次数/休息），复合与孤立不再一刀切
    list.forEach(ex => { ex.rx = getPrescription(ex, profile, primary); });
    return {
      title: split + ' · ' + DAY_LABEL[i] + '（' + DAY_TEMPLATE_NAMES[key] + '）',
      exercises: list,
      minutes: session.min,
      template: key,
      cardioCount: list.filter(e => e.kind === 'cardio').length
    };
  });
  const phases = buildPhases(profile);
  return { days, goalCfg, profile, phases, primary, session, split, cardioCount: days[0].cardioCount, maxExercises: MAX_EXERCISES };
}

// 力量:有氧 比例的通俗说明（依据目标与划出的有氧槽位数）
function goalRatioText(primary, cardioCount) {
  if (!cardioCount) return '';
  const r = GOALS[primary].cardioRatio;
  if (r >= 0.45) return '约 1:1（力量与有氧并重，适合减脂 / 耐力）';
  if (r >= 0.35) return '约 6:4（力量为主、有氧较多，适合减脂塑形）';
  if (r >= 0.2) return '约 7:3（力量为主、有氧为辅，适合塑形）';
  return '约 8:2（力量为主、少量有氧保心肺）';
}

function buildTip(profile, plan) {
  const goalsText = profile.goals.map(g => GOALS[g].label).join(' + ');
  const e = EQUIP_LABEL[profile.equipment];
  const lv = { beginner:'新手阶段', intermediate:'有基础阶段', advanced:'进阶阶段' }[profile.level];
  const dur = DURATIONS[profile.duration];
  let tip = `✦ 智能建议：你的目标是「${goalsText}」，${GENDER_LABEL[profile.gender]}、${lv}、每周 ${profile.days} 天、每次约 ${plan.session.min} 分钟、${e}，计划周期 ${dur.label}（共 ${dur.weeks} 周，分 ${plan.phases.length} 阶段推进）。`;
  const splitReason = {
    beginner:'新手期不宜一上来就高频分化，先用全身训练打磨动作模式、建立基础力量，每组留 1–2 次余力',
    intermediate:'有基础后改为上下肢 / 推拉腿分化，让同一肌群每周获得 2 次有效刺激',
    advanced:'进阶后用推拉腿高频或部位分化，配合周期化与减载周持续突破平台'
  };
  tip += ` 依据你的训练年限采用「${plan.split}」：${splitReason[profile.level]}。`;
  tip += ` 每个训练日按细分部位编排（如胸部分上胸 / 中胸 / 下胸 / 中缝多角度刺激），同一部位只安排一次、不重复用不同器械练同一块肌肉，避免无效的"垃圾容量"。`;
  tip += ' 组数与次数按动作性质区别对待：复合动作（深蹲 / 卧推等）组数多、次数少、休息 2–3 分钟；孤立动作（飞鸟 / 侧平举等）组数少、次数多、休息 60–90 秒。';
  const primary = plan.primary;
  const ratio = goalRatioText(primary, plan.cardioCount);
  if (ratio) tip += ` 本计划力量与有氧按约 ${ratio} 安排，先力量后有氧——力量保住肌肉、有氧提升热量缺口，两者配合减脂塑形效果最好。`;
  else if (primary === 'muscle' || primary === 'strength') tip += ' 增肌 / 力量目标以负重力量训练为主，本计划不安排有氧，把时间和恢复留给主项训练。';
  if (primary === 'fatloss') tip += ' 减脂期减的是组数而非重量，组间休息较短，建议心率维持在最大心率的 60%–70%，并配合饮食控制。';
  else if (primary === 'muscle') tip += ' 增肌期每组接近力竭但动作不变形，保证蛋白质摄入与充足睡眠。';
  else if (primary === 'strength') tip += ' 力量训练组间隔较长，注重大重量下的动作规范，建议有保护者。';
  else if (primary === 'endurance') tip += ' 耐力训练节奏偏快、组间短，注意循序渐进提升心肺负荷。';
  else if (primary === 'posture') tip += ' 体态改善重在坚持，配合拉伸胸肌与强化上背，日常注意坐姿。';
  else tip += ' 以养成习惯为主，动作质量优先于数量，感觉吃力可降低组数。';
  // 融入谭成义 / 凯圣王训练体系的核心原则，按训练阶段给出不同侧重
  if (lvIndex(profile.level) === 1) {
    tip += ' 【新手期策略】优先建立动作模式：先标准后加重，复合动作每组留 1–2 次余力（RPE 7–8），不必练到力竭；重量能标准做满次数时，下次再小幅加 1.25–2.5kg。';
  } else if (lvIndex(profile.level) === 2) {
    tip += ' 【进阶期策略】采用推 / 拉 / 腿分化思路，复合动作为主、孤立动作为辅；加入单侧训练纠正左右力量差，每周争取小幅渐进超负荷。';
  } else {
    tip += ' 【高阶策略】可按推拉腿高频或五分化安排，复合动作冲主项、孤立动作补细节；每 3 周安排 1 周减载（容量减半）避免过度训练。';
  }
  if (profile.focus.length) {
    const parts = profile.focus.map(f => FOCUS_MAP[f].part).join('、');
    tip += ` 已重点加强你的薄弱部位：${parts}，这些部位在编排中获得了更高优先级与训练量。`;
  }
  if (profile.avoid.length) tip += ' 已避开对你不适部位压力较大的动作，训练中如有疼痛请立即停止。';
  if (profile.legs === 'no') tip += ' 按你的偏好已完全跳过腿部：腿日改为上肢训练，所有动作与平替都不含腿部；建议日常用散步、拉伸维持基本活动能力。';
  else if (profile.legs === 'light') tip += ' 按你的偏好每次最多安排 2 个腿部动作，其余槽位补上肢，保留基础腿部刺激又不占太多时间。';
  tip += ` 每次约 ${plan.days[0].minutes} 分钟、不超过 ${plan.maxExercises} 个动作，训练前热身 5–10 分钟。`;
  return tip;
}

/* ---------- 4. 界面交互 ---------- */
const form = document.getElementById('planForm');
const steps = [...document.querySelectorAll('.q-step')];
const progressSteps = [...document.querySelectorAll('.progress-step')];
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const errorBox = document.getElementById('formError');
let current = 1;
let profile = null;

function renderStep() {
  steps.forEach(s => s.classList.toggle('active', +s.dataset.step === current));
  progressSteps.forEach(p => {
    const n = +p.dataset.step;
    p.classList.toggle('active', n === current);
    p.classList.toggle('done', n < current);
  });
  prevBtn.hidden = current === 1;
  nextBtn.hidden = current === steps.length;
  submitBtn.hidden = current !== steps.length;
  errorBox.hidden = true;
}
function validateStep(n) {
  const step = steps.find(s => +s.dataset.step === n);
  const field = step.querySelector('[data-field]').dataset.field;
  // 可跳过的步骤：补强、避让
  if (field === 'avoid' || field === 'focus') {
    const noneOpt = form.querySelector(`[name="${field}"][value="none"]`);
    if (noneOpt) noneOpt.checked = false;
    return true;
  }
  const chosen = form.querySelectorAll(`[name="${field}"]:checked`);
  if (!chosen.length) { errorBox.hidden = false; return false; }
  // 多选中若同时选了“没有特别目标”，则清除该互斥项
  if (field === 'goal') {
    const noneOpt = form.querySelector('[name="goal"][value="none"]');
    if (noneOpt && chosen.length > 1 && noneOpt.checked) noneOpt.checked = false;
  }
  return true;
}
nextBtn.addEventListener('click', () => { if (validateStep(current)) { current++; renderStep(); } });
prevBtn.addEventListener('click', () => { current--; renderStep(); });

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!validateStep(current)) return;
  const data = new FormData(form);
  profile = {
    goals: data.getAll('goal').filter(v => v !== 'none'),
    duration: data.get('duration'),
    gender: data.get('gender'),
    level: data.get('level'),
    days: +data.get('days'),
    session: data.get('session'),
    equipment: data.get('equipment'),
    focus: data.getAll('focus').filter(v => v !== 'none'),
    avoid: data.getAll('avoid').filter(v => v !== 'none'),
    legs: data.get('legs') || 'yes'
  };
  if (!profile.goals.length) profile.goals = ['health'];
  variation = 0;
  showResult();
});

function showResult() {
  const plan = generatePlan(profile);
  currentPlan = plan;
  const goalsText = profile.goals.map(g => GOALS[g].label).join(' + ');
  document.getElementById('resultTitle').textContent = `${goalsText} · ${plan.split}`;
  const ratioStr = plan.cardioCount ? ` · 力量:有氧 ${goalRatioText(plan.primary, plan.cardioCount).split('（')[0]}` : '';
  document.getElementById('resultSummary').textContent =
    `${DURATIONS[profile.duration].label}计划 · 每周 ${profile.days} 练 · 每次 ${plan.session.label} · ${GENDER_LABEL[profile.gender]} · ${EQUIP_LABEL[profile.equipment]} · ${LEGS_LABEL[profile.legs] || '正常练腿'}${ratioStr}`;
  document.getElementById('aiTip').textContent = buildTip(profile, plan);

  // 渲染分阶段规划
  if (plan.phases.length > 1) {
    document.getElementById('phasePanel').hidden = false;
    document.getElementById('phaseDurationLabel').textContent = `（${DURATIONS[profile.duration].label} · 共 ${DURATIONS[profile.duration].weeks} 周）`;
    document.getElementById('phaseList').innerHTML = plan.phases.map((p, i) => `
      <div class="phase-item">
        <div class="phase-badge">阶段 ${i + 1}</div>
        <div class="phase-body"><b>${p.name}</b><span>第 ${p.start}–${p.end} 周 · ${p.hint}</span></div>
      </div>`).join('');
  } else {
    document.getElementById('phasePanel').hidden = true;
  }

  const tabs = document.getElementById('dayTabs');
  tabs.innerHTML = plan.days.map((d, i) =>
    `<button class="day-tab ${i === 0 ? 'active' : ''}" data-i="${i}" role="tab">${DAY_LABEL[i]}</button>`).join('');
  tabs.querySelectorAll('.day-tab').forEach(btn => btn.addEventListener('click', () => {
    tabs.querySelectorAll('.day-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderDay(plan, +btn.dataset.i);
  }));
  renderDay(plan, 0);
  document.getElementById('result').hidden = false;
  document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
}

let activeDay = 0; // 当前展示的训练日索引

function renderDay(plan, i) {
  activeDay = i;
  const day = plan.days[i];
  const cfg = plan.goalCfg;
  const focusParts = plan.profile.focus.map(f => FOCUS_MAP[f].part);
  const focusSubs = new Set();
  plan.profile.focus.forEach(f => (FOCUS_MAP[f] ? FOCUS_MAP[f].subs : []).forEach(s => focusSubs.add(s)));
  const html = day.exercises.map((ex, idx) => {
    const isFocus = focusParts.includes(ex.part) || focusSubs.has(ex.sub);
    const badge = isFocus ? '<span class="focus-badge">重点补强</span>' : '';
    const animLabel = (window.DemoAnim && DemoAnim.getAnimLabel(ex)) || '动作示意';
    const animSvg = (window.DemoAnim && DemoAnim.getAnimSvg(ex)) || '';
    const coaches = (window.DemoAnim && DemoAnim.getCoaches(ex)) || [];
    const coachHtml = coaches.length
      ? `<div class="coach-line">跟学博主：<b>${coaches.map(c => c.name).join(' / ')}</b><small>${coaches.map(c => c.good).join(' · ')}</small></div>`
      : '';
    const rx = ex.rx || cfg;
    const kindLabel = ex.kind === 'cardio' ? '<span class="kind-tag cardio">有氧</span>'
      : ex.kind === 'compound' ? '<span class="kind-tag compound">复合</span>'
      : '<span class="kind-tag iso">孤立</span>';
    const presc = rx.isCardio
      ? `<b>${rx.reps}</b><small>先力量后有氧</small>`
      : `<b>${rx.sets} × ${rx.reps}</b><small>休息 ${rx.rest}</small>`;
    const replaceLabel = ex.kind === 'cardio' ? '⇄ 换一个有氧动作' : `⇄ 换一个练「${ex.sub || ex.part}」的平替`;
    return `
    <div class="exercise" data-idx="${idx}">
      <div class="exercise-main">
        <span class="ex-index">${idx + 1}</span>
        <div><div class="ex-name">${ex.name}${badge}${kindLabel}</div><div class="ex-meta">${ex.part}${ex.sub && ex.sub !== '全身' && ex.sub !== '整体' ? ' · ' + ex.sub : ''} · ${EQUIP_LABEL[ex.equipment] === '徒手 / 无器材' ? '徒手' : EQUIP_LABEL[ex.equipment]}</div></div>
        <div class="ex-presc">${presc}</div>
        <span class="ex-toggle">要点 ▾</span>
      </div>
      <div class="ex-detail">
        <div class="ex-demo"><div class="demo-frame">${animSvg}</div><span class="demo-label">${animLabel}</span></div>
        <div class="ex-detail-text">
          <p class="ex-tip-text">${ex.tip}</p>
          ${coachHtml}
          <button type="button" class="replace-btn" data-day="${i}" data-idx="${idx}">${replaceLabel}</button>
        </div>
      </div>
    </div>`;
  }).join('');
  const cardioNote = day.cardioCount
    ? ` · 力量 ${day.exercises.length - day.cardioCount} + 有氧 ${day.cardioCount}` : '';
  document.getElementById('dayContent').innerHTML =
    `<div class="day-head"><h3>${day.title}</h3><span>约 ${day.minutes} 分钟 · 共 ${day.exercises.length} 个动作${cardioNote}</span></div>
     <div class="exercise-list">${html}</div>`;
  document.querySelectorAll('.exercise-main').forEach(m => m.addEventListener('click', () => m.parentElement.classList.toggle('open')));
  document.querySelectorAll('.replace-btn').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    replaceExercise(+b.dataset.day, +b.dataset.idx);
  }));
}

// 替换某个动作：在同模式 / 同器材 / 难度相近的候选里轮换
function replaceExercise(dayIdx, exIdx) {
  if (!currentPlan) return;
  const plan = currentPlan;
  const day = plan.days[dayIdx];
  const old = day.exercises[exIdx];
  const usedNames = new Set();
  plan.days.forEach(d => d.exercises.forEach(e => usedNames.add(e.name)));
  const alts = findAlternatives(old, profile, usedNames);
  if (!alts.length) { alert('暂时没有可替换的同类动作。'); return; }
  // 少量练腿：若当天已有 2 个腿部动作，平替不再额外增加腿部动作
  const legCount = day.exercises.filter(isLegEx).length;
  const pool = alts.filter(a => !(profile.legs === 'light' && isLegEx(a) && !isLegEx(old) && legCount >= 2));
  const usable = pool.length ? pool : alts;
  // 用轮换计数在同一批候选间切换
  if (!replaceCounters[`${dayIdx}-${exIdx}`]) replaceCounters[`${dayIdx}-${exIdx}`] = 0;
  const pick = usable[replaceCounters[`${dayIdx}-${exIdx}`] % usable.length];
  replaceCounters[`${dayIdx}-${exIdx}`]++;
  // 新动作可能复合/孤立类型不同，重新计算它的组数/次数/休息
  pick.rx = getPrescription(pick, profile, plan.primary);
  day.exercises[exIdx] = pick;
  renderDay(plan, dayIdx);
}
const replaceCounters = {};

let currentPlan = null;
document.getElementById('regenBtn').addEventListener('click', () => {
  if (!profile) return;
  variation++;
  for (const k in replaceCounters) delete replaceCounters[k];
  const plan = generatePlan(profile);
  currentPlan = plan;
  document.getElementById('aiTip').textContent = buildTip(profile, plan) + '（已为你更换一批动作）';
  const tabs = document.getElementById('dayTabs');
  tabs.querySelectorAll('.day-tab').forEach((btn, i) => {
    btn.classList.toggle('active', i === 0);
    btn.onclick = () => {
      tabs.querySelectorAll('.day-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderDay(plan, i);
    };
  });
  renderDay(plan, 0);
});

document.getElementById('saveBtn').addEventListener('click', () => {
  if (!profile) return;
  try {
    localStorage.setItem('fitplan_last', JSON.stringify({ profile, time: new Date().toISOString() }));
    const btn = document.getElementById('saveBtn');
    btn.textContent = '✓ 已保存';
    setTimeout(() => btn.textContent = '保存计划', 2000);
  } catch (err) { alert('当前浏览器不支持本地保存。'); }
});
