const fs = require('fs');
const vm = require('vm');
let src = fs.readFileSync('app.js', 'utf8').split('/* ---------- 4. 界面交互 ---------- */')[0];
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(src + '\nthis.E={generatePlan,findAlternatives,equipAllowed,getPrescription,goalRatioText,EXERCISES,SPLIT_BY_LEVEL,DAY_TEMPLATES,FOCUS_MAP,SESSION_TIMES,splitName,GOALS,MAX_EXERCISES,LEG_SUBS,isLegEx};', ctx);
const E = ctx.E;
const { generatePlan, findAlternatives, equipAllowed, getPrescription, goalRatioText,
  EXERCISES, SPLIT_BY_LEVEL, FOCUS_MAP, SESSION_TIMES, splitName, GOALS, MAX_EXERCISES, LEG_SUBS, isLegEx } = E;

// 载入动画模块
const animCtx = { window: {} };
vm.createContext(animCtx);
vm.runInContext(fs.readFileSync('animate.js', 'utf8'), animCtx);
const DemoAnim = animCtx.window.DemoAnim;

const fails = [];
const goalSets = [['fatloss'],['muscle'],['strength'],['endurance'],['tone'],['posture'],['health'],['fatloss','muscle'],['posture','tone']];
const focusSets = [[],['chest'],['leg','glute'],['back','shoulder','core'],['arm','chest','leg']];
const avoidSets = [[],['knee'],['shoulder'],['waist'],['knee','waist']];
const legsSets = ['yes','light','no'];
const durations = ['1m','3m','6m','1y','5y'];
const expectWeeks = { '1m':4,'3m':12,'6m':24,'1y':52,'5y':260 };

let tested = 0, gi=0, fi=0, ai=0, di=0, li=0;
for (const goals of goalSets)
  for (const level of ['beginner','intermediate','advanced'])
    for (const days of [2,3,4,5,6])
      for (const session of ['30','45','60','90'])
        for (const equipment of ['none','home','gym']) {
          const duration = durations[di++ % durations.length];
          const focus = focusSets[fi++ % focusSets.length];
          const avoid = avoidSets[ai++ % avoidSets.length];
          const gender = ['female','male'][gi++ % 2];
          const legs = legsSets[li++ % legsSets.length];
          const profile = { goals, level, days, session, equipment, duration, gender, focus, avoid, legs };
          try {
            const plan = generatePlan(profile);
            if (plan.days.length !== days) fails.push('day count mismatch');
            let totalWeeks = 0;
            for (const p of plan.phases) {
              totalWeeks += p.end - p.start + 1;
              if (p.start > p.end) fails.push('bad phase range');
            }
            if (totalWeeks !== expectWeeks[duration]) fails.push(`weeks mismatch ${totalWeeks}!=${expectWeeks[duration]}`);
            for (const d of plan.days) {
              if (d.exercises.length === 0) fails.push(`empty day ${goals}/${level}/${days}/${session}/${equipment}`);
              if (d.exercises.length > MAX_EXERCISES) fails.push(`too many exercises ${d.exercises.length} > ${MAX_EXERCISES}`);
              const names = d.exercises.map(e => e.name);
              if (new Set(names).size !== names.length) fails.push('duplicate exercise in day');
              // 细分部位不重复（力量动作）
              const subs = d.exercises.filter(e=>e.kind!=='cardio' && e.sub).map(e=>e.sub);
              if (new Set(subs).size !== subs.length) fails.push(`duplicate sub in day: ${subs.join(',')}`);
              // 练腿偏好
              const legCount = d.exercises.filter(isLegEx).length;
              if (legs === 'no' && legCount) fails.push(`legs=no but has leg exercise: ${d.exercises.filter(isLegEx).map(e=>e.name).join(',')}`);
              if (legs === 'light' && legCount > 2) fails.push(`legs=light but ${legCount} leg exercises`);
              // 增肌 / 力量不安排有氧
              if ((goals[0] === 'muscle' || goals[0] === 'strength') && d.exercises.some(e=>e.kind==='cardio')) fails.push(`cardio in ${goals[0]} plan`);
              // 每个动作都有处方、器材合规、避让合规
              for (const ex of d.exercises) {
                if (!ex.rx) fails.push(`no prescription for ${ex.name}`);
                if (!equipAllowed(ex, equipment)) fails.push(`equipment violation: ${ex.name} (${ex.equipment}) for ${equipment}`);
                if (avoid.includes('knee') && ex.part === '腿部') fails.push(`avoid violation: ${ex.name}`);
                if (avoid.includes('shoulder') && ['肩部','胸部'].includes(ex.part)) fails.push(`avoid violation: ${ex.name}`);
                if (avoid.includes('waist') && ex.part === '核心') fails.push(`avoid violation: ${ex.name}`);
                const used = new Set(); d.exercises.forEach(e => used.add(e.name));
                const alts = findAlternatives(ex, profile, used);
                if (!alts.length) fails.push(`no replacement for ${ex.name} (${equipment}/${ex.pattern})`);
                if (legs === 'no' && alts.some(isLegEx)) fails.push(`legs=no replacement is leg: ${ex.name} -> ${alts.map(a=>a.name).join(',')}`);
                // 平替应练到同一目标部位；但避让/器材掏空同部位时允许同模式兜底
                if (ex.kind !== 'cardio' && alts.length) {
                  const sameTarget = alts.some(a => a.sub === ex.sub || a.part === ex.part);
                  const hasFreeSamePart = EXERCISES.some(e =>
                    e.name !== ex.name && !used.has(e.name) && (e.sub === ex.sub || e.part === ex.part) &&
                    equipAllowed(e, equipment) && !(profile.legs === 'no' && isLegEx(e)) && !avoid.some(av =>
                      (av==='knee'&&e.part==='腿部')||(av==='shoulder'&&['肩部','胸部'].includes(e.part))||(av==='waist'&&e.part==='核心'))
                  );
                  if (!sameTarget && hasFreeSamePart) fails.push(`replacement off-target: ${ex.name}(${ex.part}/${ex.sub}) -> ${alts.map(a=>a.name).join(',')}`);
                }
              }
            }
            tested++;
          } catch (e) { fails.push('EXCEPTION ' + e.message); }
        }

console.log('测试组合数:', tested);
console.log('失败数:', fails.length);
[...new Set(fails)].slice(0, 25).forEach(f => console.log(' -', f));

console.log('\n【处方差异：复合 vs 孤立】');
const pMuscle = {goals:['muscle'],level:'intermediate',days:3,session:'60',equipment:'gym',duration:'6m',gender:'male',focus:[],avoid:[],legs:'yes'};
const mp = generatePlan(pMuscle);
mp.days[0].exercises.slice(0,4).forEach(e=>console.log(`  ${e.name}[${e.kind}] ${e.rx.sets}×${e.rx.reps} 休${e.rx.rest}`));

console.log('\n【力量:有氧 比例（90 分钟最多 7 动作）】');
for (const g of ['fatloss','tone','muscle','strength','endurance']) {
  const pl = generatePlan({goals:[g],level:'intermediate',days:3,session:'90',equipment:'gym',duration:'6m',gender:'male',focus:[],avoid:[],legs:'yes'});
  const d0 = pl.days[0];
  const cardio = d0.exercises.filter(e=>e.kind==='cardio').length;
  console.log(`  ${g}: ${d0.exercises.length}动作 = 力量${d0.exercises.length-cardio} + 有氧${cardio} | ${goalRatioText(g,cardio)||'无有氧（力量为主）'}`);
}

console.log('\n【是否练腿：3 天推拉腿计划】');
for (const legs of ['yes','light','no']) {
  const pl = generatePlan({goals:['muscle'],level:'intermediate',days:3,session:'60',equipment:'gym',duration:'6m',gender:'male',focus:[],avoid:[],legs});
  console.log(`  ${legs}: ${pl.split}`);
  pl.days.forEach((d,i)=>console.log(`    第${i+1}天[${d.template}] 腿${d.exercises.filter(isLegEx).length}个 / ${d.exercises.length}动作: ${d.exercises.map(e=>e.name).join('、')}`));
}

console.log('\n【平替：健身房肩中束器械缺失 → 同部位平替】');
const pp = {goals:['muscle'],level:'advanced',days:6,session:'90',equipment:'gym',duration:'1y',gender:'male',focus:[],avoid:[],legs:'yes'};
const d0 = generatePlan(pp).days[0];
for (const name of ['坐姿肩推','绳索侧平举','Y 字侧平举']) {
  const ex = EXERCISES.find(e=>e.name===name);
  if (!ex) continue;
  const used = new Set([name]);
  const alts = findAlternatives(ex, pp, used);
  console.log(`  ${name}(${ex.sub}) ->`, alts.map(a=>`${a.name}[${a.equipment}]`).join(', ') || '无');
}

console.log('\n【分化逻辑：按训练年限匹配】');
for (const lv of ['beginner','intermediate','advanced']) {
  console.log(`  ${lv} 6天 -> ${splitName(lv,6)} | ${SPLIT_BY_LEVEL[lv][6].join(',')}`);
}

console.log('\n【示意图：器材 + 发力高亮 + 跟学博主】');
for (const name of ['杠铃卧推','哑铃侧平举','绳索面拉','器械推胸','跑步机快走','徒手深蹲','高位下拉','跳绳']) {
  const ex = EXERCISES.find(e=>e.name===name);
  if (!ex) continue;
  const svg = DemoAnim.getAnimSvg(ex);
  const coaches = DemoAnim.getCoaches(ex).map(c=>c.name).join('/');
  const ok = svg.indexOf('<svg') === 0 && svg.indexOf('发力部位') > 0 && svg.indexOf('<animate') > 0;
  if (!ok) fails.push(`bad demo svg for ${name}`);
  console.log(`  ${name}: ${DemoAnim.getAnimLabel(ex)} | SVG ${svg.length}字符 | ${coaches}`);
}
const coachNames = new Set();
EXERCISES.forEach(e=>DemoAnim.getCoaches(e).forEach(c=>coachNames.add(c.name)));
console.log('  覆盖博主:', [...coachNames].join('、'));
if (coachNames.size !== 3) fails.push('coach coverage incomplete');

console.log('\n最终失败数:', fails.length);
if (fails.length) process.exitCode = 1;
