/* ---- ADMIN ---- */
const AT=[['overview','Dashboard','▦'],['messes','Registered messes','🏠'],['pending','Approvals','✔'],['owners','Mess owners','👤']];
function viewAdmin(){
  if(state.session?.role!=='admin')return go('login');
  const t=state.adminTab,all=api.all(),pend=all.filter(m=>m.status==='pending'),stale=all.filter(m=>m.status==='approved'&&fresh(m).stale);
  let h='';
  const row=m=>`<tr><td><b>${esc(m.name)}</b><div class="muted small">${esc(m.area)}</div></td><td><span class="tag ${m.status==='approved'?'good':m.status==='pending'?'warn':'bad'}">${m.status}</span></td><td>${freshTag(m)}</td><td>₹${lunchPrice(m)}</td><td><div class="row"><button class="btn sm" data-edit="${m.id}">Edit</button><button class="btn sm danger" data-rm="${m.id}">Remove</button></div></td></tr>`;
  if(t==='overview')h=`<h2>Platform overview</h2><div class="stats"><div class="stat"><span class="muted small">Registered messes</span><b>${all.length}</b></div><div class="stat"><span class="muted small">Awaiting approval</span><b>${pend.length}</b></div><div class="stat"><span class="muted small">Stale menus</span><b>${stale.length}</b></div><div class="stat"><span class="muted small">Owners</span><b>${owners.length}</b></div><div class="stat"><span class="muted small">Searches today (sample)</span><b>1,284</b></div></div>
   <div class="panel"><h3>Menus needing attention</h3><div class="tw"><table><tbody>${stale.map(m=>`<tr><td><b>${esc(m.name)}</b></td><td>${freshTag(m)}</td><td class="muted">${ago(m.updated)}</td></tr>`).join('')||'<tr><td class="muted">All menus are current.</td></tr>'}</tbody></table></div></div>`;
  if(t==='messes')h=`<h2>Registered messes</h2><div class="panel tw" style="margin-top:16px"><table><thead><tr><th>Mess</th><th>Status</th><th>Menu</th><th>Lunch</th><th></th></tr></thead><tbody>${all.map(row).join('')}</tbody></table></div><div id="ed"></div>`;
  if(t==='pending')h=`<h2>Registration requests</h2>${pend.length?pend.map(m=>`<div class="panel" style="margin-top:14px"><div class="row between"><div><h3>${esc(m.name)}</h3><p class="muted small">${esc(m.addr)} · Owner ${esc(m.owner)} · ${esc(m.phone)}</p></div><div class="row"><button class="btn pri sm" data-ap="${m.id}">Approve</button><button class="btn danger sm" data-rj="${m.id}">Reject</button></div></div></div>`).join(''):'<div class="empty" style="margin-top:16px"><div class="e">✅</div><h3>No pending requests</h3><p class="muted">New registrations will appear here.</p></div>'}`;
  if(t==='owners')h=`<h2>Mess owners</h2><div class="panel tw" style="margin-top:16px"><table><thead><tr><th>Owner</th><th>Mess</th><th>Email</th><th>Active</th></tr></thead><tbody>${owners.map(o=>`<tr><td><b>${esc(o.name)}</b></td><td>${esc(api.get(o.mess)?.name||'Removed')}</td><td class="muted">${esc(o.email)}</td><td><button class="switch ${o.active?'on':''}" data-ow="${o.id}" aria-label="Toggle owner"></button></td></tr>`).join('')}</tbody></table></div>`;
  dashShell('admin',AT,t,h,x=>{state.adminTab=x;viewAdmin()});
  const q=s=>document.querySelectorAll(s);
  q('[data-ap]').forEach(b=>b.onclick=()=>{api.get(b.dataset.ap).status='approved';toast('Approved and listed');viewAdmin()});
  q('[data-rj]').forEach(b=>b.onclick=()=>{api.get(b.dataset.rj).status='rejected';toast('Rejected');viewAdmin()});
  q('[data-rm]').forEach(b=>b.onclick=()=>{if(b.dataset.sure){const i=messes.findIndex(m=>m.id===b.dataset.rm);messes.splice(i,1);toast('Listing removed');viewAdmin()}else{b.dataset.sure=1;b.textContent='Confirm remove'}});
  q('[data-ow]').forEach(b=>b.onclick=()=>{const o=owners.find(o=>o.id==b.dataset.ow);o.active=!o.active;viewAdmin()});
  q('[data-edit]').forEach(b=>b.onclick=()=>{const m=api.get(b.dataset.edit);document.getElementById('ed').innerHTML=`<form class="panel form" id="ef" style="margin-top:16px"><h3 style="grid-column:1/-1">Edit ${esc(m.name)}</h3><label class="fl"><span>Name</span><input class="fi" name="name" value="${esc(m.name)}"></label><label class="fl"><span>Area</span><input class="fi" name="area" value="${esc(m.area)}"></label><label class="fl"><span>Address</span><input class="fi" name="addr" value="${esc(m.addr)}"></label><label class="fl"><span>Phone</span><input class="fi" name="phone" value="${esc(m.phone)}"></label><div><button class="btn pri">Save listing</button></div></form>`;
    document.getElementById('ef').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);['name','area','addr','phone'].forEach(k=>m[k]=f.get(k));toast('Listing updated');viewAdmin()};document.getElementById('ef').scrollIntoView({behavior:'smooth'})});
}
/* ---- ROUTER ---- */
function route(){
  const [path,qs]=(location.hash.slice(1)||'home').split('?');document.getElementById('links')?.classList.remove('open');
  const [p,arg]=path.split('/');
  if(qs){const q=new URLSearchParams(qs).get('q');if(q!==null)state.q=q}
  else if(p==='explore'&&false){}
  const v={home:viewHome,explore:viewExplore,today:viewToday,about:viewAbout,login:viewLogin,owner:viewOwner,admin:viewAdmin}[p];
  scrollTo(0,0);
  if(p==='mess')viewMess(arg);else if(v)v();else viewHome();
}
addEventListener('hashchange',route);route();
