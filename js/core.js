(function(){
  const CFG=window.FIREBASE_CONFIG; let auth=null,db=null,current=null;
  let resolveReady; const ready=new Promise(r=>resolveReady=r);
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const email=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,'').slice(0,30)+'@users.alfredmandarin.firebaseapp.com';
  const role=()=>localStorage.getItem('alfred_role')||'student';
  const isTeacher=()=>role()==='teacher' && (localStorage.getItem('alfred_current_user')||'').toLowerCase()==='alfred.admin';
  function init(){
    if(!window.firebase){resolveReady(null);return;}
    try{if(!firebase.apps.length)firebase.initializeApp(CFG);auth=firebase.auth();db=firebase.database();
      auth.onAuthStateChanged(u=>{current=u;localStorage.setItem('alfred_uid',u?u.uid:'');if($('cloud'))$('cloud').textContent=u?'☁️ Online':'☁️ Offline';resolveReady(u);});
    }catch(e){console.error(e);resolveReady(null)}
  }
  async function waitForAuth(){return ready;}
  async function requireStudent(){const u=await waitForAuth();if(!u){location.replace('index.html');return null}if(isTeacher()){location.replace('teacher.html');return null}return u}
  async function requireTeacher(){const u=await waitForAuth();if(!u||!isTeacher()){location.replace(u?'student.html':'index.html');return null}return u}
  async function login(n,p){n=n.trim();if(!n||p.length<6)throw Error('Username atau PIN tidak valid.');await waitForAuth();await auth.signInWithEmailAndPassword(email(n),p);localStorage.setItem('alfred_current_user',n);localStorage.setItem('alfred_role',n.toLowerCase()==='alfred.admin'?'teacher':'student');location.replace(n.toLowerCase()==='alfred.admin'?'teacher.html':'student.html')}
  async function register(n,p){n=n.trim();if(!/^[A-Za-z0-9_. -]{2,30}$/.test(n)||n.toLowerCase()==='alfred.admin')throw Error('Username tidak valid.');if(p.length<6)throw Error('PIN minimal 6 karakter.');await waitForAuth();const c=await auth.createUserWithEmailAndPassword(email(n),p);await db.ref('players/'+c.user.uid).set({username:n,xp:0,level:1,bestScore:0,totalGames:0,createdAt:firebase.database.ServerValue.TIMESTAMP,updatedAt:firebase.database.ServerValue.TIMESTAMP});localStorage.setItem('alfred_current_user',n);localStorage.setItem('alfred_role','student');location.replace('student.html')}
  async function logout(){try{if(auth)await auth.signOut()}catch(e){}localStorage.removeItem('alfred_current_user');localStorage.removeItem('alfred_role');localStorage.removeItem('alfred_uid');location.replace('index.html')}
  async function profile(){const u=await waitForAuth();if(!u)throw Error('Sesi login belum tersedia.');const s=await db.ref('players/'+u.uid).once('value');return s.val()||{username:localStorage.getItem('alfred_current_user')||'Siswa',xp:0,level:1,bestScore:0,totalGames:0}}
  async function addResult(score,game,correct,wrong){const u=await waitForAuth();if(!u)throw Error('Sesi login tidak tersedia.');const ref=db.ref('players/'+u.uid);await ref.transaction(p=>{p=p||{username:localStorage.getItem('alfred_current_user')||'Siswa',xp:0,level:1,bestScore:0,totalGames:0};p.xp=(+p.xp||0)+Math.max(0,+score||0);p.level=Math.floor(p.xp/1000)+1;p.bestScore=Math.max(+p.bestScore||0,+score||0);p.totalGames=(+p.totalGames||0)+1;p.updatedAt=firebase.database.ServerValue.TIMESTAMP;return p})}
  async function top100(){await waitForAuth();const s=await db.ref('players').orderByChild('xp').limitToLast(100).once('value');let a=[];s.forEach(c=>{const p=c.val()||{};a.push({uid:c.key,username:p.username||'Siswa',xp:+p.xp||0,level:+p.level||1,totalGames:+p.totalGames||0,bestScore:+p.bestScore||0})});return a.sort((a,b)=>b.xp-a.xp||b.bestScore-a.bestScore||a.username.localeCompare(b.username))}
  window.AlfredCore={init,waitForAuth,requireStudent,requireTeacher,login,register,logout,profile,addResult,top100,isTeacher,esc};
  document.addEventListener('DOMContentLoaded',init);
})();
