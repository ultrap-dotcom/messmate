/* ---- LOGIN (demo only; replace with real auth) ---- */
function viewLogin(){
  $app.innerHTML=nav('')+`<main class="wrap view"><div class="panel login"><h2>Log in</h2>
  <div class="notice" style="margin-top:12px">Demo mode: this is not real authentication. Pick a role to explore the prototype. A real build needs a backend with accounts and permissions.</div>
  <div class="tabs"><button class="chip on" id="lo">Mess owner</button><button class="chip" id="la">Admin</button></div>
  <form id="lf" class="form" style="grid-template-columns:1fr"><label class="fl"><span>Email</span><input class="fi" id="le" value="ravi@annapurna.example"></label><label class="fl"><span>Password</span><input class="fi" type="password" id="lp" value="demo-only"></label>
  <label class="fl" id="lm"><span>Demo owner account</span><select class="fi" id="lsel">${owners.filter(o=>o.active).map(o=>`<option value="${o.mess}">${o.name} — ${api.get(o.mess).name}</option>`).join('')}</select></label>
  <button class="btn pri block">Continue to demo</button></form></div></main>`+footer();
  let role='owner';
  lo.onclick=()=>{role='owner';lo.classList.add('on');la.classList.remove('on');lm.hidden=false;le.value='ravi@annapurna.example'};
  la.onclick=()=>{role='admin';la.classList.add('on');lo.classList.remove('on');lm.hidden=true;le.value='admin@messmate.example'};
  lf.onsubmit=e=>{e.preventDefault();state.session=role==='admin'?{role:'admin'}:{role:'owner',mess:lsel.value};go(role==='admin'?'admin':'owner')};
}
function dashShell(kind,tabs,cur,inner,setTab){
  const who=kind==='owner'?api.get(state.session.mess).name:'Platform admin';
  $app.innerHTML=nav('')+`<main class="wrap view"><div class="dash"><aside class="side"><div style="padding:8px 14px"><b>${esc(who)}</b><div class="muted small">${kind==='owner'?'Owner dashboard':'Admin panel'} · demo</div></div><hr>
  ${tabs.map(([k,t,i])=>`<a data-t="${k}" class="${cur===k?'on':''}"><span>${i}</span>${t}</a>`).join('')}<hr><a id="out"><span>↩</span>Log out</a></aside><section>${inner}</section></div></main>`;
  document.querySelector('.side').onclick=e=>{const a=e.target.closest('a');if(!a)return;if(a.id==='out'){state.session=null;return go('home')}setTab(a.dataset.t)};
}
/* ---- OWNER ---- */
const OT=[['overview','Overview','▦'],['profile','Mess profile','✎'],['menu','Today\'s menu','🍽'],['weekly','Weekly menu','▤'],['preview','Preview listing','👁']];
function viewOwner(){
  if(state.session?.role!=='owner')return go('login');
  const m=api.get(state.session.mess),t=state.ownerTab,f=fresh(m);
  const rerender=()=>viewOwner();
  let h='';
  if(t==='overview')h=`<h2>Welcome back, ${esc(m.owner.split(' ')[0])}</h2><p class="muted">You can only manage ${esc(m.name)}.</p>
   <div class="stats"><div class="stat"><span class="muted small">Menu status</span><b style="font-size:1.2rem;margin-top:6px">${freshTag(m)}</b></div><div class="stat"><span class="muted small">Items today</span><b>${allItems(m).length}</b></div><div class="stat"><span class="muted small">Listing views (7d)</span><b>412</b></div><div class="stat"><span class="muted small">Dish searches matched</span><b>96</b></div></div>
   <div class="panel"><h3>Views this week (sample)</h3><div class="bars" style="margin-bottom:28px">${[40,52,48,61,70,38,103].map((v,i)=>`<div style="height:${v}%"><span>${DAYS[i]}</span></div>`).join('')}</div></div>
   ${f.stale?`<div class="notice" style="margin-top:16px">Your menu is not updated today. Students will see a warning. Update and publish it now.</div>`:''}
   <div class="row" style="margin-top:16px"><button class="btn pri" onclick="state.ownerTab='menu';viewOwner()">Update today's menu</button><button class="btn" onclick="confirmToday('${m.id}')">Confirm menu is unchanged</button></div>`;
  if(t==='profile')h=`<h2>Mess profile</h2><form class="panel form" id="pf" style="margin-top:16px">
   <label class="fl"><span>Mess name</span><input class="fi" name="name" value="${esc(m.name)}"></label><label class="fl"><span>Area</span><input class="fi" name="area" value="${esc(m.area)}"></label>
   <label class="fl" style="grid-column:1/-1"><span>Address</span><input class="fi" name="addr" value="${esc(m.addr)}"></label><label class="fl"><span>Phone</span><input class="fi" name="phone" value="${esc(m.phone)}"></label>
   <label class="row" style="align-self:end;gap:10px"><input type="checkbox" name="walkin" ${m.walkin?'checked':''}> Accept walk-in customers</label>
   ${MEALS.map(k=>`<label class="fl"><span>${k} price (₹)</span><input class="fi" type="number" min="0" name="p${k}" value="${m.prices[k]}"></label><label class="fl"><span>${k} timing</span><input class="fi" name="t${k}" value="${esc(m.timing[k])}"></label>`).join('')}
   <div style="grid-column:1/-1"><button class="btn pri">Save changes</button></div></form>`;
  if(t==='menu'){const k=MEALS.includes(state.menuTab)?state.menuTab:'Lunch',off=m.unavailable.includes(k);
   h=`<div class="row between"><h2>Today's menu</h2>${freshTag(m)}</div><div class="panel" style="margin-top:16px"><div class="tabs" id="mt">${MEALS.map(x=>`<button class="chip ${x===k?'on':''}" data-v="${x}">${x}</button>`).join('')}</div>
   <div class="row between" style="margin-bottom:10px"><label class="row" style="gap:10px"><button class="switch ${off?'':'on'}" id="avail" aria-label="Meal available"></button><span>${off?'Marked unavailable today':'Available today'}</span></label></div>
   <div id="items">${m.menu[k].map((i,ix)=>`<div class="item"><div class="em">${i.em}</div><input class="fi" style="flex:1" data-ix="${ix}" data-f="name" value="${esc(i.name)}" aria-label="Item name"><select class="fi" style="width:110px" data-ix="${ix}" data-f="veg"><option value="1" ${i.veg?'selected':''}>Veg</option><option value="0" ${i.veg?'':'selected'}>Non-veg</option></select><button class="btn sm danger" data-del="${ix}">Remove</button></div>`).join('')||'<p class="muted" style="padding:16px 0">No items yet. Add the first one below.</p>'}</div>
   <form id="af" class="row" style="margin-top:14px"><input class="fi" id="an" placeholder="Add food item, e.g. Rajma" style="flex:1;min-width:160px" required><select class="fi" id="av" style="width:110px"><option value="1">Veg</option><option value="0">Non-veg</option></select><button class="btn">Add item</button></form></div>
   <div class="row" style="margin-top:16px"><button class="btn pri" id="pub">Publish today's menu</button><button class="btn" onclick="state.ownerTab='preview';viewOwner()">Preview listing</button></div>`}
  if(t==='weekly'){const d=state.weekDay,k=MEALS.includes(state.menuTab)?state.menuTab:'Lunch';weekly[m.id]??={};const wd=(weekly[m.id][d]??={});
   h=`<h2>Weekly menu</h2><p class="muted">Set a recurring menu for each weekday. Apply a day to publish it as today's menu, and edit single days when things change.</p><div class="panel" style="margin-top:16px"><div class="tabs" id="wd">${DAYS.map(x=>`<button class="chip ${x===d?'on':''}" data-v="${x}">${x}</button>`).join('')}</div>
   ${MEALS.map(x=>`<label class="fl" style="margin-bottom:12px"><span>${x} (comma separated)</span><input class="fi" data-meal="${x}" value="${esc((wd[x]??[]).join(', '))}" placeholder="e.g. Poha, Tea"></label>`).join('')}
   <div class="row"><button class="btn pri" id="wsave">Save ${d}</button><button class="btn" id="wcopy">Copy to all weekdays</button><button class="btn" id="wapply">Use as today's menu</button></div></div>`}
  if(t==='preview')h=`<h2>Public listing preview</h2><p class="muted" style="margin-bottom:16px">This is how students see your mess.</p><div style="max-width:380px">${messCard(m)}</div><a class="btn" style="margin-top:16px" href="#mess/${m.id}">Open full details page</a>`;
  dashShell('owner',OT,t,h,x=>{state.ownerTab=x;viewOwner()});
  const $=s=>document.querySelector(s);
  $('#pf')&&($('#pf').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);Object.assign(m,{name:f.get('name'),area:f.get('area'),addr:f.get('addr'),phone:f.get('phone'),walkin:!!f.get('walkin')});MEALS.forEach(k=>{m.prices[k]=+f.get('p'+k)||0;m.timing[k]=f.get('t'+k)||'—'});toast('Profile saved');rerender()});
  if(t==='menu'){const k=MEALS.includes(state.menuTab)?state.menuTab:'Lunch';
   $('#mt').onclick=e=>{const b=e.target.closest('button');if(b){state.menuTab=b.dataset.v;rerender()}};
   $('#avail').onclick=()=>{const u=m.unavailable;u.includes(k)?u.splice(u.indexOf(k),1):u.push(k);rerender()};
   $('#items').onchange=e=>{const ix=e.target.dataset.ix;if(ix==null)return;const it=m.menu[k][ix];e.target.dataset.f==='name'?it.name=e.target.value:it.veg=+e.target.value};
   $('#items').onclick=e=>{const d=e.target.dataset.del;if(d!=null){m.menu[k].splice(d,1);rerender()}};
   $('#af').onsubmit=e=>{e.preventDefault();m.menu[k].push(D($('#an').value.trim(),0,+$('#av').value,k,'🍽️'));rerender()};
   $('#pub').onclick=()=>{m.updated=new Date().toISOString();m.confirmed=true;toast('Menu published. Marked confirmed today.');rerender()}}
  if(t==='weekly'){const d=state.weekDay,wd=weekly[m.id][d];const read=()=>{document.querySelectorAll('[data-meal]').forEach(i=>wd[i.dataset.meal]=i.value.split(',').map(s=>s.trim()).filter(Boolean))};
   $('#wd').onclick=e=>{const b=e.target.closest('button');if(b){state.weekDay=b.dataset.v;rerender()}};
   $('#wsave').onclick=()=>{read();toast(d+' saved')};$('#wcopy').onclick=()=>{read();DAYS.forEach(x=>weekly[m.id][x]=JSON.parse(JSON.stringify(wd)));toast('Copied to every day')};
   $('#wapply').onclick=()=>{read();MEALS.forEach(k=>{if(wd[k]?.length)m.menu[k]=wd[k].map(n=>D(n,0,1,k,'🍽️'))});m.updated=new Date().toISOString();m.confirmed=false;toast('Applied as today\'s menu. Review and publish to confirm.')}}
}
function confirmToday(id){const m=api.get(id);m.updated=new Date().toISOString();m.confirmed=true;toast('Menu confirmed for today');viewOwner()}
