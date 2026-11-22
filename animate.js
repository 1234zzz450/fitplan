/* ============================================================
   动作示意图 —— 带器材的火柴人 + 发力高亮 + 动作方向箭头
   纯 SVG + SMIL 动画，无外链、无图片依赖，可离线 / GitHub Pages 使用
   ============================================================ */
(function (global) {
  var DUR = '2.2s';
  var C_MAIN = '#0f9e8e';   // 主体肢体
  var C_BACK = '#aebbc9';   // 后侧肢体
  var C_FOCUS = '#ff6b35';  // 发力部位高亮
  var C_HEAD = '#173247';   // 头与关节
  var C_EQ = '#486378';     // 器械主色
  var C_EQ2 = '#8798a8';    // 器械辅色

  function n(v) { return Number(v).toFixed(1); }

  // 一条在 A/B 两帧间循环的线段
  function bone(p1a, p1b, p2a, p2b, color, width) {
    return '<line x1="' + n(p1a.x) + '" y1="' + n(p1a.y) + '" x2="' + n(p2a.x) + '" y2="' + n(p2a.y) +
      '" stroke="' + color + '" stroke-width="' + width + '" stroke-linecap="round">' +
      '<animate attributeName="x1" values="' + n(p1a.x) + ';' + n(p1b.x) + ';' + n(p1a.x) + '" dur="' + DUR + '" repeatCount="indefinite"/>' +
      '<animate attributeName="y1" values="' + n(p1a.y) + ';' + n(p1b.y) + ';' + n(p1a.y) + '" dur="' + DUR + '" repeatCount="indefinite"/>' +
      '<animate attributeName="x2" values="' + n(p2a.x) + ';' + n(p2b.x) + ';' + n(p2a.x) + '" dur="' + DUR + '" repeatCount="indefinite"/>' +
      '<animate attributeName="y2" values="' + n(p2a.y) + ';' + n(p2b.y) + ';' + n(p2a.y) + '" dur="' + DUR + '" repeatCount="indefinite"/>' +
      '</line>';
  }
  function animCircle(cxa, cya, cxb, cyb, r, fill) {
    return '<circle cx="' + n(cxa) + '" cy="' + n(cya) + '" r="' + r + '" fill="' + fill + '">' +
      '<animate attributeName="cx" values="' + n(cxa) + ';' + n(cxb) + ';' + n(cxa) + '" dur="' + DUR + '" repeatCount="indefinite"/>' +
      '<animate attributeName="cy" values="' + n(cya) + ';' + n(cyb) + ';' + n(cya) + '" dur="' + DUR + '" repeatCount="indefinite"/>' +
      '</circle>';
  }
  function animRect(xa, ya, xb, yb, w, h, fill) {
    return '<rect x="' + n(xa) + '" y="' + n(ya) + '" width="' + w + '" height="' + h + '" rx="2" fill="' + fill + '">' +
      '<animate attributeName="x" values="' + n(xa) + ';' + n(xb) + ';' + n(xa) + '" dur="' + DUR + '" repeatCount="indefinite"/>' +
      '<animate attributeName="y" values="' + n(ya) + ';' + n(yb) + ';' + n(ya) + '" dur="' + DUR + '" repeatCount="indefinite"/>' +
      '</rect>';
  }

  // 每个动作模式的两帧关节坐标
  var FRAMES = {
    squat: {
      label: '深蹲类',
      A: { head:{x:64,y:22}, shoulder:{x:62,y:36}, shoulderR:{x:62,y:36}, hip:{x:64,y:58}, hand:{x:50,y:54}, handR:{x:50,y:54}, kneeL:{x:68,y:79}, ankleL:{x:64,y:100}, kneeR:{x:57,y:79}, ankleR:{x:57,y:100} },
      B: { head:{x:46,y:40}, shoulder:{x:46,y:52}, shoulderR:{x:46,y:52}, hip:{x:54,y:74}, hand:{x:38,y:64}, handR:{x:38,y:64}, kneeL:{x:72,y:84}, ankleL:{x:64,y:100}, kneeR:{x:57,y:84}, ankleR:{x:57,y:100} }
    },
    hinge: {
      label: '髋铰链类',
      A: { head:{x:62,y:22}, shoulder:{x:60,y:36}, shoulderR:{x:60,y:36}, hip:{x:62,y:58}, hand:{x:60,y:68}, handR:{x:60,y:68}, kneeL:{x:67,y:79}, ankleL:{x:62,y:100}, kneeR:{x:57,y:79}, ankleR:{x:57,y:100} },
      B: { head:{x:34,y:48}, shoulder:{x:42,y:52}, shoulderR:{x:42,y:52}, hip:{x:72,y:62}, hand:{x:38,y:74}, handR:{x:38,y:74}, kneeL:{x:68,y:82}, ankleL:{x:62,y:100}, kneeR:{x:58,y:82}, ankleR:{x:57,y:100} }
    },
    push: {
      label: '推类',
      A: { head:{x:42,y:42}, shoulder:{x:50,y:50}, shoulderR:{x:50,y:50}, hip:{x:78,y:54}, hand:{x:48,y:98}, handR:{x:48,y:98}, kneeL:{x:94,y:60}, ankleL:{x:106,y:96}, kneeR:{x:91,y:66}, ankleR:{x:101,y:98} },
      B: { head:{x:42,y:55}, shoulder:{x:50,y:63}, shoulderR:{x:50,y:63}, hip:{x:78,y:63}, hand:{x:48,y:98}, handR:{x:48,y:98}, kneeL:{x:94,y:66}, ankleL:{x:106,y:96}, kneeR:{x:91,y:71}, ankleR:{x:101,y:98} }
    },
    bench: {
      label: '卧推类',
      A: { head:{x:34,y:74}, shoulder:{x:46,y:74}, shoulderR:{x:46,y:74}, hip:{x:82,y:78}, hand:{x:52,y:44}, handR:{x:52,y:44}, kneeL:{x:100,y:76}, ankleL:{x:114,y:88}, kneeR:{x:98,y:82}, ankleR:{x:110,y:92} },
      B: { head:{x:34,y:74}, shoulder:{x:46,y:74}, shoulderR:{x:46,y:74}, hip:{x:82,y:78}, hand:{x:52,y:70}, handR:{x:52,y:70}, kneeL:{x:100,y:76}, ankleL:{x:114,y:88}, kneeR:{x:98,y:82}, ankleR:{x:110,y:92} }
    },
    press: {
      label: '推举类',
      A: { head:{x:66,y:24}, shoulder:{x:58,y:40}, shoulderR:{x:74,y:40}, hip:{x:66,y:66}, hand:{x:52,y:70}, handR:{x:80,y:70}, kneeL:{x:60,y:84}, ankleL:{x:58,y:102}, kneeR:{x:72,y:84}, ankleR:{x:74,y:102} },
      B: { head:{x:66,y:22}, shoulder:{x:58,y:38}, shoulderR:{x:74,y:38}, hip:{x:66,y:66}, hand:{x:46,y:26}, handR:{x:86,y:26}, kneeL:{x:60,y:84}, ankleL:{x:58,y:102}, kneeR:{x:72,y:84}, ankleR:{x:74,y:102} }
    },
    latpull: {
      label: '下拉类',
      A: { head:{x:66,y:32}, shoulder:{x:58,y:46}, shoulderR:{x:74,y:46}, hip:{x:66,y:70}, hand:{x:48,y:18}, handR:{x:84,y:18}, kneeL:{x:60,y:86}, ankleL:{x:58,y:102}, kneeR:{x:72,y:86}, ankleR:{x:74,y:102} },
      B: { head:{x:66,y:32}, shoulder:{x:58,y:46}, shoulderR:{x:74,y:46}, hip:{x:66,y:70}, hand:{x:52,y:52}, handR:{x:80,y:52}, kneeL:{x:60,y:86}, ankleL:{x:58,y:102}, kneeR:{x:72,y:86}, ankleR:{x:74,y:102} }
    },
    curl: {
      label: '弯举类',
      A: { head:{x:66,y:22}, shoulder:{x:58,y:38}, shoulderR:{x:74,y:38}, hip:{x:66,y:64}, hand:{x:54,y:68}, handR:{x:78,y:68}, kneeL:{x:60,y:82}, ankleL:{x:58,y:102}, kneeR:{x:72,y:82}, ankleR:{x:74,y:102} },
      B: { head:{x:66,y:22}, shoulder:{x:58,y:38}, shoulderR:{x:74,y:38}, hip:{x:66,y:64}, hand:{x:54,y:44}, handR:{x:78,y:44}, kneeL:{x:60,y:82}, ankleL:{x:58,y:102}, kneeR:{x:72,y:82}, ankleR:{x:74,y:102} }
    },
    pull: {
      label: '拉类',
      A: { head:{x:48,y:32}, shoulder:{x:54,y:44}, shoulderR:{x:54,y:44}, hip:{x:74,y:66}, hand:{x:34,y:58}, handR:{x:34,y:58}, kneeL:{x:88,y:80}, ankleL:{x:90,y:100}, kneeR:{x:82,y:80}, ankleR:{x:84,y:100} },
      B: { head:{x:48,y:32}, shoulder:{x:54,y:44}, shoulderR:{x:54,y:44}, hip:{x:74,y:66}, hand:{x:61,y:54}, handR:{x:61,y:54}, kneeL:{x:88,y:80}, ankleL:{x:90,y:100}, kneeR:{x:82,y:80}, ankleR:{x:84,y:100} }
    },
    core: {
      label: '核心类',
      A: { head:{x:30,y:84}, shoulder:{x:42,y:87}, shoulderR:{x:42,y:87}, hip:{x:70,y:88}, hand:{x:38,y:80}, handR:{x:38,y:80}, kneeL:{x:86,y:72}, ankleL:{x:92,y:100}, kneeR:{x:82,y:76}, ankleR:{x:88,y:100} },
      B: { head:{x:38,y:66}, shoulder:{x:48,y:76}, shoulderR:{x:48,y:76}, hip:{x:70,y:88}, hand:{x:44,y:66}, handR:{x:44,y:66}, kneeL:{x:86,y:72}, ankleL:{x:92,y:100}, kneeR:{x:82,y:76}, ankleR:{x:88,y:100} }
    },
    cardio: {
      label: '有氧类',
      A: { head:{x:60,y:24}, shoulder:{x:52,y:38}, shoulderR:{x:68,y:38}, hip:{x:60,y:62}, hand:{x:44,y:60}, handR:{x:76,y:60}, kneeL:{x:54,y:81}, ankleL:{x:52,y:100}, kneeR:{x:66,y:81}, ankleR:{x:68,y:100} },
      B: { head:{x:60,y:20}, shoulder:{x:52,y:36}, shoulderR:{x:68,y:36}, hip:{x:60,y:58}, hand:{x:34,y:18}, handR:{x:86,y:18}, kneeL:{x:44,y:79}, ankleL:{x:38,y:100}, kneeR:{x:76,y:79}, ankleR:{x:82,y:100} }
    }
  };

  // 火柴人：后侧肢体（灰）→ 躯干 → 前侧腿 → 发力手臂（橙）→ 关节 → 头
  function figure(A, B, focus) {
    var torso = focus === 'core' ? C_FOCUS : C_MAIN;
    var leg = (focus === 'leg' || focus === 'glute' || focus === 'cardio') ? C_FOCUS : C_MAIN;
    var arm = (focus === 'push' || focus === 'pull' || focus === 'shoulder' || focus === 'arm') ? C_FOCUS : C_MAIN;
    return '' +
      bone(A.hip, B.hip, A.kneeR, B.kneeR, C_BACK, 5) +
      bone(A.kneeR, B.kneeR, A.ankleR, B.ankleR, C_BACK, 5) +
      bone(A.shoulderR, B.shoulderR, A.handR, B.handR, C_BACK, 4) +
      bone(A.shoulder, B.shoulder, A.hip, B.hip, torso, 7) +
      bone(A.hip, B.hip, A.kneeL, B.kneeL, leg, 6) +
      bone(A.kneeL, B.kneeL, A.ankleL, B.ankleL, leg, 6) +
      bone(A.shoulder, B.shoulder, A.hand, B.hand, arm, 5) +
      animCircle(A.hip.x, A.hip.y, B.hip.x, B.hip.y, 3.2, C_HEAD) +
      animCircle(A.kneeL.x, A.kneeL.y, B.kneeL.x, B.kneeL.y, 2.8, C_HEAD) +
      animCircle(A.shoulder.x, A.shoulder.y, B.shoulder.x, B.shoulder.y, 3, C_HEAD) +
      animCircle(A.head.x, A.head.y, B.head.x, B.head.y, 8, C_HEAD);
  }

  /* ---------- 器械绘制（随动作一起动） ---------- */
  function dumbbellAt(pA, pB) {
    return animRect(pA.x - 7, pA.y - 2, pB.x - 7, pB.y - 2, 14, 4, C_EQ) +
      animRect(pA.x - 9, pA.y - 6, pB.x - 9, pB.y - 6, 4, 12, C_EQ2) +
      animRect(pA.x + 5, pA.y - 6, pB.x + 5, pB.y - 6, 4, 12, C_EQ2);
  }
  function barbellAt(A, B) {
    var la = {x:A.hand.x - 20, y:A.hand.y}, lb = {x:B.hand.x - 20, y:B.hand.y};
    var ra = {x:A.hand.x + 20, y:A.hand.y}, rb = {x:B.hand.x + 20, y:B.hand.y};
    return bone(la, lb, ra, rb, C_EQ, 3) +
      animRect(la.x - 3, la.y - 8, lb.x - 3, lb.y - 8, 6, 16, C_EQ2) +
      animRect(ra.x - 3, ra.y - 8, rb.x - 3, rb.y - 8, 6, 16, C_EQ2);
  }
  function cableRig(A, B) {
    var anchor = {x:16, y:18};
    return '<circle cx="16" cy="18" r="5" fill="none" stroke="' + C_EQ + '" stroke-width="2"/>' +
      bone(anchor, anchor, A.hand, B.hand, C_EQ2, 1.8) +
      animRect(A.hand.x - 4, A.hand.y - 3, B.hand.x - 4, B.hand.y - 3, 8, 6, C_EQ);
  }
  function machineFrame() {
    return '<path d="M16 100 L16 24 L104 24" fill="none" stroke="' + C_EQ + '" stroke-width="3" stroke-linecap="round" opacity=".75"/>' +
      '<rect x="18" y="86" width="34" height="6" rx="3" fill="' + C_EQ2 + '" opacity=".8"/>' +
      '<rect x="86" y="86" width="28" height="6" rx="3" fill="' + C_EQ2 + '" opacity=".8"/>';
  }
  function bench() {
    return '<rect x="28" y="82" width="70" height="5" rx="2" fill="' + C_EQ2 + '"/>' +
      '<rect x="36" y="87" width="4" height="10" fill="' + C_EQ + '"/>' +
      '<rect x="86" y="87" width="4" height="10" fill="' + C_EQ + '"/>';
  }
  function treadmill() {
    return '<rect x="26" y="100" width="80" height="6" rx="3" fill="' + C_EQ2 + '"/>' +
      '<rect x="94" y="74" width="6" height="28" rx="2" fill="' + C_EQ + '"/>' +
      '<rect x="86" y="70" width="22" height="8" rx="2" fill="' + C_EQ + '"/>';
  }
  function bike() {
    return '<circle cx="44" cy="94" r="11" fill="none" stroke="' + C_EQ + '" stroke-width="2.5"/>' +
      '<circle cx="86" cy="94" r="11" fill="none" stroke="' + C_EQ + '" stroke-width="2.5"/>' +
      '<path d="M44 94 L64 70 L86 94 M64 70 L72 94" fill="none" stroke="' + C_EQ2 + '" stroke-width="2"/>' +
      '<rect x="56" y="64" width="16" height="4" rx="2" fill="' + C_EQ + '"/>';
  }
  function rower() {
    return '<line x1="20" y1="100" x2="112" y2="100" stroke="' + C_EQ + '" stroke-width="3"/>' +
      '<rect x="46" y="94" width="24" height="6" rx="2" fill="' + C_EQ2 + '"/>' +
      '<circle cx="104" cy="94" r="8" fill="none" stroke="' + C_EQ + '" stroke-width="2"/>';
  }
  function elliptical() {
    return '<ellipse cx="60" cy="90" rx="34" ry="11" fill="none" stroke="' + C_EQ + '" stroke-width="2"/>' +
      '<circle cx="30" cy="90" r="5" fill="' + C_EQ2 + '"/><circle cx="90" cy="90" r="5" fill="' + C_EQ2 + '"/>';
  }
  function pullBar() {
    return '<line x1="22" y1="14" x2="110" y2="14" stroke="' + C_EQ + '" stroke-width="3" stroke-linecap="round"/>' +
      '<line x1="22" y1="14" x2="22" y2="26" stroke="' + C_EQ2 + '" stroke-width="2"/>' +
      '<line x1="110" y1="14" x2="110" y2="26" stroke="' + C_EQ2 + '" stroke-width="2"/>';
  }
  function jumpRope(A, B) {
    var dA = 'M' + n(A.hand.x) + ' ' + n(A.hand.y) + ' Q 8 96 ' + n(A.handR.x) + ' ' + n(A.handR.y);
    var dB = 'M' + n(B.hand.x) + ' ' + n(B.hand.y) + ' Q 8 96 ' + n(B.handR.x) + ' ' + n(B.handR.y);
    return '<path d="' + dA + '" fill="none" stroke="' + C_EQ2 + '" stroke-width="1.6" opacity=".85">' +
      '<animate attributeName="d" values="' + dA + ';' + dB + ';' + dA + '" dur="' + DUR + '" repeatCount="indefinite"/></path>';
  }
  function mat() {
    return '<rect x="20" y="100" width="92" height="4" rx="2" fill="' + C_EQ2 + '" opacity=".8"/>';
  }

  // 根据动作名称 + 器材档，选用对应的器械组合
  function equipFor(ex, A, B) {
    var name = ex.name || '', out = '';
    if (name.indexOf('跑步机') >= 0 || name.indexOf('快走') >= 0) out += treadmill();
    else if (name.indexOf('椭圆机') >= 0) out += elliptical();
    else if (name.indexOf('单车') >= 0) out += bike();
    else if (name.indexOf('划船机') >= 0) out += rower();
    else if (name.indexOf('跳绳') >= 0) out += jumpRope(A, B);
    if (/引体|悬垂/.test(name)) out += pullBar();
    if (/绳索|面拉|直臂下压|高位下拉/.test(name)) out += cableRig(A, B);
    if (ex.equipment === 'gym' && /推胸|夹胸|蝴蝶机|坐姿划船|腿举|腿弯举|腿屈伸|肩推|卷腹|体侧屈|高位下拉/.test(name)) out += machineFrame();
    if (/卧推|飞鸟|仰卧|臀推|山羊挺身/.test(name)) out += bench();
    if (name.indexOf('杠铃') >= 0) out += barbellAt(A, B);
    else if (name.indexOf('哑铃') >= 0 || ex.equipment === 'dumbbell') {
      out += dumbbellAt(A.hand, B.hand) + dumbbellAt(A.handR, B.handR);
    }
    if (ex.equipment === 'none' && ex.pattern === 'core') out += mat();
    return out;
  }

  // 动作方向箭头：提示动作轨迹，随时间轻微呼吸
  function motionArrow(pattern) {
    var d;
    if (pattern === 'squat') d = 'M114 80 L114 60 M110 64 L114 60 L118 64 M114 85 L114 92';
    else if (pattern === 'hinge') d = 'M112 58 Q122 70 112 84 M108 80 L112 84 L116 80';
    else if (pattern === 'bench') d = 'M108 42 L108 68 M104 64 L108 68 L112 64';
    else if (pattern === 'press') d = 'M110 44 L110 24 M106 28 L110 24 L114 28';
    else if (pattern === 'latpull') d = 'M110 22 L110 44 M106 40 L110 44 L114 40';
    else if (pattern === 'curl') d = 'M98 48 Q104 38 98 30 M94 34 L98 30 L102 34';
    else if (pattern === 'push') d = 'M96 38 L112 38 M108 34 L112 38 L108 42';
    else if (pattern === 'pull') d = 'M62 56 L46 56 M50 52 L46 56 L50 60';
    else if (pattern === 'core') d = 'M104 82 L104 64 M100 68 L104 64 L108 68';
    else d = 'M108 48 L108 30 M104 34 L108 30 L112 34';
    return '<path d="' + d + '" fill="none" stroke="' + C_FOCUS + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<animate attributeName="opacity" values=".35;1;.35" dur="' + DUR + '" repeatCount="indefinite"/></path>';
  }

  // 根据动作名称选择更贴切的姿态帧：卧推 / 站姿推举 / 高位下拉 / 弯举等不再共用俯卧撑姿态
  function poseOf(ex) {
    var name = ex.name || '', p = ex.pattern;
    if (p === 'push') {
      if (/卧推|飞鸟|夹胸|蝴蝶机|仰卧臂屈伸|推胸/.test(name)) return 'bench';
      if (/肩推|侧平举|Y 字|下压/.test(name)) return 'press';
      return 'push';
    }
    if (p === 'pull') {
      if (/高位下拉|引体|悬垂/.test(name)) return 'latpull';
      if (/弯举|锤式|飞鸟/.test(name)) return 'curl';
      return 'pull';
    }
    return p || 'squat';
  }
  function focusOf(ex) {
    if (ex.kind === 'cardio') return 'cardio';
    return ({ '胸部':'push', '背部':'pull', '腿部':'leg', '臀部':'glute',
      '肩部':'shoulder', '手臂':'arm', '核心':'core' })[ex.part] || ex.pattern || 'squat';
  }
  function equipLabel(ex) {
    var name = ex.name || '';
    if (ex.equipment === 'none') return '徒手';
    if (/引体|悬垂/.test(name)) return '单杠';
    if (name.indexOf('双杠') >= 0) return '双杠';
    if (name.indexOf('杠铃') >= 0) return '杠铃';
    if (name.indexOf('哑铃') >= 0 || ex.equipment === 'dumbbell') return '哑铃';
    if (/绳索|面拉|高位下拉|直臂下压/.test(name)) return '绳索';
    if (ex.kind === 'cardio') return '有氧器械';
    return '固定器械';
  }

  // 推荐学习博主：按动作部位匹配三位博主各自的专长
  var COACHES = {
    tan:  { name:'谭成义', good:'腿 / 背 / 基础复合动作' },
    kai:  { name:'凯圣王', good:'胸 / 肩 / 推日编排' },
    cu:   { name:'粗人健身', good:'减脂有氧 / 训练计划' }
  };
  function getCoaches(ex) {
    if (ex.kind === 'cardio' || ex.part === '核心') return [COACHES.cu, COACHES.kai];
    if (['腿部','臀部','背部'].indexOf(ex.part) >= 0) return [COACHES.tan, COACHES.kai];
    if (['胸部','肩部','手臂'].indexOf(ex.part) >= 0) return [COACHES.kai, COACHES.tan];
    return [COACHES.tan, COACHES.cu];
  }

  function getAnimSvg(ex) {
    ex = ex || {};
    var pattern = poseOf(ex);
    var f = FRAMES[pattern] || FRAMES.squat;
    var label = getAnimLabel(ex);
    return '<svg class="demo-svg" viewBox="0 0 132 112" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + label + '">' +
      '<rect x="0" y="0" width="132" height="112" rx="10" fill="#f8fbfe"/>' +
      '<line x1="8" y1="102" x2="124" y2="102" stroke="#dfe7ee" stroke-width="2"/>' +
      equipFor(ex, f.A, f.B) +
      figure(f.A, f.B, focusOf(ex)) +
      motionArrow(pattern) +
      '<text x="9" y="15" font-size="9" font-weight="700" fill="#5b7186">' + equipLabel(ex) + '</text>' +
      '<text x="8" y="110" font-size="7.5" fill="#8b9bab">橙色 = 发力部位 · 箭头 = 动作方向</text>' +
      '</svg>';
  }
  function getAnimLabel(ex) {
    var pattern = ex ? poseOf(ex) : 'squat';
    return equipLabel(ex || {}) + ' · ' + (FRAMES[pattern] || FRAMES.squat).label + '示意';
  }

  global.DemoAnim = {
    getAnimSvg: getAnimSvg,
    getAnimLabel: getAnimLabel,
    getCoaches: getCoaches,
    COACHES: COACHES
  };
})(window);
