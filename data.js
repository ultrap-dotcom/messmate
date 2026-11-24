/* ============ DATA LAYER (swap `api` for real backend later) ============ */
const NOW = new Date();
const hoursAgo = h => new Date(Date.now() - h*3600e3).toISOString();
const D = (n,p,v,cat,em) => ({name:n,price:p,veg:v,cat,em});
const MEALS = ['Breakfast','Lunch','Snacks','Dinner'];
const HUES = ['#FFD9B8','#FFE7A8','#CDEBC9','#F8C9C0','#D7D9F5','#FFD0DD'];
const messes = [
 {id:'annapurna',name:'Annapurna Mess',area:'North Gate',addr:'12, Hostel Road, near North Gate',dist:0.3,phone:'+91 98765 43210',emoji:'🍛',hue:0,walkin:true,status:'approved',owner:'Ravi Sharma',types:['veg'],
  prices:{Breakfast:35,Lunch:70,Snacks:25,Dinner:70},timing:{Breakfast:'7:30–9:30',Lunch:'12:00–14:30',Snacks:'16:30–18:00',Dinner:'19:30–21:45'},updated:hoursAgo(2),confirmed:true,
  menu:{Breakfast:[D('Poha',0,1,'Breakfast','🍚'),D('Masala Tea',0,1,'Breakfast','☕')],Lunch:[D('Paneer Butter Masala',0,1,'Lunch','🧀'),D('Dal Tadka',0,1,'Lunch','🥣'),D('Jeera Rice',0,1,'Lunch','🍚'),D('Roti',0,1,'Lunch','🫓')],Snacks:[D('Samosa',0,1,'Snacks','🥟')],Dinner:[D('Veg Thali',0,1,'Dinner','🍱'),D('Gulab Jamun',0,1,'Dinner','🍮')]},unavailable:[]},
 {id:'southern',name:'Southern Spice Kitchen',area:'Library Lane',addr:'4, Library Lane, behind Central Library',dist:0.6,phone:'+91 98111 22334',emoji:'🥞',hue:1,walkin:true,status:'approved',owner:'Lakshmi Iyer',types:['veg'],
  prices:{Breakfast:45,Lunch:80,Snacks:30,Dinner:75},timing:{Breakfast:'7:00–10:00',Lunch:'12:00–15:00',Snacks:'16:00–18:30',Dinner:'19:00–21:30'},updated:hoursAgo(1),confirmed:true,
  menu:{Breakfast:[D('Masala Dosa',0,1,'Breakfast','🥞'),D('Idli Sambar',0,1,'Breakfast','🍘'),D('Filter Coffee',0,1,'Breakfast','☕')],Lunch:[D('Veg Thali',0,1,'Lunch','🍱'),D('Sambar Rice',0,1,'Lunch','🍚'),D('Curd Rice',0,1,'Lunch','🥛')],Snacks:[D('Medu Vada',0,1,'Snacks','🍩')],Dinner:[D('Rava Dosa',0,1,'Dinner','🥞'),D('Dal Rice',0,1,'Dinner','🍛')]},unavailable:[]},
 {id:'biryani',name:'Biryani Junction',area:'Market Road',addr:'88, Market Road, opp. Metro Station',dist:1.2,phone:'+91 90000 11122',emoji:'🍗',hue:3,walkin:true,status:'approved',owner:'Imran Khan',types:['veg','nonveg'],
  prices:{Breakfast:0,Lunch:110,Snacks:40,Dinner:120},timing:{Breakfast:'—',Lunch:'12:00–15:30',Snacks:'17:00–19:00',Dinner:'19:30–23:00'},updated:hoursAgo(26),confirmed:false,
  menu:{Breakfast:[],Lunch:[D('Chicken Biryani',0,0,'Lunch','🍗'),D('Veg Biryani',0,1,'Lunch','🍛'),D('Raita',0,1,'Lunch','🥛')],Snacks:[D('Chicken Roll',0,0,'Snacks','🌯')],Dinner:[D('Chicken Curry',0,0,'Dinner','🍲'),D('Butter Naan',0,1,'Dinner','🫓'),D('Paneer Tikka',0,1,'Dinner','🧀')]},unavailable:[]},
 {id:'hostel-b',name:'Hostel B Mess',area:'Campus Inner',addr:'Hostel B Block, Main Campus',dist:0.2,phone:'+91 98000 55667',emoji:'🍲',hue:2,walkin:false,status:'approved',owner:'Suresh Patil',types:['veg','nonveg'],
  prices:{Breakfast:30,Lunch:60,Snacks:20,Dinner:60},timing:{Breakfast:'7:30–9:00',Lunch:'12:30–14:00',Snacks:'17:00–18:00',Dinner:'19:30–21:00'},updated:hoursAgo(5),confirmed:true,
  menu:{Breakfast:[D('Aloo Paratha',0,1,'Breakfast','🫓'),D('Curd',0,1,'Breakfast','🥛')],Lunch:[D('Rajma Chawal',0,1,'Lunch','🍛'),D('Chicken Curry',0,0,'Lunch','🍲')],Snacks:[D('Bread Pakora',0,1,'Snacks','🍞')],Dinner:[D('Dal Rice',0,1,'Dinner','🍛'),D('Mixed Veg',0,1,'Dinner','🥗'),D('Egg Curry',0,0,'Dinner','🥚')]},unavailable:[]},
 {id:'shree',name:'Shree Gujarati Thali',area:'Temple Street',addr:'21, Temple Street, Sector 4',dist:1.8,phone:'+91 97777 88990',emoji:'🍱',hue:4,walkin:true,status:'approved',owner:'Kavita Shah',types:['veg'],
  prices:{Breakfast:40,Lunch:95,Snacks:0,Dinner:95},timing:{Breakfast:'8:00–10:00',Lunch:'12:00–15:00',Snacks:'—',Dinner:'19:00–22:00'},updated:hoursAgo(30),confirmed:false,
  menu:{Breakfast:[D('Thepla',0,1,'Breakfast','🫓'),D('Dhokla',0,1,'Breakfast','🟨')],Lunch:[D('Unlimited Gujarati Thali',0,1,'Lunch','🍱'),D('Kadhi',0,1,'Lunch','🥣')],Snacks:[],Dinner:[D('Khichdi Kadhi',0,1,'Dinner','🍛'),D('Paneer Bhurji',0,1,'Dinner','🧀')]},unavailable:[]},
 {id:'tandoor',name:'Tandoor Tales',area:'Station Road',addr:'7, Station Road, near Bus Stand',dist:2.4,phone:'+91 96666 33221',emoji:'🍢',hue:5,walkin:true,status:'pending',owner:'Gurpreet Singh',types:['veg','nonveg'],
  prices:{Breakfast:0,Lunch:100,Snacks:50,Dinner:130},timing:{Breakfast:'—',Lunch:'12:00–15:00',Snacks:'17:00–19:00',Dinner:'19:00–23:00'},updated:hoursAgo(80),confirmed:false,
  menu:{Breakfast:[],Lunch:[D('Paneer Tikka Masala',0,1,'Lunch','🧀'),D('Chicken Curry',0,0,'Lunch','🍲')],Snacks:[],Dinner:[D('Tandoori Chicken',0,0,'Dinner','🍗')]},unavailable:[]}
];
const FOODS = [['Paneer','🧀',0],['Biryani','🍛',1],['Veg Thali','🍱',2],['Dosa','🥞',1],['Chicken Curry','🍲',3],['Dal Rice','🍛',4]];
const owners = [{id:1,name:'Ravi Sharma',mess:'annapurna',email:'ravi@annapurna.example',active:true},{id:2,name:'Lakshmi Iyer',mess:'southern',email:'lakshmi@southern.example',active:true},{id:3,name:'Imran Khan',mess:'biryani',email:'imran@biryani.example',active:true},{id:4,name:'Gurpreet Singh',mess:'tandoor',email:'gurpreet@tandoor.example',active:true}];
const weekly = {}; // id -> {Mon:{Lunch:[...names]}}
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
/* api: all async so a real backend can replace it */
const api = {
  list: ()=>new Promise(r=>setTimeout(()=>r(messes.filter(m=>m.status==='approved')),350)),
  all: ()=>messes, get:id=>messes.find(m=>m.id===id),
};
/* freshness: today's menu must never look current when it is not */
function fresh(m){
  const h=(Date.now()-new Date(m.updated))/3600e3, sameDay=new Date(m.updated).toDateString()===NOW.toDateString()&&h<24;
  if(sameDay&&m.confirmed) return {k:'good',t:'Confirmed today',stale:false};
  if(sameDay) return {k:'good',t:'Updated today',stale:false};
  if(h<48) return {k:'warn',t:'Last updated yesterday',stale:true};
  return {k:'bad',t:'Menu not updated today',stale:true};
}
function ago(iso){const h=Math.round((Date.now()-new Date(iso))/3600e3);return h<1?'just now':h<24?h+'h ago':Math.round(h/24)+'d ago'}
function allItems(m){return MEALS.flatMap(k=>m.menu[k])}
function minPrice(m){const p=MEALS.map(k=>m.prices[k]).filter(Boolean);return Math.min(...p)}
function lunchPrice(m){return m.prices.Lunch||minPrice(m)}
/* meal availability right now (from timings) */
function mealNow(m){
  const t=NOW.getHours()+NOW.getMinutes()/60;
  for(const k of MEALS){const s=m.timing[k];if(!s||s==='—'||!m.menu[k].length||m.unavailable.includes(k))continue;
    const [a,b]=s.split('–').map(x=>{const[h,mi]=x.split(':');return +h+ +mi/60});if(t>=a&&t<=b)return {k,open:true}}
  return {open:false};
}
