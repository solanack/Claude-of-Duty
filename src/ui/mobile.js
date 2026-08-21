const css = `
.cod-mobile{position:fixed;inset:0;z-index:90;pointer-events:none;touch-action:none;-webkit-user-select:none;user-select:none}
.cod-look{position:absolute;inset:0 0 0 42%;pointer-events:auto;touch-action:none}
.cod-stick{position:absolute;left:max(18px,env(safe-area-inset-left));bottom:max(24px,env(safe-area-inset-bottom));width:132px;height:132px;border-radius:50%;border:1px solid #ffffff38;background:#07101855;box-shadow:inset 0 0 28px #0008;pointer-events:auto}
.cod-knob{position:absolute;left:38px;top:38px;width:56px;height:56px;border-radius:50%;background:#d8f1ff28;border:2px solid #fff8;box-shadow:0 0 18px #77cfff42}
.cod-actions{position:absolute;right:max(16px,env(safe-area-inset-right));bottom:max(18px,env(safe-area-inset-bottom));display:grid;grid-template-columns:62px 76px;grid-template-rows:58px 76px;gap:10px;align-items:end;pointer-events:none}
.cod-btn{pointer-events:auto;border:1px solid #fff6;background:#08111dbd;color:#fff;border-radius:50%;font:800 11px/1 Arial;letter-spacing:.08em;box-shadow:inset 0 0 18px #0009,0 2px 14px #0008;touch-action:none}
.cod-btn:active,.cod-btn.on{background:#dceeff;color:#071018;transform:scale(.94)}
.cod-fire{width:76px;height:76px;border-color:#ff886f99;background:#5b130fc4;grid-column:2;grid-row:2}
.cod-jump{width:58px;height:58px;grid-column:1;grid-row:2}.cod-ads{width:58px;height:58px;grid-column:2;grid-row:1}
.cod-reload{position:absolute;right:max(100px,calc(env(safe-area-inset-right) + 100px));bottom:max(112px,calc(env(safe-area-inset-bottom) + 112px));width:48px;height:48px}
.cod-pause{position:absolute;right:max(14px,env(safe-area-inset-right));top:max(14px,env(safe-area-inset-top));width:44px;height:44px;border-radius:12px;font-size:18px}
.cod-start{position:absolute;inset:0;background:radial-gradient(circle at 50% 42%,#172535dd,#020509f7 68%);display:flex;align-items:center;justify-content:center;pointer-events:auto;padding:24px;text-align:center}
.cod-card{max-width:390px}.cod-card h1{font:900 clamp(38px,12vw,64px)/.84 Arial;letter-spacing:-.06em;color:#fff;text-shadow:0 4px 32px #000}.cod-card h1 span{display:block;color:#f05b43}.cod-card p{margin:22px auto;color:#c5d1db;font:600 13px/1.5 Arial;max-width:300px}.cod-deploy{border:1px solid #fff;background:#e9f4ff;color:#071018;padding:16px 34px;font:900 14px Arial;letter-spacing:.16em;clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
.cod-mobile.paused .cod-stick,.cod-mobile.paused .cod-actions,.cod-mobile.paused .cod-reload,.cod-mobile.paused .cod-look{display:none}
@media (orientation:portrait){.cod-card:after{content:'LANDSCAPE RECOMMENDED';display:block;margin-top:18px;color:#f6b85c;font:800 10px Arial;letter-spacing:.15em}.cod-stick{width:116px;height:116px}.cod-knob{left:34px;top:34px;width:48px;height:48px}}
`;

function button(parent, cls, label, code, input) {
  const b = document.createElement('button');
  b.className = `cod-btn ${cls}`; b.textContent = label; b.type = 'button'; parent.appendChild(b);
  const set = (down, e) => { e?.preventDefault(); input.setTouchButton(code, down); b.classList.toggle('on', down); };
  b.addEventListener('pointerdown', e => { b.setPointerCapture(e.pointerId); set(true, e); });
  b.addEventListener('pointerup', e => set(false, e)); b.addEventListener('pointercancel', e => set(false, e));
  return b;
}

export class MobileControls {
  constructor(parent, ctx, menu) {
    this.ctx = ctx; this.menu = menu;
    this.style = document.createElement('style'); this.style.textContent = css; document.head.appendChild(this.style);
    this.root = document.createElement('div'); this.root.className = 'cod-mobile'; parent.appendChild(this.root);
    this.look = document.createElement('div'); this.look.className = 'cod-look'; this.root.appendChild(this.look);
    this.stick = document.createElement('div'); this.stick.className = 'cod-stick'; this.root.appendChild(this.stick);
    this.knob = document.createElement('div'); this.knob.className = 'cod-knob'; this.stick.appendChild(this.knob);
    const actions = document.createElement('div'); actions.className = 'cod-actions'; this.root.appendChild(actions);
    button(actions, 'cod-jump', 'JUMP', 'Space', ctx.input);
    button(actions, 'cod-ads', 'AIM', 'Mouse2', ctx.input);
    button(actions, 'cod-fire', 'FIRE', 'Mouse0', ctx.input);
    button(this.root, 'cod-reload', 'R', 'KeyR', ctx.input);
    const pause = button(this.root, 'cod-pause', 'Ⅱ', 'Escape', ctx.input); pause.setAttribute('aria-label', 'Pause');
    this._bindStick(); this._bindLook(); this._startScreen();
  }
  _startScreen() {
    this.start = document.createElement('div'); this.start.className = 'cod-start';
    this.start.innerHTML = '<div class="cod-card"><h1>CLAUDE <span>OF DUTY</span></h1><p>A procedural tactical FPS built for the browser. Move with the left thumb, aim on the right, and hold FIRE to engage.</p><button class="cod-deploy">DEPLOY</button></div>';
    this.root.appendChild(this.start);
    this.start.querySelector('button').addEventListener('click', async () => {
      this.start.remove(); this.start = null;
      try { await document.documentElement.requestFullscreen?.(); } catch {}
      try { await screen.orientation?.lock?.('landscape'); } catch {}
    }, { once: true });
  }
  _bindStick() {
    let id = null;
    const move = e => { if (e.pointerId !== id) return; const r=this.stick.getBoundingClientRect(); const dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2); const lim=r.width*.31,len=Math.hypot(dx,dy)||1,k=Math.min(1,lim/len); const x=dx*k,y=dy*k; this.knob.style.transform=`translate(${x}px,${y}px)`; this.ctx.input.setTouchMove(x/lim,y/lim); };
    this.stick.addEventListener('pointerdown', e=>{id=e.pointerId;this.stick.setPointerCapture(id);move(e)});
    this.stick.addEventListener('pointermove', move);
    const end=e=>{if(e.pointerId!==id)return;id=null;this.knob.style.transform='';this.ctx.input.setTouchMove(0,0)};
    this.stick.addEventListener('pointerup',end);this.stick.addEventListener('pointercancel',end);
  }
  _bindLook() {
    let id=null,x=0,y=0;
    this.look.addEventListener('pointerdown',e=>{id=e.pointerId;x=e.clientX;y=e.clientY;this.look.setPointerCapture(id)});
    this.look.addEventListener('pointermove',e=>{if(e.pointerId!==id)return;this.ctx.input.addTouchLook(e.clientX-x,e.clientY-y);x=e.clientX;y=e.clientY});
    const end=e=>{if(e.pointerId===id)id=null};this.look.addEventListener('pointerup',end);this.look.addEventListener('pointercancel',end);
  }
  update(paused) { this.root.classList.toggle('paused', paused); }
  dispose() { this.ctx.input.setTouchMove(0,0); this.root.remove(); this.style.remove(); }
}
