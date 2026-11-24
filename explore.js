/* ---- EXPLORE ---- */
function filtered(list){
  const q=state.q.trim().toLowerCase();
  let r=list.filter(m=>{
    if(q&&!(m.name.toLowerCase().includes(q)||m.area.toLowerCase().includes(q)||m.addr.toLowerCase().includes(q)||allItems(m).some(i=>i.name.toLowerCase().includes(q))))return false;
    if(state.diet==='Veg'&&m.types.includes('nonveg')&&!allItems(m).some(i=>i.veg))return false;
    if(state.diet==='Non-veg'&&!allItems(m).some(i=>!i.veg))return false;
    if(state.meal!=='All'&&!(m.menu[state.meal].length&&m.prices[state.meal]))return false;
    const p=state.meal==='All'?lunchPrice(m):m.prices[state.meal];
    if(p>state.maxPrice||m.dist>state.maxDist)return false;
    if(state.walkin&&!m.walkin)return false;return true});
  return r.sort((a,b)=>state.sort==='price'?lunchPrice(a)-lunchPrice(b):a.dist-b.dist);
}
async function viewExplore(){
  $app.innerHTML=shell('explore',`<div class="page-h"><h1 style="font-size:clamp(2rem,4.5vw,3rem)">Explore messes</h1><p class="muted">Search by dish, mess name or area. Filters update instantly.</p></div>
  <div class="filters"><div class="frow"><label class="fl" style="flex:2;min-width:220px"><span>Search</span><input class="fi" id="fq" placeholder="Try paneer, dosa, North Gate…" value="${esc(state.q)}"></label>
  <label class="fl" style="flex:1;min-width:140px"><span>Sort by</span><select class="fi" id="fs"><option value="distance">Nearest first</option><option value="price">Lowest price</option></select></label></div>
  <div class="frow"><div class="fl"><span>Meal</span><div class="row" id="fm">${['All',...MEALS].map(x=>`<button class="chip ${state.meal===x?'on':''}" data-v="${x}">${x}</button>`).join('')}</div></div>
  <div class="fl"><span>Diet</span><div class="row" id="fd">${['All','Veg','Non-veg'].map(x=>`<button class="chip ${state.diet===x?'on':''}" data-v="${x}">${x}</button>`).join('')}</div></div></div>
  <div class="frow"><label class="fl" style="flex:1;min-width:180px"><span>Max price <b id="pv">₹${state.maxPrice}</b></span><input type="range" id="fp" min="30" max="150" step="5" value="${state.maxPrice}"></label>
  <label class="fl" style="flex:1;min-width:180px"><span>Within <b id="dv">${state.maxDist} km</b></span><input type="range" id="fdist" min="0.5" max="5" step="0.5" value="${state.maxDist}"></label>
  <label class="row" style="gap:10px"><button type="button" class="switch ${state.walkin?'on':''}" id="fw" aria-label="Walk-ins only"></button><span>Walk-ins accepted only</span></label></div></div>
  <div class="row between" style="margin-bottom:14px"><b id="count"></b><button class="btn sm" id="reset">Reset filters</button></div><div id="res">${skeletons()}</div>`);
  fs.value=state.sort;
  const list=await api.list();
  const draw=()=>{const r=filtered(list);count.textContent=`${r.length} mess${r.length===1?'':'es'} found`+(state.q?` for “${state.q}”`:'');
    res.innerHTML=r.length?`<div class="grid">${r.map(m=>messCard(m,state.q.trim())).join('')}</div>`:`<div class="empty"><div class="e">🍽️</div><h3>No messes match</h3><p class="muted" style="margin:6px 0 16px">Try a different dish, a larger distance or a higher price.</p><button class="btn pri" id="r2">Reset filters</button></div>`;
    document.getElementById('r2')&&(r2.onclick=reset)};
  const reset=()=>{Object.assign(state,{q:'',meal:'All',diet:'All',maxPrice:150,maxDist:5,walkin:false,sort:'distance'});viewExplore()};
  fq.oninput=e=>{state.q=e.target.value;draw()};fs.onchange=e=>{state.sort=e.target.value;draw()};
  fp.oninput=e=>{state.maxPrice=+e.target.value;pv.textContent='₹'+state.maxPrice;draw()};
  fdist.oninput=e=>{state.maxDist=+e.target.value;dv.textContent=state.maxDist+' km';draw()};
  fw.onclick=()=>{state.walkin=!state.walkin;fw.classList.toggle('on');draw()};
  [['fm','meal'],['fd','diet']].forEach(([id,k])=>document.getElementById(id).onclick=e=>{const b=e.target.closest('button');if(!b)return;state[k]=b.dataset.v;[...b.parentNode.children].forEach(c=>c.classList.toggle('on',c===b));draw()});
  reset_=reset;document.getElementById('reset').onclick=reset;draw();
}
let reset_;
/* ---- TODAY'S MENU: dish-first comparison ---- */
async function viewToday(){
  $app.innerHTML=shell('today',`<div class="page-h"><h1 style="font-size:clamp(2rem,4.5vw,3rem)">Today's menu</h1><p class="muted">Every dish served today, with the messes that have it.</p></div>
  <div class="chips" id="tm">${['All',...MEALS].map(x=>`<button class="chip ${state.menuTab==='Lunch'&&x==='Lunch'||state.menuTab===x?'on':''}" data-v="${x}">${x}</button>`).join('')}</div><div id="tl" style="margin-top:20px">${skeletons(2)}</div>`);
  const list=await api.list();
  const draw=()=>{const by={};list.forEach(m=>{(state.menuTab==='All'?MEALS:[state.menuTab]).forEach(k=>{if(m.unavailable.includes(k))return;m.menu[k].forEach(i=>{(by[i.name]??=[]).push({m,i,k})})})});
    const names=Object.keys(by).sort();
    tl.innerHTML=names.length?`<div class="panel">${names.map(n=>`<div class="item"><div class="em">${by[n][0].i.em}</div><div style="flex:1;min-width:0"><b>${vdot(by[n][0].i.veg)} ${esc(n)}</b><div class="small muted">${by[n].map(x=>`<a href="#mess/${x.m.id}" style="text-decoration:underline">${esc(x.m.name)}</a> (${x.k}, ₹${x.m.prices[x.k]||'–'}${fresh(x.m).stale?', not updated today':''})`).join(' · ')}</div></div></div>`).join('')}</div>`:`<div class="empty"><div class="e">🍽️</div><h3>No menus for this meal</h3></div>`};
  document.getElementById('tm').onclick=e=>{const b=e.target.closest('button');if(!b)return;state.menuTab=b.dataset.v;[...tm.children].forEach(c=>c.classList.toggle('on',c===b));draw()};
  draw();
}
function viewAbout(){$app.innerHTML=shell('about',`<div class="page-h"><h1 style="font-size:clamp(2rem,4.5vw,3rem)">About MessMate</h1></div>
 <div class="panel" style="max-width:720px"><p>Many students eat at the same mess every day. When the menu is not to their taste, another mess nearby might be serving exactly what they want, but there is no easy way to find out.</p><p style="margin-top:12px">MessMate puts nearby messes and their daily menus in one place. It is a discovery and comparison platform. It does not deliver food or take orders.</p><p style="margin-top:12px" class="muted">Menu freshness matters most to us. Every listing shows when it was last updated, and menus that are not from today are labelled so.</p><a class="btn pri" style="margin-top:18px" href="#explore">Explore Messes</a></div>`)}

/* ---- DETAILS ---- */
function viewMess(id){
  const m=api.get(id);if(!m||m.status!=='approved'&&!state.session){return $app.innerHTML=shell('explore',`<div class="empty" style="margin-top:30px"><div class="e">🤷</div><h3>Mess not found</h3><a class="btn pri" style="margin-top:14px" href="#explore">Back to Explore</a></div>`)}
  const f=fresh(m),tab=MEALS.includes(state.menuTab)?state.menuTab:'Lunch',now=mealNow(m);
  const body=k=>{const off=m.unavailable.includes(k);return `<div class="row between" style="margin-bottom:6px"><span class="muted small">${m.timing[k]} · ₹${m.prices[k]||'–'} per meal</span>${off?'<span class="tag bad">Not available today</span>':now.k===k?'<span class="tag good">Serving now</span>':''}</div>`+
    (m.menu[k].length&&!off?m.menu[k].map(i=>`<div class="item"><div class="em">${i.em}</div><b style="flex:1">${esc(i.name)}</b>${vdot(i.veg)}</div>`).join(''):`<div class="empty" style="padding:30px"><p class="muted">${off?'This meal is marked unavailable today.':'No items listed for this meal.'}</p></div>`)};
  $app.innerHTML=shell('explore',`<a class="back" href="#explore">← Back to messes</a>
  <div class="dhero" style="${bg(m.hue)}">${m.emoji}<span class="cover" style="position:absolute;inset:0;background:none;height:auto"><span class="big" style="font-size:16rem">${m.emoji}</span></span></div>
  <div class="row between" style="margin-top:20px"><div><h1 style="font-size:clamp(1.9rem,4vw,2.8rem)">${esc(m.name)}</h1><p class="muted">📍 ${esc(m.addr)} · ${m.dist} km away</p></div>${freshTag(m)}</div>
  ${f.stale?`<div class="notice" style="margin-top:14px">This menu was last updated ${ago(m.updated)} and may not be today's. Check with the mess before you go.</div>`:''}
  <div class="dgrid"><div class="panel"><h3 style="margin-bottom:14px">Today's menu</h3><div class="tabs" id="dt">${MEALS.map(k=>`<button class="chip ${k===tab?'on':''}" data-v="${k}">${k}</button>`).join('')}</div><div id="db">${body(tab)}</div>
    <p class="muted small" style="margin-top:14px">Menu updated ${new Date(m.updated).toLocaleString([], {weekday:'short',hour:'numeric',minute:'2-digit'})} (${ago(m.updated)}) · ${m.confirmed?'Confirmed by the mess today':'Not confirmed today'}</p></div>
  <aside><div class="panel"><h3 style="margin-bottom:8px">Details</h3>
   <div class="kv"><span>Walk-ins</span><b>${m.walkin?'Accepted':'Members only'}</b></div>
   <div class="kv"><span>Contact</span><b>${esc(m.phone)}</b></div>
   ${MEALS.map(k=>`<div class="kv"><span>${k}</span><b>${m.timing[k]==='—'?'Not served':m.timing[k]+' · ₹'+m.prices[k]}</b></div>`).join('')}
   <a class="btn pri block" style="margin-top:14px" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(m.name+', '+m.addr)}">Get directions</a></div></aside></div>`);
  dt.onclick=e=>{const b=e.target.closest('button');if(!b)return;state.menuTab=b.dataset.v;[...dt.children].forEach(c=>c.classList.toggle('on',c===b));db.innerHTML=body(b.dataset.v)};
}
