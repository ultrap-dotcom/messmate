/* ============ UI HELPERS & ROUTER ============ */
const $app=document.getElementById('app');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const state={q:'',meal:'All',diet:'All',maxPrice:150,maxDist:5,sort:'distance',walkin:false,session:null,ownerTab:'overview',adminTab:'overview',menuTab:'Lunch',weekDay:'Mon',foodFilter:''};
const bg=i=>`background:linear-gradient(135deg,${HUES[i%6]},color-mix(in srgb,${HUES[i%6]} 60%,#fff))`;
const dark=()=>0;
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.append(e);setTimeout(()=>e.remove(),2200)}
function hl(text,q){if(!q)return esc(text);const i=text.toLowerCase().indexOf(q.toLowerCase());if(i<0)return esc(text);return esc(text.slice(0,i))+'<mark>'+esc(text.slice(i,i+q.length))+'</mark>'+esc(text.slice(i+q.length))}
const vdot=v=>`<span class="dot ${v?'':'nv'}" title="${v?'Vegetarian':'Non-vegetarian'}"></span>`;
const go=h=>{location.hash=h};
function nav(active){
  return `<header class="nav"><div class="wrap"><a class="logo" href="#home"><i>M</i>MessMate</a>
  <nav class="links" id="links">${[['home','Home'],['explore','Explore Messes'],['today','Today\'s Menu'],['about','About']].map(([h,t])=>`<a href="#${h}" class="${active===h?'on':''}">${t}</a>`).join('')}</nav>
  <div class="row"><a class="btn pri sm" href="#login">Login</a><button class="btn sm menu-btn" aria-label="Menu" onclick="document.getElementById('links').classList.toggle('open')">☰</button></div></div></header>`;
}
function footer(){return `<footer class="wrap"><div><a class="logo" href="#home"><i>M</i>MessMate</a><p class="muted" style="margin-top:10px;max-width:30em">Your food. Your choice. Every day. A discovery platform for nearby messes and their daily menus. Not a delivery service.</p></div>
 <div><b>Explore</b><a href="#explore">Explore Messes</a><a href="#today">Today's Menu</a><a href="#about">About</a></div><div><b>For messes</b><a href="#login">Owner login</a><a href="#login">Admin login</a><p class="muted small" style="margin-top:8px">Prototype with sample data.</p></div></footer>`}
function shell(active,inner){return nav(active)+`<main class="wrap view">${inner}</main>`+footer()}

function freshTag(m){const f=fresh(m);return `<span class="tag ${f.k}">${f.k==='good'?'●':'!'} ${f.t}</span>`}
function messCard(m,q=''){
  const items=allItems(m), match=q?items.filter(i=>i.name.toLowerCase().includes(q.toLowerCase())):[];
  const shown=(match.length?match:items).slice(0,4);
  const now=mealNow(m);
  return `<article class="card"><div class="cover" style="${bg(m.hue)}">${m.emoji}<span class="big">${m.emoji}</span><span class="fresh">${freshTag(m)}</span><span class="dist">${m.dist} km</span></div>
  <div class="cbody"><div><h3>${esc(m.name)}</h3><div class="muted small">📍 ${esc(m.area)}</div></div>
  <div class="row">${m.types.includes('veg')?'<span class="tag good">Veg</span>':''}${m.types.includes('nonveg')?'<span class="tag bad">Non-veg</span>':''}<span class="tag ${m.walkin?'acc':''}">${m.walkin?'Walk-ins welcome':'Members only'}</span></div>
  <p class="preview">${shown.map(i=>q&&i.name.toLowerCase().includes(q.toLowerCase())?hl(i.name,q):esc(i.name)).join(' · ')||'No menu published'}</p>
  <div class="row small muted">${now.open?`<span class="tag good">Serving ${now.k} now</span>`:'<span class="tag">Closed right now</span>'}<span>Updated ${ago(m.updated)}</span></div>
  <div class="row between" style="margin-top:auto"><div><span class="price">₹${lunchPrice(m)}</span><span class="muted small"> / lunch</span></div><a class="btn sm pri" href="#mess/${m.id}">View Menu</a></div></div></article>`;
}
function skeletons(n=3){return `<div class="grid">${'<div class="skel"></div>'.repeat(n)}</div>`}

/* ---- HOME ---- */
async function viewHome(){
  $app.innerHTML=shell('home',`
  <section class="hero"><div><span class="tagline">Your food. Your choice. Every day.</span>
   <h1>Good food is <span class="hl">closer</span> than you think.</h1>
   <p class="sub">Discover nearby messes, explore today's menus, and find the food you're craving.</p>
   <form class="search" id="hs"><input id="hq" placeholder="Search dishes, mess names or areas" aria-label="Search"><button class="btn pri">Search</button></form>
   <div class="chips"><a class="btn pri sm" href="#explore">Explore Messes</a>${['Paneer','Biryani','Dosa'].map(f=>`<a class="chip" href="#explore?q=${f}">${f}</a>`).join('')}</div></div>
   <div class="collage"><div class="plate" style="width:62%;height:62%;left:19%;top:14%;${bg(0)}"><span style="font-size:5.5rem">🍛</span></div>
    <div class="plate" style="width:34%;height:34%;left:0;top:2%;${bg(1)};animation-delay:-2s"><span style="font-size:2.8rem">🥞</span></div>
    <div class="plate" style="width:30%;height:30%;right:0;top:0;${bg(3)};animation-delay:-4s"><span style="font-size:2.6rem">🍗</span></div>
    <div class="plate" style="width:32%;height:32%;right:4%;bottom:6%;${bg(2)};animation-delay:-1s"><span style="font-size:2.6rem">🥗</span></div>
    <div class="float-card" style="left:0;bottom:14%"><b>Paneer Butter Masala</b><br><span class="muted">Annapurna Mess · 0.3 km</span></div></div></section>
  <section class="sec"><div class="sec-h"><div><h2>Today's popular foods</h2><p class="muted">Tap a dish to see who is serving it today.</p></div></div>
   <div class="foods">${FOODS.map(([n,e,h])=>`<a class="food" href="#explore?q=${encodeURIComponent(n)}"><div class="pic" style="${bg(h)}">${e}</div><b>${n}</b><span class="muted small">${countServing(n)} messes today</span></a>`).join('')}</div></section>
  <section class="sec"><div class="sec-h"><div><h2>Nearby messes</h2><p class="muted">Closest to you, sorted by distance.</p></div><a class="btn" href="#explore">See all</a></div><div id="near">${skeletons()}</div></section>
  <section class="sec"><div class="sec-h"><div><h2>How MessMate works</h2></div></div><div class="steps">
   ${[['📍','Discover nearby messes','See every mess around your hostel, with distance and price.'],['📋','Explore their daily menus','Menus carry an update time so you know they are current.'],['😋','Choose where you eat','Compare, check walk-in rules and timings, then just walk over.']].map(([e,t,d])=>`<div class="step"><div class="ic">${e}</div><h3>${t}</h3><p class="muted" style="margin-top:6px">${d}</p></div>`).join('')}</div></section>
  <section class="sec"><div class="sec-h"><div><h2>Popular near you</h2></div></div><div class="grid" id="pop"></div></section>
  <section class="sec"><div class="sec-h"><div><h2>Food available today</h2><p class="muted">Every dish on today's menus. Tap one to find it.</p></div></div><div class="chips" style="margin-top:0">${[...new Set(api.all().filter(m=>m.status==='approved').flatMap(allItems).map(i=>i.name))].sort().map(n=>`<a class="chip" href="#explore?q=${encodeURIComponent(n)}">${esc(n)}</a>`).join('')}</div></section>
  <section class="sec"><div class="sec-h"><h2>Why use MessMate?</h2></div><div class="steps">
   ${[['🔍','Search by dish','Craving paneer? See every mess serving it today.'],['₹','Compare prices','Meal prices side by side, no surprises.'],['🚶','Walk-in friendly','Know instantly if outsiders are welcome.'],['🕒','Fresh menus','Old menus are flagged, never shown as current.']].map(([e,t,d])=>`<div class="step"><div class="ic">${e}</div><h3>${t}</h3><p class="muted" style="margin-top:6px">${d}</p></div>`).join('')}</div></section>
  <section class="sec"><div class="cta"><div><h2>Tired of the same menu?</h2><p>Find a mess serving what you actually want, today.</p></div><a class="btn pri" href="#explore">Explore Messes</a></div></section>`);
  document.getElementById('hs').onsubmit=e=>{e.preventDefault();go('explore?q='+encodeURIComponent(hq.value))};
  const list=await api.list();
  document.getElementById('near').innerHTML=`<div class="grid">${[...list].sort((a,b)=>a.dist-b.dist).slice(0,3).map(m=>messCard(m)).join('')}</div>`;
  document.getElementById('pop').innerHTML=list.filter(m=>fresh(m).k==='good').slice(0,3).map(m=>messCard(m)).join('');
}
function countServing(n){return api.all().filter(m=>m.status==='approved'&&allItems(m).some(i=>i.name.toLowerCase().includes(n.toLowerCase().split(' ')[0]))).length}
