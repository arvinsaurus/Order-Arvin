// ═══════════════════════════════════════
// TWEEN SYSTEM — the key to smooth anims
// ═══════════════════════════════════════
class Tween {
  constructor(target, props, duration, easeFn, onUpdate, onComplete) {
    this.target = target;
    this.props = {}; // {key: {start, end}}
    for (const k in props) {
      this.props[k] = { start: target[k] !== undefined ? target[k] : 0, end: props[k] };
    }
    this.duration = Math.max(duration, .001);
    this.elapsed = 0;
    this.easeFn = easeFn || Ease.linear;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
    this.done = false;
  }
  update(dt) {
    if (this.done) return;
    this.elapsed += dt;
    const raw = Math.min(this.elapsed / this.duration, 1);
    const t = this.easeFn(raw);
    for (const k in this.props) {
      const p = this.props[k];
      this.target[k] = p.start + (p.end - p.start) * t;
    }
    if (this.onUpdate) this.onUpdate(raw);
    if (raw >= 1) {
      this.done = true;
      if (this.onComplete) this.onComplete();
    }
  }
}

const tweens = [];
function addTween(target, props, dur, easeFn, onUpdate, onComplete) {
  const tw = new Tween(target, props, dur, easeFn, onUpdate, onComplete);
  tweens.push(tw);
  return tw;
}
function updateTweens(dt) {
  for (let i = tweens.length - 1; i >= 0; i--) {
    tweens[i].update(dt);
    if (tweens[i].done) tweens.splice(i, 1);
  }
}

const Ease = {
  linear: t => t,
  inQuad: t => t * t,
  outQuad: t => 1 - (1-t)*(1-t),
  inOutQuad: t => t<.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2,
  outCubic: t => 1 - Math.pow(1-t, 3),
  inOutCubic: t => t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2,
  outQuart: t => 1 - Math.pow(1-t, 4),
  inOutSine: t => -(Math.cos(Math.PI*t)-1)/2,
  outBack: t => { const c=1.7; return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2); },
  outElastic: t => { if(!t||t===1) return t; return Math.pow(2,-10*t)*Math.sin((t*10-.75)*2.094)+1; },
  inBack: t => { const c=1.7; return (c+1)*t*t*t - c*t*t; },
};

// ═══════════════════════════════
// SOUND
// ═══════════════════════════════
const SFX={ctx:null,on:true,
  init(){if(this.ctx)return;this.ctx=new(window.AudioContext||window.webkitAudioContext)()},
  play(type){
    if(!this.on||!this.ctx)return;const c=this.ctx,n=c.currentTime,g=c.createGain();g.connect(c.destination);
    if(type==='sel'){const o=c.createOscillator();o.type='sine';o.frequency.setValueAtTime(880,n);o.frequency.exponentialRampToValueAtTime(1250,n+.05);g.gain.setValueAtTime(.1,n);g.gain.exponentialRampToValueAtTime(.001,n+.09);o.connect(g);o.start(n);o.stop(n+.09)}
    else if(type==='des'){const o=c.createOscillator();o.type='sine';o.frequency.setValueAtTime(580,n);o.frequency.exponentialRampToValueAtTime(360,n+.07);g.gain.setValueAtTime(.07,n);g.gain.exponentialRampToValueAtTime(.001,n+.09);o.connect(g);o.start(n);o.stop(n+.09)}
    else if(type==='pour'){
      const bs=c.sampleRate*.3,buf=c.createBuffer(1,bs,c.sampleRate),d=buf.getChannelData(0);
      for(let i=0;i<bs;i++){const t=i/c.sampleRate;d[i]=(Math.random()*2-1)*.2*Math.sin(t*40)*Math.exp(-t*5)}
      const s=c.createBufferSource();s.buffer=buf;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=1000;f.Q.value=1.5;
      g.gain.setValueAtTime(.18,n);g.gain.exponentialRampToValueAtTime(.001,n+.3);s.connect(f);f.connect(g);s.start(n);
      for(let b=0;b<3;b++){const o=c.createOscillator(),g2=c.createGain();o.type='sine';const bt=n+.03+b*.05;
        o.frequency.setValueAtTime(500+Math.random()*400,bt);o.frequency.exponentialRampToValueAtTime(300,bt+.035);
        g2.gain.setValueAtTime(.05,bt);g2.gain.exponentialRampToValueAtTime(.001,bt+.04);o.connect(g2);g2.connect(c.destination);o.start(bt);o.stop(bt+.04)}
    }
    else if(type==='done'){[523,659,784,1047].forEach((f,i)=>{const o=c.createOscillator(),gg=c.createGain();o.type='sine';const t=n+i*.06;o.frequency.setValueAtTime(f,t);gg.gain.setValueAtTime(.08,t);gg.gain.exponentialRampToValueAtTime(.001,t+.22);o.connect(gg);gg.connect(c.destination);o.start(t);o.stop(t+.22)})}
    else if(type==='win'){[523,659,784,1047,784,1047,1319].forEach((f,i)=>{const o=c.createOscillator(),gg=c.createGain();o.type='triangle';const t=n+i*.09;o.frequency.setValueAtTime(f,t);gg.gain.setValueAtTime(.1,t);gg.gain.exponentialRampToValueAtTime(.001,t+.28);o.connect(gg);gg.connect(c.destination);o.start(t);o.stop(t+.28)})}
    else if(type==='err'){const o=c.createOscillator();o.type='square';o.frequency.setValueAtTime(190,n);g.gain.setValueAtTime(.05,n);g.gain.exponentialRampToValueAtTime(.001,n+.1);o.connect(g);o.start(n);o.stop(n+.1)}
    else if(type==='fly'){const o=c.createOscillator();o.type='sine';o.frequency.setValueAtTime(500,n);o.frequency.exponentialRampToValueAtTime(1800,n+.3);g.gain.setValueAtTime(.07,n);g.gain.exponentialRampToValueAtTime(.001,n+.35);o.connect(g);o.start(n);o.stop(n+.35)}
    else if(type==='btn'){const o=c.createOscillator();o.type='triangle';o.frequency.setValueAtTime(420,n);o.frequency.exponentialRampToValueAtTime(760,n+.045);g.gain.setValueAtTime(.055,n);g.gain.exponentialRampToValueAtTime(.001,n+.08);o.connect(g);o.start(n);o.stop(n+.08)}
  }
};

document.addEventListener('pointerdown',e=>{
  const el=e.target.closest('button,.stg');
  if(!el||el.classList.contains('dis')||el.disabled)return;
  SFX.init();
  SFX.play('btn');
},{capture:true});

window.addEventListener('load',()=>{
  const intro=document.getElementById('intro');
  if(!intro)return;
  const photo=intro.querySelector('.intro-photo');
  const title=intro.querySelector('.intro-title');
  const sub=intro.querySelector('.intro-sub');
  requestAnimationFrame(()=>{
    if(photo)photo.classList.add('visible');
    if(title)title.classList.add('visible');
    if(sub)sub.classList.add('visible');
  });
  setTimeout(()=>{
    intro.classList.add('out');
    setTimeout(()=>{
      intro.remove();
      G.startLoop();
    },500);
  },2000);
});

// ═══════════════════════════════
// COLORS
// ═══════════════════════════════
const C=[
  {n:'Red',f:'#E63946',m:'#c1272d',d:'#7a1118',l:'#ff7a7a',s:'#ffb3b3'},
  {n:'Blue',f:'#4361EE',m:'#3350cc',d:'#1e2e80',l:'#7b93f5',s:'#b8c8ff'},
  {n:'Green',f:'#2DC653',m:'#22a040',d:'#15662a',l:'#5edb7a',s:'#aef0be'},
  {n:'Yellow',f:'#FFD23F',m:'#e0b520',d:'#997a00',l:'#ffe680',s:'#fff4c2'},
  {n:'Orange',f:'#FB5607',m:'#d04500',d:'#882d00',l:'#ff8a4c',s:'#ffc4a3'},
  {n:'Purple',f:'#9B5DE5',m:'#7a3dc0',d:'#4c2480',l:'#be8ff5',s:'#dcc5ff'},
  {n:'Cyan',f:'#00C8FF',m:'#0096d6',d:'#005f9a',l:'#66dcff',s:'#c6f4ff'},
  {n:'Pink',f:'#FF85A1',m:'#d4607a',d:'#993d55',l:'#ffadc0',s:'#ffd6e0'},
  {n:'Lime',f:'#A7C957',m:'#8aaa3a',d:'#5c7220',l:'#c4e07a',s:'#e2f0b8'},
  {n:'Teal',f:'#00796B',m:'#006257',d:'#003b35',l:'#24b59f',s:'#9be8dc'},
  {n:'Coral',f:'#FF6F59',m:'#d45540',d:'#8a3528',l:'#ff9a8a',s:'#ffc8c0'},
  {n:'Indigo',f:'#5C6BC0',m:'#4a55a0',d:'#303770',l:'#8a95d8',s:'#bcc3ea'},
];
const CAP=4;
const cv=document.getElementById('gc');
const cx=cv.getContext('2d');

// ═══════════════════════════════
// GAME OBJECT
// ═══════════════════════════════
const G={
  storageKey:'orderCrazyProgressV1',
  lv:1, bots:[], mv:0, sel:null, hist:[], won:false, busy:false,
  rects:[], orders:[], doneC:new Set(), pendingC:{}, best:{}, maxLv:1,
  BW:44,BH:110,capH:13,lH:0,
  flyBots:[], pourAnim:null, pouringFrom:null,
  cw:0,ch:0,

  // Lightweight canvas effects
  particles:[], ripples:[], hover:-1,

  getCfg(lv){
    // Multiplier: how many full bottles each color occupies (1 = 1 bottle, 2 = 2 bottles)
    // Phase 1 (1–10):  8→12 colors, 1× multiplier, 2 empties → 10–14 bottles
    // Phase 2 (11–25): 10→12 colors, 2× multiplier, 2 empties → 22–26 bottles
    // Phase 3 (26+):   12 colors,    2× multiplier, 1 empty  → 25 bottles (brutal)
    let nc,mul,ne;
    if(lv<=10){
      nc=Math.min(8+Math.floor((lv-1)/2),12);
      mul=1; ne=2;
    } else if(lv<=25){
      nc=Math.min(10+Math.floor((lv-11)/5),12);
      mul=2; ne=2;
    } else {
      nc=12; mul=2; ne=1;
    }
    const nb=nc*mul+ne;
    const cols=nb<=12?5:nb<=16?5:nb<=20?5:6;
    return{nb,nc,ne,mul,cols};
  },

  gen(lv){
    const cfg=this.getCfg(lv);
    // Each color gets CAP*mul layers total → mul full bottles per color
    const pool=[];
    for(let i=0;i<cfg.nc;i++) for(let j=0;j<CAP*cfg.mul;j++) pool.push(i);
    for(let i=pool.length-1;i>0;i--){const j=0|Math.random()*(i+1);[pool[i],pool[j]]=[pool[j],pool[i]]}
    // Fill nc*mul bottles with exactly CAP layers each, then add ne empty bottles
    const totalFull=cfg.nc*cfg.mul;
    const b=[];
    for(let i=0;i<totalFull;i++) b.push(pool.splice(0,CAP));
    for(let i=0;i<cfg.ne;i++) b.push([]);
    // Break up any pre-sorted bottles
    for(let i=0;i<b.length;i++){
      if(this.isSrt(b[i])){
        const j=b.findIndex((bot,k)=>k!==i&&bot.length>1&&bot.some(c=>c!==b[i][0]));
        if(j>=0){
          const k=b[j].findIndex(c=>c!==b[i][0]);
          [b[i][0],b[j][k]]=[b[j][k],b[i][0]];
        }
      }
    }
    // Guarantee at least one valid move exists
    const hasMove=()=>b.some((from,i)=>{
      if(!from.length)return false;
      const c=from[from.length-1];
      return b.some((to,j)=>i!==j&&to.length<CAP&&(!to.length||to[to.length-1]===c));
    });
    if(!hasMove()){
      const full=b.map((bot,i)=>bot.length===CAP?i:-1).filter(i=>i>=0);
      const empty=b.map((bot,i)=>bot.length<CAP?i:-1).filter(i=>i>=0);
      if(full.length&&empty.length){b[empty[0]].push(b[full[0]].pop())}
    }
    for(let i=b.length-1;i>0;i--){const j=0|Math.random()*(i+1);[b[i],b[j]]=[b[j],b[i]]}
    this.orders=[];for(let i=0;i<cfg.nc;i++) this.orders.push(i);
    for(let i=this.orders.length-1;i>0;i--){const j=0|Math.random()*(i+1);[this.orders[i],this.orders[j]]=[this.orders[j],this.orders[i]]}
    this.doneC=new Set();this.pendingC={};
    return b;
  },

  layout(){
    const cfg=this.getCfg(this.lv);
    const n=this.bots.length;if(!n)return;
    const cols=cfg.cols,rows=Math.ceil(n/cols);
    const topPad=20,botPad=20;
    const mxW=(this.cw-18)/cols-8, mxH=(this.ch-topPad-botPad)/rows-12;
    this.BW=Math.min(40,mxW);this.BH=Math.min(92,mxH,this.BW*2.45);
    this.capH=this.BH*.12;this.lH=(this.BH-this.capH-8)/CAP;
    const gx=this.BW*.64, gy=this.BH*.22;
    // More scatter when fewer bottles, tighter when packed
    const sx=n<=12?.7:n<=18?.45:.28;
    const sy2=n<=12?.35:n<=18?.24:.15;
    this.rects=[];
    const rand=n=>{const s=Math.sin((n+1)*127.1+this.lv*311.7)*43758.5453;return s-Math.floor(s)};
    for(let i=0;i<n;i++){
      const row=0|i/cols, col=i%cols;
      const rc=row===rows-1?n-row*cols:cols;
      const rw=rc*this.BW+(rc-1)*gx;
      const th=rows*this.BH+(rows-1)*gy;
      const startY=topPad+(this.ch-topPad-botPad-th)/2;
      const stagger=(row%2?.34:-.2)*this.BW;
      const jx=(rand(i*2)-.5)*this.BW*sx+stagger;
      const jy=(rand(i*2+1)-.5)*this.BH*sy2+(col%2?this.BH*.06:0);
      const x=Math.max(10,Math.min(this.cw-this.BW-12,(this.cw-rw)/2+col*(this.BW+gx)+jx));
      const y=Math.max(topPad,Math.min(this.ch-this.BH-botPad,startY+row*(this.BH+gy)+jy));
      this.rects.push({x,y, w:this.BW, h:this.BH, idx:i,
        offX:0, offY:0, rot:0, scl:1, alpha:1});
    }
  },

  resize(){
    const dpr=Math.min(window.devicePixelRatio||1,1.5);
    const rect=cv.getBoundingClientRect();
    cv.width=rect.width*dpr;cv.height=rect.height*dpr;
    cx.setTransform(dpr,0,0,dpr,0,0);
    cx.imageSmoothingEnabled=true;
    this.cw=rect.width;this.ch=rect.height;
    this.layout();
  },

  loadProgress(){
    try{
      const raw=localStorage.getItem(this.storageKey);
      if(!raw)return;
      const data=JSON.parse(raw);
      this.lv=Math.max(1,Number(data.lv)||1);
      this.maxLv=Math.max(1,Number(data.maxLv)||1);
      this.best=data.best&&typeof data.best==='object'?data.best:{};
      if(this.lv>this.maxLv)this.lv=this.maxLv;
    }catch(_){}
  },

  saveProgress(){
    try{
      localStorage.setItem(this.storageKey,JSON.stringify({
        lv:this.lv,
        maxLv:this.maxLv,
        best:this.best
      }));
    }catch(_){}
  },

  init(){
    this.loadProgress();this.restart();this.resize();
    // Load persisted sound preference
    try{const s=localStorage.getItem('orderArvinSfx');if(s!==null){SFX.on=s==='1';document.getElementById('stg').textContent=SFX.on?'🔊':'🔇'}}catch(_){}
    // Debounced resize
    let _rt;window.addEventListener('resize',()=>{clearTimeout(_rt);_rt=setTimeout(()=>this.resize(),100)});
    cv.addEventListener('pointerdown',e=>this.tap(e),{passive:true});
    cv.addEventListener('pointermove',e=>this.trackPointer(e),{passive:true});
    cv.addEventListener('pointerleave',()=>{this.hover=-1},{passive:true});
    this._lt=performance.now();
    this._paused=!!document.getElementById('intro');
    if(!this._paused) requestAnimationFrame(t=>this.loop(t));
  },

  startLoop(){
    if(!this._paused)return;
    this._paused=false;
    this.resize();
    this._lt=performance.now();
    requestAnimationFrame(t=>this.loop(t));
  },

  restart(){
    tweens.length=0;
    this.bots=this.gen(this.lv);
    this.mv=0;this.sel=null;this.won=false;this.busy=false;
    this.hist=[];this.flyBots=[];this.pourAnim=null;this.pouringFrom=null;this.particles=[];this.ripples=[];this.hover=-1;this.pendingC={};
    this._prevOrders=[];this._prevDone=new Set();
    this.layout();this.ui();this.hideWin();
  },

  next(){this.lv++;this.maxLv=Math.max(this.maxLv,this.lv);this.saveProgress();this.restart()},

  isSrt(b){return !!b&&b.length===CAP&&b.every(c=>c===b[0])},
  isDone(){return this.bots.every(b=>b===null||b.length===0)},
  activeOrders(){return this.orders.filter(ci=>!this.doneC.has(ci)).slice(0,3)},
  isColorActive(ci){return this.activeOrders().includes(ci)},
  isPendingBottle(i){
    const b=this.bots[i];
    return !!(b&&this.isSrt(b)&&this.pendingC[b[0]]===i);
  },

  hitAt(tx,ty){
    for(const r2 of this.rects){
      if(this.bots[r2.idx]===null||this.isPendingBottle(r2.idx))continue;
      if(tx>=r2.x-10&&tx<=r2.x+r2.w+12&&ty>=r2.y-16&&ty<=r2.y+r2.h+10) return r2.idx;
    }
    return -1;
  },

  trackPointer(e){
    const r=cv.getBoundingClientRect();
    this.hover=this.hitAt(e.clientX-r.left,e.clientY-r.top);
  },

  // ── Tap ──
  tap(e){
    SFX.init();
    if(this.won||this.busy)return;
    const r=cv.getBoundingClientRect();
    const tx=e.clientX-r.left, ty=e.clientY-r.top;
    const hit=this.hitAt(tx,ty);
    this.spawnRipple(tx,ty,hit===-1?'rgba(255,255,255,.16)':'rgba(255,210,63,.22)',hit===-1?22:34);
    if(hit===-1){
      if(this.sel!==null){
        SFX.play('des');
        const r2=this.rects[this.sel];if(r2)addTween(r2,{offY:0,scl:1},.14,Ease.outQuad);
        this.sel=null;
      }
      return;
    }
    if(this.bots[hit]===null)return;
    if(this.sel===null){
      if(this.bots[hit].length>0){this.sel=hit;SFX.play('sel');
        // Bounce up
        const r2=this.rects[hit];
        r2.offY=0;
        addTween(r2,{offY:-10,scl:1.04},.18,Ease.outBack);
      }
    } else if(this.sel===hit){
      SFX.play('des');
      const r2=this.rects[hit];
      addTween(r2,{offY:0,scl:1},.14,Ease.outQuad);
      this.sel=null;
    } else {
      this.doPour(this.sel,hit);
    }
  },

  doPour(fi,ti){
    const from=this.bots[fi], to=this.bots[ti];
    if(!from||!to){SFX.play('err');this.sel=null;return}
    const tc=from[from.length-1];
    const fr=this.rects[fi], tr=this.rects[ti];
    if(to.length>=CAP||(to.length>0&&to[to.length-1]!==tc)){
      SFX.play('err');this.sel=null;
      const r2=this.rects[fi];addTween(r2,{offY:0,scl:1},.12,Ease.outQuad);
      this.spawnRipple(tr.x+tr.w/2,tr.y+tr.h/2,'rgba(255,86,86,.22)',26);
      // Shake the target
      tr.offX=0;
      addTween(tr,{offX:6},.05,Ease.linear,null,()=>{
        addTween(tr,{offX:-6},.05,Ease.linear,null,()=>{
          addTween(tr,{offX:4},.04,Ease.linear,null,()=>{
            addTween(tr,{offX:0},.06,Ease.outQuad);
          });
        });
      });
      return;
    }
    // Count
    let cnt=0,tf=[...from],tt=[...to];
    while(tf.length>0&&tf[tf.length-1]===tc&&tt.length<CAP){tt.push(tf.pop());cnt++}

    this.hist.push({bots:this.bots.map(b=>b?[...b]:null),doneC:[...this.doneC],pendingC:{...this.pendingC}});
    this.sel=null;this.busy=true;this.pouringFrom=fi;
    if(navigator.vibrate) navigator.vibrate(10);

    const dir=tr.x>=fr.x?1:-1;
    const finalRot=dir*1.02;
    const targetMouthX=tr.x+tr.w/2;
    const targetMouthY=tr.y+this.capH+2;
    const pivotX=fr.x+fr.w/2,pivotY=fr.y+fr.h;
    const lipLX=dir*fr.w*.42,lipLY=this.capH*.7-fr.h;
    const cs=Math.cos(finalRot),sn=Math.sin(finalRot);
    const lipRX=lipLX*cs-lipLY*sn,lipRY=lipLX*sn+lipLY*cs;
    const pourOffX=targetMouthX-lipRX-pivotX;
    const pourOffY=targetMouthY-6-lipRY-pivotY;

    // Phase 1: move above the receiving bottle, then tilt so the mouth aims into it.
    addTween(fr,{offX:pourOffX,offY:pourOffY+this.BH*.16,rot:0,scl:1.03},.24,Ease.inOutCubic,null,()=>{
    SFX.play('pour');
    addTween(fr,{offX:pourOffX,offY:pourOffY, rot:finalRot, scl:1.03},.26,Ease.outQuart,null,()=>{
      // Phase 2: Pour — transfer layers over time
      this.pourAnim={fi,ti,tc,cnt,p:0,fromStart:[...this.bots[fi]],toStart:[...this.bots[ti]]};
      const pourObj={p:0};
      addTween(pourObj,{p:1},.16*cnt+.28,Ease.inOutSine,(raw)=>{
        this.pourAnim.p=raw;
      },()=>{
        for(let i=0;i<cnt;i++){
          const f2=this.bots[fi],t2=this.bots[ti];
          if(f2.length>0)t2.push(f2.pop());
        }
        this.pourAnim=null;

        // Phase 3: Settle back
        addTween(fr,{offX:0,offY:0,rot:0,scl:1},.26,Ease.outBack,null,()=>{
          this.pouringFrom=null;
          this.mv++;this.ui();

          // Check completion
          const tb=this.bots[ti];
          if(this.isSrt(tb)&&!this.doneC.has(tb[0])){
            SFX.play('done');
            this.spawnParticles(tr.x+tr.w/2, tr.y+tr.h/2, C[tb[0]].f, 22);
            this.spawnRipple(tr.x+tr.w/2, tr.y+tr.h/2, C[tb[0]].l, 46);

            if(this.isColorActive(tb[0])){
              setTimeout(()=>this.flyToBag(ti,tb[0]),200);
            } else {
              this.pendingC[tb[0]]=ti;
              this.upOrders();
              this.checkWin();
            }
          } else {
            this.checkWin();
          }
        });
      });
    });
    });
  },

  flyToBag(bi,ci){
    SFX.play('fly');
    this.busy=true;
    const r=this.rects[bi];
    const layers=[...this.bots[bi]];

    // Find bag target position
    const bagEls=document.querySelectorAll('.oslot');
    const oi=[...bagEls].findIndex(el=>Number(el.dataset.ci)===ci);
    let tgtX=this.cw/2, tgtY=-40;
    if(oi>=0&&bagEls[oi]){
      const br=bagEls[oi].getBoundingClientRect();
      const cr=cv.getBoundingClientRect();
      tgtX=br.left+br.width/2-cr.left;
      tgtY=br.top+br.height/2-cr.top;
    }

    const fb={bi,ci,layers,
      sx:r.x+r.w/2, sy:r.y+r.h/2,
      cx:r.x+r.w/2, cy:r.y+r.h/2,
      tx:tgtX, ty:tgtY,
      scl:1, alpha:1, rot:0, done:false};
    this.flyBots.push(fb);

    // Hide original
    r.alpha=0;

    // Animate with tween
    addTween(fb,{cx:tgtX, cy:tgtY, scl:.25, rot:Math.PI*.35},.58,Ease.inOutCubic,null,()=>{
      fb.done=true;
      this.doneC.add(ci);
      delete this.pendingC[ci];
      this.bots[bi]=null;
      r.alpha=1;
      this.flyBots=this.flyBots.filter(f=>!f.done);
      this.upOrders();
      this.spawnParticles(tgtX, tgtY, C[ci].f, 16);
      this.spawnRipple(tgtX, tgtY, C[ci].l, 38);

      // Check win
      if(!this.collectPendingActive())this.checkWin();
    });

    // Separate alpha tween for fade at end
    addTween(fb,{alpha:0},.58,Ease.inQuad);
  },

  collectPendingActive(){
    const active=this.activeOrders();
    const ci=active.find(c=>this.pendingC[c]!==undefined);
    if(ci===undefined)return false;
    const bi=this.pendingC[ci];
    const b=this.bots[bi];
    if(!b||!this.isSrt(b)){
      delete this.pendingC[ci];
      return false;
    }
    this.busy=true;
    setTimeout(()=>this.flyToBag(bi,ci),160);
    return true;
  },

  checkWin(){
    if(this.isDone()){
      this.won=true;this.busy=false;
      SFX.play('win');
      setTimeout(()=>this.showWin(),350);
    } else {
      this.busy=false;
    }
  },

  undo(){
    if(!this.hist.length||this.busy||this.won)return;
    tweens.length=0;
    const snap=this.hist.pop();
    this.bots=snap.bots;
    this.doneC=new Set(snap.doneC);
    this.pendingC=snap.pendingC??{};
    this.mv--;this.sel=null;this.pouringFrom=null;
    this.layout();this.ui();
  },

  toggleSound(){
    SFX.init();SFX.on=!SFX.on;
    document.getElementById('stg').textContent=SFX.on?'🔊':'🔇';
    try{localStorage.setItem('orderArvinSfx',SFX.on?'1':'0')}catch(_){}
  },

  // ── Particles ──
  spawnParticles(x,y,color,n){
    n=Math.min(n,14);
    for(let i=0;i<n;i++){
      const angle=Math.random()*Math.PI*2;
      const speed=35+Math.random()*110;
      this.particles.push({
        x,y, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed-30,
        life:1, decay:.65+Math.random()*.75, size:1.8+Math.random()*3.8, color,
        spin:Math.random()*Math.PI, shape:Math.random()>.65?'spark':'dot'
      });
    }
  },

  spawnRipple(x,y,color,maxR){
    this.ripples.push({x,y,color,maxR,r:0,life:1});
    if(this.ripples.length>10)this.ripples.shift();
  },

  updateParticles(dt){
    for(let i=this.particles.length-1;i>=0;i--){
      const p=this.particles[i];
      p.x+=p.vx*dt; p.y+=p.vy*dt;
      p.vy+=120*dt; // gravity
      p.spin+=dt*8;
      p.life-=p.decay*dt;
      if(p.life<=0) this.particles.splice(i,1);
    }
  },

  updateRipples(dt){
    for(let i=this.ripples.length-1;i>=0;i--){
      const r=this.ripples[i];
      r.life-=dt*2.6;
      r.r+=(r.maxR-r.r)*Math.min(1,dt*8);
      if(r.life<=0) this.ripples.splice(i,1);
    }
  },

  drawBackground(){
  },

  drawRipples(){
    for(const r of this.ripples){
      cx.save();
      cx.globalAlpha=Math.max(0,r.life)*.75;
      cx.strokeStyle=r.color;cx.lineWidth=2;
      cx.beginPath();cx.arc(r.x,r.y,r.r,0,Math.PI*2);cx.stroke();
      cx.restore();
    }
  },

  drawParticles(){
    for(const p of this.particles){
      cx.save();
      cx.globalAlpha=Math.max(0,p.life);
      cx.fillStyle=p.color;
      cx.shadowColor=p.color;cx.shadowBlur=3;
      cx.beginPath();
      if(p.shape==='spark'){
        cx.translate(p.x,p.y);cx.rotate(p.spin);
        const s=p.size*p.life;
        cx.moveTo(0,-s*1.8);cx.lineTo(s*.45,-s*.45);cx.lineTo(s*1.8,0);cx.lineTo(s*.45,s*.45);cx.lineTo(0,s*1.8);cx.lineTo(-s*.45,s*.45);cx.lineTo(-s*1.8,0);cx.lineTo(-s*.45,-s*.45);cx.closePath();
      } else {
        cx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2);
      }
      cx.fill();
      cx.restore();
    }
  },

  // ── Draw ──
  draw(){
    cx.clearRect(0,0,this.cw,this.ch);
    this.drawBackground();
    this.drawRipples();

    const drawOrder=[...this.rects].sort((a,b)=>(a.y+a.h)-(b.y+b.h));
    for(const r of drawOrder){
      const i=r.idx;if(!r||r.alpha<.01)continue;
      if(i===this.pouringFrom)continue;
      if(this.flyBots.some(f=>f.bi===i))continue;

      const layers=this.bots[i];
      if(layers===null)continue;
      const isSel=this.sel===i;
      const isSrt=this.isSrt(layers)&&layers.length>0;
      const isHover=this.hover===i&&!this.busy&&!this.won;

      cx.save();
      cx.globalAlpha=r.alpha;
      if(isHover&&!isSel){
        cx.shadowColor='rgba(255,255,255,.22)';
        cx.shadowBlur=6;
      }
      const pcx=r.x+r.w/2, pcy=r.y+r.h;
      cx.translate(pcx+r.offX,pcy+r.offY);
      cx.rotate(r.rot);
      cx.scale(r.scl,r.scl);
      cx.translate(-pcx,-pcy);
      this.drawBot(r.x,r.y,r.w,r.h,layers,isSel,isSrt,isHover,i);
      cx.restore();
    }

    // Pour stream
    if(this.pourAnim) this.drawPour();

    // Flying bottles
    for(const fb of this.flyBots){
      cx.save();
      cx.globalAlpha=Math.max(0,fb.alpha);
      cx.translate(fb.cx,fb.cy);
      cx.scale(fb.scl,fb.scl);
      cx.rotate(fb.rot);
      cx.translate(-this.BW/2,-this.BH/2);
      this.drawBot(0,0,this.BW,this.BH,fb.layers,false,true,false,-1);
      cx.restore();
    }

    // The active source bottle is always drawn above the board, stream, and flyers.
    if(this.pouringFrom!==null){
      const i=this.pouringFrom,r=this.rects[i],layers=this.bots[i];
      if(r&&layers&&r.alpha>=.01){
        cx.save();
        cx.globalAlpha=r.alpha;
        const pcx=r.x+r.w/2, pcy=r.y+r.h;
        cx.translate(pcx+r.offX,pcy+r.offY);
        cx.rotate(r.rot);
        cx.scale(r.scl,r.scl);
        cx.translate(-pcx,-pcy);
        this.drawBot(r.x,r.y,r.w,r.h,layers,true,false,false,i);
        cx.restore();
      }
    }

    this.drawParticles();
  },

  drawBot(x,y,w,h,layers,isSel,isSrt,isHover,idx){
    const cH=this.capH, bY=y+cH, bH=h-cH, r=w*.28;
    let renderLayers=layers,sourceDrain=0,targetFill=0;
    if(this.pourAnim){
      const a=this.pourAnim,prog=Math.min(a.cnt,a.p*a.cnt);
      const whole=Math.floor(prog),frac=prog-whole;
      if(idx===a.fi){
        renderLayers=a.fromStart.slice(0,Math.max(0,a.fromStart.length-whole));
        sourceDrain=frac;
      } else if(idx===a.ti){
        renderLayers=a.toStart.concat(Array(whole).fill(a.tc));
        targetFill=frac;
      }
    }

    // Glow
    if(isSel||isSrt||isHover){
      cx.save();
      cx.shadowColor=isSel?'#ffd23f':isSrt?'#4ecdc4':'rgba(255,255,255,.5)';
      cx.shadowBlur=isHover&&!isSel?6:10;
      cx.fillStyle=isSel?'rgba(255,210,63,.05)':isSrt?'rgba(78,205,196,.04)':'rgba(255,255,255,.025)';
      cx.beginPath();this.rr(x-3,bY-3,w+6,bH+6,r+2);cx.fill();
      cx.restore();
    }

    // Ground shadow
    cx.save();
    const floorGlow=cx.createRadialGradient(x+w/2,y+h+5,1,x+w/2,y+h+5,w*.6);
    floorGlow.addColorStop(0,'rgba(0,0,0,.45)');
    floorGlow.addColorStop(1,'rgba(0,0,0,0)');
    cx.fillStyle=floorGlow;
    cx.beginPath();cx.ellipse(x+w/2,y+h+5,w*.55,6,0,0,Math.PI*2);cx.fill();
    cx.restore();

    // Glass body gradient
    const gg=cx.createLinearGradient(x,bY,x+w,bY+bH);
    gg.addColorStop(0,'rgba(180,200,235,0.14)');
    gg.addColorStop(.18,'rgba(200,215,240,0.07)');
    gg.addColorStop(.5,'rgba(220,230,250,0.03)');
    gg.addColorStop(.82,'rgba(180,200,230,0.06)');
    gg.addColorStop(1,'rgba(140,160,200,0.14)');
    cx.fillStyle=gg;
    cx.beginPath();this.rr(x,bY,w,bH,r);cx.fill();

    // Layers
    const pad=Math.max(1.4,w*.04),lw=w-pad*2,lh=(bH-pad*2)/CAP,overlap=.75;
    let revealFrom=renderLayers.length;
    if(!isSrt&&renderLayers.length){
      const topColor=renderLayers[renderLayers.length-1];
      revealFrom=renderLayers.length-1;
      while(revealFrom>0&&renderLayers[revealFrom-1]===topColor)revealFrom--;
    }
    cx.save();
    cx.beginPath();this.rr(x+pad,bY+pad,lw,bH-pad*2,Math.max(r-3,4));cx.clip();
    for(let j=0;j<renderLayers.length;j++){
      const realC=C[renderLayers[j]];
      const hidden=!isSrt&&j<revealFrom;
      const c=hidden?{f:'#151722',m:'#10121b',d:'#070811',l:'#232637',s:'#34384d'}:realC;
      let ly=bY+bH-pad-(j+1)*lh;
      const lyTop=ly;
      let drawH=lh+overlap*2;
      if(sourceDrain>0&&idx===this.pourAnim.fi&&j===renderLayers.length-1){
        drawH=Math.max(1,lh*(1-sourceDrain)+overlap);
        ly+=lh-drawH+overlap;
      }
      const lg=cx.createLinearGradient(x+pad,0,x+pad+lw,0);
      lg.addColorStop(0,c.d);lg.addColorStop(0.15,c.m);lg.addColorStop(0.4,c.f);
      lg.addColorStop(0.6,c.l);lg.addColorStop(0.85,c.f);lg.addColorStop(1,c.m);
      cx.fillStyle=lg;
      cx.beginPath();
      const sameAbove=renderLayers[j+1]===renderLayers[j], sameBelow=renderLayers[j-1]===renderLayers[j];
      const bt=j===renderLayers.length-1&&!sameAbove?3:0, bb=j===0&&!sameBelow?Math.max(r-2,4):0;
      this.rrC(x+pad,ly-overlap,lw,drawH,bt,bt,bb,bb);
      cx.fill();
      if(hidden){
        cx.fillStyle='rgba(255,255,255,.62)';
        cx.font=`700 ${Math.max(10,w*.32)}px Outfit, sans-serif`;
        cx.textAlign='center';
        cx.textBaseline='middle';
        cx.fillText('?',x+w/2,ly+Math.min(lh*.55,drawH*.55));
      }

      if(j<renderLayers.length-1&&!sameAbove){
        cx.fillStyle='rgba(255,255,255,0.09)';
        cx.fillRect(x+pad,lyTop+.35,lw,.55);
      }

      // Keep the original brighter, candy-like liquid surface.
      if(j===renderLayers.length-1){
        const sg=cx.createLinearGradient(x+pad,ly,x+pad,ly+lh*.4);
        sg.addColorStop(0,'rgba(255,255,255,0.24)');
        sg.addColorStop(1,'rgba(255,255,255,0)');
        cx.fillStyle=sg;
        cx.beginPath();this.rrC(x+pad,ly-overlap,lw,lh*.35+overlap,bt,bt,0,0);cx.fill();
        cx.fillStyle='rgba(255,255,255,0.3)';
        cx.beginPath();cx.ellipse(x+pad+lw*.3,ly+4,lw*.12,2,0,0,Math.PI*2);cx.fill();
      }
    }

    if(targetFill>0&&this.pourAnim&&this.pourAnim.ti===idx){
      const a=this.pourAnim,c=C[a.tc];
      const part=targetFill;
      if(part>0){
        const base=bY+bH-pad-renderLayers.length*lh;
        const ph=Math.max(2,lh*part);
        const py=base-ph;
        const fillW=lw;
        const fillX=x+pad;
        const lg=cx.createLinearGradient(x+pad,0,x+pad+lw,0);
        lg.addColorStop(0,c.d);lg.addColorStop(.18,c.m);lg.addColorStop(.48,c.f);lg.addColorStop(.68,c.l);lg.addColorStop(1,c.m);

        // Incoming liquid travels down the center into a normal rising surface.
        const streamX=x+w/2;
        const streamTop=bY+pad+1;
        const streamBottom=Math.max(streamTop+4,py+1.5);
        const pulse=.88+Math.sin(performance.now()/70)*.08;
        const streamW=Math.max(3.4,w*.12*pulse);
        const sg=cx.createLinearGradient(streamX-streamW,0,streamX+streamW,0);
        sg.addColorStop(0,c.m);sg.addColorStop(.5,c.l);sg.addColorStop(1,c.m);
        cx.globalAlpha=.86;
        cx.fillStyle=sg;
        cx.shadowColor=c.f;cx.shadowBlur=4;
        cx.beginPath();this.rrC(streamX-streamW/2,streamTop,streamW,streamBottom-streamTop,streamW/2,streamW/2,streamW/2,streamW/2);cx.fill();
        cx.globalAlpha=.34;
        cx.fillStyle=c.s;
        cx.beginPath();this.rrC(streamX-streamW*.12,streamTop+2,streamW*.22,streamBottom-streamTop-2,streamW*.11,streamW*.11,streamW*.11,streamW*.11);cx.fill();
        cx.globalAlpha=1;
        cx.shadowBlur=0;

        cx.fillStyle=lg;
        cx.beginPath();this.rrC(fillX,py-overlap,fillW,ph+overlap*2,3,3,0,0);cx.fill();
        const surf=cx.createLinearGradient(fillX,py,fillX,py+Math.min(ph*.35,8));
        surf.addColorStop(0,'rgba(255,255,255,.24)');
        surf.addColorStop(1,'rgba(255,255,255,0)');
        cx.fillStyle=surf;
        cx.beginPath();this.rrC(fillX,py-overlap,fillW,Math.min(ph*.35,8)+overlap,3,3,0,0);cx.fill();
        cx.fillStyle='rgba(255,255,255,.24)';
        cx.beginPath();cx.ellipse(streamX,py+1.8,Math.max(5,fillW*.2),2.1,0,0,Math.PI*2);cx.fill();
      }
    }

    if(sourceDrain>0&&this.pourAnim&&this.pourAnim.fi===idx){
      const a=this.pourAnim,c=C[a.tc];
      const r2=this.rects[idx];
      const side=Math.sign(Math.sin(r2.rot||0))||Math.sign(this.rects[a.ti].x-this.rects[a.fi].x)||1;
      const liquidTop=bY+bH-pad-renderLayers.length*lh+sourceDrain*lh;
      const wallX=x+pad+lw*(side>0?.9:.1);
      const lipX=x+pad+lw*(side>0?.96:.04);
      const lipY=bY+pad*.6;
      const innerX=wallX-side*w*.16;
      const startX=wallX;
      const startY=Math.max(bY+pad+6,liquidTop+lh*.2);
      const midX=wallX+side*w*.07;
      const midY=(startY+lipY)*.5;
      cx.save();
      cx.beginPath();this.rr(x+pad,bY+pad,lw,bH-pad*2,Math.max(r-3,4));cx.clip();
      const sheetTop=Math.max(bY+pad+3,startY-lh*.18);
      const sheetIn=innerX-side*w*.04;
      const sheetOut=wallX+side*w*.03;
      const sheetLipIn=lipX-side*w*.16;
      cx.globalAlpha=.68;
      const sheetG=cx.createLinearGradient(sheetIn,0,sheetOut,0);
      sheetG.addColorStop(0,'rgba(255,255,255,.06)');
      sheetG.addColorStop(.35,c.l);
      sheetG.addColorStop(1,c.f);
      cx.fillStyle=sheetG;cx.shadowColor=c.f;cx.shadowBlur=5;
      cx.beginPath();
      cx.moveTo(sheetIn,sheetTop);
      cx.quadraticCurveTo(innerX,midY,sheetLipIn,lipY);
      cx.lineTo(lipX,lipY);
      cx.quadraticCurveTo(sheetOut,midY,wallX,startY);
      cx.closePath();cx.fill();
      cx.globalAlpha=.92;
      cx.strokeStyle=c.f;cx.lineWidth=Math.max(4.2,w*.17);cx.lineCap='round';cx.lineJoin='round';
      cx.shadowColor=c.f;cx.shadowBlur=5;
      cx.beginPath();cx.moveTo(startX,startY);cx.quadraticCurveTo(midX,midY,lipX,lipY);cx.stroke();
      const beadT=.35+sourceDrain*.45;
      const beadX=(1-beadT)*(1-beadT)*startX+2*(1-beadT)*beadT*midX+beadT*beadT*lipX;
      const beadY=(1-beadT)*(1-beadT)*startY+2*(1-beadT)*beadT*midY+beadT*beadT*lipY;
      cx.fillStyle=c.l;cx.globalAlpha=.9;
      cx.beginPath();cx.ellipse(beadX,beadY,Math.max(2.4,w*.08),Math.max(3,w*.11),0,0,Math.PI*2);cx.fill();
      cx.globalAlpha=.48;
      cx.strokeStyle=c.s;cx.lineWidth=Math.max(1.8,w*.07);cx.shadowBlur=0;
      cx.beginPath();cx.moveTo(startX-side*1.5,startY-1);cx.quadraticCurveTo(midX-side*1.5,midY-1,lipX-side*1.5,lipY);cx.stroke();
      cx.restore();
    }
    cx.restore();

    // Glass edge highlights
    const hl=cx.createLinearGradient(x,bY,x+w*.25,bY);
    hl.addColorStop(0,'rgba(255,255,255,0.28)');
    hl.addColorStop(.6,'rgba(255,255,255,0.08)');
    hl.addColorStop(1,'rgba(255,255,255,0)');
    cx.fillStyle=hl;
    cx.beginPath();this.rrC(x+1.5,bY+5,w*.16,bH-10,2,2,2,2);cx.fill();

    const hr=cx.createLinearGradient(x+w*.78,0,x+w,0);
    hr.addColorStop(0,'rgba(0,0,0,0)');
    hr.addColorStop(1,'rgba(0,0,0,0.14)');
    cx.fillStyle=hr;
    cx.beginPath();this.rr(x,bY,w,bH,r);cx.fill();

    cx.fillStyle='rgba(255,255,255,0.10)';
    cx.beginPath();cx.ellipse(x+w/2,bY+1.5,w*.42,1.3,0,0,Math.PI*2);cx.fill();

    // Border
    cx.strokeStyle=isSel?'rgba(255,210,63,.44)':isSrt?'rgba(78,205,196,.34)':isHover?'rgba(255,255,255,.22)':'rgba(255,255,255,.14)';
    cx.lineWidth=isSel?2:1;
    cx.beginPath();this.rr(x,bY,w,bH,r);cx.stroke();

    const cw2=w*.58,cx2=x+(w-cw2)/2;
    const neckTop=y+cH*.59,neckBot=bY+5,neckW=cw2*.46,shoulderW=w*1.02,midX=x+w/2;
    cx.beginPath();
    cx.moveTo(midX-neckW/2,neckTop);
    cx.bezierCurveTo(midX-neckW*.58,neckTop+cH*.34,x+w*.06,bY+1,x+w*.045,neckBot);
    cx.lineTo(x+w*.955,neckBot);
    cx.bezierCurveTo(x+w*.94,bY+1,midX+neckW*.58,neckTop+cH*.34,midX+neckW/2,neckTop);
    cx.closePath();
    const ng=cx.createLinearGradient(x,neckTop,x+w,neckBot);
    ng.addColorStop(0,'rgba(200,215,240,0.26)');
    ng.addColorStop(.5,'rgba(255,255,255,0.14)');
    ng.addColorStop(1,'rgba(140,160,200,0.16)');
    cx.fillStyle=ng;cx.fill();
    cx.save();cx.clip();
    const nhl=cx.createLinearGradient(x+w*.04,0,x+w*.18,0);
    nhl.addColorStop(0,'rgba(255,255,255,0.35)');
    nhl.addColorStop(1,'rgba(255,255,255,0)');
    cx.fillStyle=nhl;cx.fillRect(x,neckTop-2,w*.2,cH+10);
    cx.restore();
    cx.strokeStyle='rgba(255,255,255,.22)';cx.lineWidth=1;
    cx.beginPath();
    cx.moveTo(midX-neckW/2,neckTop);
    cx.bezierCurveTo(midX-neckW*.58,neckTop+cH*.34,x+w*.06,bY+1,x+w*.045,neckBot);
    cx.moveTo(midX+neckW/2,neckTop);
    cx.bezierCurveTo(midX+neckW*.58,neckTop+cH*.34,x+w*.94,bY+1,x+w*.955,neckBot);
    cx.stroke();

    if(isSrt){
      this.drawPolishedCap(x,y,w,cH,cw2,cx2);
    } else {
      this.drawPolishedMouth(x,y,w,cH,cw2);
    }

    // Checkmark
    if(isSrt&&layers.length>0){
      const ckx=x+w,cky=bY+bH;
      cx.fillStyle='#38B000';
      cx.beginPath();cx.arc(ckx,cky,7,0,Math.PI*2);cx.fill();
      cx.fillStyle='rgba(56,176,0,0.3)';
      cx.beginPath();cx.arc(ckx,cky,10,0,Math.PI*2);cx.fill();
      cx.strokeStyle='#fff';cx.lineWidth=1.8;cx.lineCap='round';
      cx.beginPath();cx.moveTo(ckx-3,cky);cx.lineTo(ckx-0.5,cky+2.5);cx.lineTo(ckx+3.5,cky-2.5);cx.stroke();
    }
  },

  drawPour(){
    const a=this.pourAnim;if(!a)return;
    const fr=this.rects[a.fi],tr=this.rects[a.ti];if(!fr||!tr)return;
    const c=C[a.tc];
    const pourDir=tr.x>=fr.x?1:-1;
    const mouth=this.transformBottlePoint(fr,fr.x+fr.w/2+pourDir*fr.w*.22,fr.y+this.capH*.55);
    const lip=this.transformBottlePoint(fr,fr.x+fr.w/2+pourDir*fr.w*.42,fr.y+this.capH*.7);
    const fCX=lip.x, fTop=lip.y;
    const tCX=tr.x+tr.w/2, tTop=tr.y+this.capH+4;

    cx.save();
    cx.globalAlpha=.88;
    cx.fillStyle=c.f;cx.shadowColor=c.f;cx.shadowBlur=5;
    cx.beginPath();cx.arc(mouth.x,mouth.y,3.8,0,Math.PI*2);cx.fill();
    const cpX=fCX+(tCX-fCX)*.48;
    const cpY=Math.min(fTop,tTop)-12-Math.abs(fCX-tCX)*.08;
    const ease=t=>1-Math.pow(1-t,3);
    const end=ease(Math.min(a.p*1.08,1));
    const start=Math.max(0,end-.94);
    const pts=[];
    const steps=28;
    for(let i=0;i<=steps;i++){
      const q=start+(end-start)*(i/steps);
      const wob=Math.sin((q*16+a.p*10))*0.75*(1-q);
      const x=(1-q)*(1-q)*fCX+2*(1-q)*q*cpX+q*q*tCX+wob;
      const y=(1-q)*(1-q)*fTop+2*(1-q)*q*cpY+q*q*tTop;
      pts.push({x,y,t:q});
    }
    if(pts.length<2){cx.restore();return}

    const left=[],right=[];
    for(let i=0;i<pts.length;i++){
      const p=pts[i],p0=pts[Math.max(0,i-1)],p1=pts[Math.min(pts.length-1,i+1)];
      const dx=p1.x-p0.x,dy=p1.y-p0.y,len=Math.hypot(dx,dy)||1;
      const nx=-dy/len,ny=dx/len;
      const local=i/(pts.length-1);
      const taper=Math.sin(local*Math.PI);
      const width=2.4+5.8*Math.pow(taper,.5)*(1-.16*p.t);
      left.push({x:p.x+nx*width,y:p.y+ny*width});
      right.push({x:p.x-nx*width,y:p.y-ny*width});
    }

    cx.globalAlpha=.88;
    cx.shadowColor=c.f;cx.shadowBlur=6;
    const rg=cx.createRadialGradient((fCX+tCX)/2,(fTop+tTop)/2,1,(fCX+tCX)/2,(fTop+tTop)/2,Math.max(24,Math.abs(fCX-tCX)));
    rg.addColorStop(0,c.l);rg.addColorStop(.42,c.f);rg.addColorStop(1,c.m);
    cx.fillStyle=rg;
    cx.beginPath();
    cx.moveTo(left[0].x,left[0].y);
    for(const p of left)cx.lineTo(p.x,p.y);
    for(let i=right.length-1;i>=0;i--)cx.lineTo(right[i].x,right[i].y);
    cx.closePath();cx.fill();

    // Glossy inner ribbon.
    cx.shadowBlur=0;
    cx.globalAlpha=.34;
    cx.strokeStyle=c.s;cx.lineWidth=2.2;cx.lineCap='round';cx.lineJoin='round';
    cx.beginPath();
    for(let i=0;i<pts.length;i++){
      const p=pts[i],p0=pts[Math.max(0,i-1)],p1=pts[Math.min(pts.length-1,i+1)];
      const dx=p1.x-p0.x,dy=p1.y-p0.y,len=Math.hypot(dx,dy)||1;
      const hx=-dy/len*2.2,hy=dx/len*2.2;
      if(i===0)cx.moveTo(p.x+hx,p.y+hy);else cx.lineTo(p.x+hx,p.y+hy);
    }
    cx.stroke();

    // Rounded moving front and small splash at the receiving bottle.
    const tip=pts[pts.length-1];
    cx.globalAlpha=.9;cx.fillStyle=c.l;cx.shadowColor=c.f;cx.shadowBlur=5;
    cx.beginPath();cx.arc(tip.x,tip.y,4.3,0,Math.PI*2);cx.fill();
    if(end>.72){
      for(let d=0;d<4;d++){
        const pulse=(a.p*5+d*.23)%1;
        cx.globalAlpha=.45*(1-pulse);
        cx.beginPath();cx.arc(tCX+(d-1.5)*2.2,tTop+pulse*9,2.2*(1-pulse*.45),0,Math.PI*2);cx.fill();
      }
    }

    cx.restore();
  },

  drawPolishedMouth(x,y,w,cH,cw2){
    const mCx=x+w/2,mCy=y+cH*.59,mRx=cw2*.46,mRy=3.6;
    const rim=cx.createLinearGradient(mCx-mRx,mCy,mCx+mRx,mCy);
    rim.addColorStop(0,'#7a8090');
    rim.addColorStop(.35,'#d9dde8');
    rim.addColorStop(.55,'#ffffff');
    rim.addColorStop(.75,'#c5cbd6');
    rim.addColorStop(1,'#5a6070');
    cx.fillStyle=rim;
    cx.beginPath();cx.ellipse(mCx,mCy,mRx,mRy,0,0,Math.PI*2);cx.fill();

    const innerRx=mRx*.78,innerRy=mRy*.72;
    const hole=cx.createRadialGradient(mCx,mCy+.5,1,mCx,mCy+.5,innerRx);
    hole.addColorStop(0,'#02030a');
    hole.addColorStop(.6,'#0a0c18');
    hole.addColorStop(1,'#1a1d2c');
    cx.fillStyle=hole;
    cx.beginPath();cx.ellipse(mCx,mCy+.5,innerRx,innerRy,0,0,Math.PI*2);cx.fill();

    cx.save();
    cx.beginPath();cx.ellipse(mCx,mCy+.5,innerRx,innerRy,0,0,Math.PI*2);cx.clip();
    cx.fillStyle='rgba(140,160,200,0.32)';
    cx.beginPath();cx.ellipse(mCx,mCy-innerRy*.5,innerRx*.92,innerRy*.7,0,0,Math.PI*2);cx.fill();
    cx.restore();

    cx.fillStyle='rgba(255,255,255,0.85)';
    cx.beginPath();cx.ellipse(mCx-mRx*.25,mCy+mRy*.45,mRx*.32,mRy*.18,0,0,Math.PI*2);cx.fill();
    cx.strokeStyle='rgba(0,0,0,0.4)';
    cx.lineWidth=1;
    cx.beginPath();cx.ellipse(mCx,mCy,mRx,mRy,0,0,Math.PI*2);cx.stroke();
  },

  drawPolishedCap(x,y,w,cH,cw2,cx2){
    const cg=cx.createLinearGradient(cx2,y,cx2+cw2,y+cH);
    cg.addColorStop(0,'#3a3e48');
    cg.addColorStop(.2,'#7a8090');
    cg.addColorStop(.45,'#c8cdd8');
    cg.addColorStop(.55,'#eef1f6');
    cg.addColorStop(.75,'#9ea4b2');
    cg.addColorStop(1,'#2e323c');
    cx.fillStyle=cg;
    cx.beginPath();this.rrC(cx2,y+2,cw2,cH,3,3,2,2);cx.fill();

    const ts=cx.createLinearGradient(cx2,y+2,cx2,y+cH*.5);
    ts.addColorStop(0,'rgba(255,255,255,0.55)');
    ts.addColorStop(1,'rgba(255,255,255,0)');
    cx.fillStyle=ts;
    cx.beginPath();this.rrC(cx2+1,y+2.5,cw2-2,cH*.45,2.5,2.5,0,0);cx.fill();

    const tg=cx.createRadialGradient(x+w/2-cw2*.15,y+3,0,x+w/2,y+3,cw2*.5);
    tg.addColorStop(0,'#f4f6fa');
    tg.addColorStop(.5,'#b8bdc8');
    tg.addColorStop(1,'#5c6270');
    cx.fillStyle=tg;
    cx.beginPath();cx.ellipse(x+w/2,y+3,cw2*.42,2.4,0,0,Math.PI*2);cx.fill();

    cx.strokeStyle='rgba(0,0,0,0.32)';
    cx.lineWidth=.7;
    for(let i=1;i<4;i++){
      const ly=y+2+cH*.5+(cH*.4)*(i/4);
      cx.beginPath();cx.moveTo(cx2+1.5,ly);cx.lineTo(cx2+cw2-1.5,ly);cx.stroke();
    }
    cx.fillStyle='rgba(0,0,0,0.3)';
    cx.fillRect(cx2+1,y+cH+.5,cw2-2,1);
    cx.strokeStyle='rgba(0,0,0,0.4)';
    cx.lineWidth=.8;
    cx.beginPath();this.rrC(cx2,y+2,cw2,cH,3,3,2,2);cx.stroke();
    cx.fillStyle='rgba(255,255,255,0.7)';
    cx.beginPath();cx.ellipse(cx2+cw2*.32,y+cH*.32,cw2*.13,1.2,0,0,Math.PI*2);cx.fill();
  },

  transformBottlePoint(r,x,y){
    const pcx=r.x+r.w/2,pcy=r.y+r.h;
    const sx=r.scl||1,rot=r.rot||0;
    const dx=(x-pcx)*sx,dy=(y-pcy)*sx;
    const cs=Math.cos(rot),sn=Math.sin(rot);
    return{x:pcx+r.offX+dx*cs-dy*sn,y:pcy+r.offY+dx*sn+dy*cs};
  },

  rr(x,y,w,h,r){cx.moveTo(x+r,y);cx.arcTo(x+w,y,x+w,y+h,r);cx.arcTo(x+w,y+h,x,y+h,r);cx.arcTo(x,y+h,x,y,r);cx.arcTo(x,y,x+w,y,r);cx.closePath()},
  rrC(x,y,w,h,tl,tr,br,bl){cx.moveTo(x+tl,y);cx.arcTo(x+w,y,x+w,y+h,tr);cx.arcTo(x+w,y+h,x,y+h,br);cx.arcTo(x,y+h,x,y,bl);cx.arcTo(x,y,x+w,y,tl);cx.closePath()},

  // ── UI ──
  ui(){
    document.getElementById('slv').textContent=this.lv;
    document.getElementById('smv').textContent=this.mv;
    document.getElementById('sbt').textContent=this.best[this.lv]||'-';
    document.getElementById('ubtn').className=`btn ${this.hist.length?'':'dis'}`;
    this.upOrders();
  },
  showLevels(){
    if(this.busy)return;
    document.body.style.overflow='hidden';
    const max=this.maxLv,locked=max+1;
    const tiles=[];
    for(let i=1;i<=max;i++){
      const cls=`ltile${i===this.lv?' cur':''}${this.best[i]?' done':''}`;
      tiles.push(`<button class="${cls}" onclick="G.selectLevel(${i})">${i}</button>`);
    }
    tiles.push(`<button class="ltile lock" aria-label="Level ${locked} locked">🔒</button>`);
    document.getElementById('wc').innerHTML=`<div class="lov" role="dialog" aria-modal="true"><h2>Levels</h2><p>One locked level appears after your latest unlock.</p><div class="lgrid">${tiles.join('')}</div><button class="btn" onclick="G.hideWin()">Close</button></div>`;
    requestAnimationFrame(()=>{const cur=document.querySelector('.ltile.cur');if(cur)cur.scrollIntoView({block:'center',behavior:'smooth'})});
  },
  // Debug tool — tap level number 5× fast to trigger
  _dbgTaps:0, _dbgTimer:null,
  debugTap(){
    this._dbgTaps++;
    clearTimeout(this._dbgTimer);
    this._dbgTimer=setTimeout(()=>{this._dbgTaps=0},600);
    if(this._dbgTaps>=5){
      this._dbgTaps=0;
      const pw=prompt('🔐 Debug password:');
      if(pw!=='kirana')return;
      const raw=prompt(`Jump to level (current: ${this.lv}):`);
      const lv=Math.min(Math.max(1,parseInt(raw)||1),999);
      if(!lv||lv<1)return;
      this.lv=lv;
      this.maxLv=Math.max(this.maxLv,lv);
      this.saveProgress();
      this.restart();
    }
  },
  selectLevel(lv){
    if(lv<1||lv>this.maxLv||this.busy)return;
    this.lv=lv;
    this.saveProgress();
    this.restart();
  },
  _prevOrders:[],
  _prevDone:new Set(),
  upOrders(){
    const bar=document.getElementById('obar');
    const active=this.activeOrders();
    const prevDone=this._prevDone||new Set();
    const prevOrders=this._prevOrders||[];
    bar.innerHTML='';
    for(const ci of active){
      const c=C[ci],done=this.doneC.has(ci);
      const isCompleting=done&&!prevDone.has(ci);
      const isEntering=!done&&!prevOrders.includes(ci);
      const s=document.createElement('div');
      let cls='oslot';
      if(done) cls+=' done';
      if(isCompleting) cls+=' completing';
      if(isEntering) cls+=' entering';
      s.className=cls;
      s.dataset.ci=ci;
      const col=done?'#38B000':c.f;
      s.innerHTML=`<div class="bh" style="border-color:${col}"></div>`+
        `<div class="bb${done?' dn':''}">`+
          `<div class="bhl"></div>`+
          `<div class="bsh"></div>`+
          `<div class="bfold"></div>`+
          `<div class="bi"><svg width="12" height="18" viewBox="0 0 12 18" fill="none"><rect x="4" y="0" width="4" height="3" rx="1" fill="${col}"/><path d="M3.5 3.5C3.5 3.5 2 5.5 2 7L2 16C2 17 2.8 17.5 3.5 17.5L8.5 17.5C9.2 17.5 10 17 10 16L10 7C10 5.5 8.5 3.5 8.5 3.5Z" fill="${col}"/></svg></div>`+
        `</div>`+
        `<div class="bchk">✓</div>`;
      bar.appendChild(s);
      if(isCompleting||isEntering){
        s.addEventListener('animationend',()=>{
          s.classList.remove('completing','entering');
        },{once:true});
      }
    }
    this._prevOrders=active.slice();
    this._prevDone=new Set(this.doneC);
  },
  hexToRgba(hex,a){
    const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  },
  showWin(){
    const b=this.best[this.lv];if(!b||this.mv<b)this.best[this.lv]=this.mv;this.maxLv=Math.max(this.maxLv,this.lv+1);this.saveProgress();this.ui();
    document.body.style.overflow='hidden';
    document.getElementById('wc').innerHTML=`<div class="wov" role="dialog" aria-modal="true"><h2>🎉 Level ${this.lv} Done!</h2><p>${this.mv} moves${this.best[this.lv]===this.mv?' — New best!':''}</p><div style="display:flex;gap:10px"><button class="btn" onclick="G.restart()">↻ Replay</button><button class="btn pri" onclick="G.next();G.hideWin()">Level ${this.lv+1} →</button></div></div>`;
    const ct=document.getElementById('cc');
    for(let i=0;i<30;i++){const el=document.createElement('div');el.className='cfp';const sz=5+Math.random()*8;el.style.cssText=`left:${Math.random()*100}%;width:${sz}px;height:${sz}px;background:${C[i%C.length].f};border-radius:${Math.random()>.5?'50%':'2px'};animation-duration:${1.3+Math.random()*1.6}s;animation-delay:${Math.random()*.4}s`;ct.appendChild(el)}
  },
  hideWin(){document.getElementById('wc').innerHTML='';document.getElementById('cc').innerHTML='';document.body.style.overflow=''},

  loop(t){
    const dt=Math.min((t-this._lt)/1000,.033);this._lt=t;
    updateTweens(dt);
    this.updateParticles(dt);
    this.updateRipples(dt);

    // Bobbing selected bottle
    if(this.sel!==null&&!this.busy){
      const r=this.rects[this.sel];
      if(r){r.offY=-10+Math.sin(t/180)*2.2;r.scl=1.035+Math.sin(t/220)*.006}
    }

    this.draw();
    requestAnimationFrame(t2=>this.loop(t2));
  },
};

window.G=G;G.init();
