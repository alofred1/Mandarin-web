(function(){
  const CFG=window.FIREBASE_CONFIG; let auth=null,db=null,storage=null,current=null,roleCache=null;
  let resolveReady; const ready=new Promise(r=>resolveReady=r); const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const email=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,'').slice(0,30)+'@users.alfredmandarin.firebaseapp.com';
  async function roleOf(u){
    if(!u||!db)return 'student';
    if((u.email||'').toLowerCase()===email('alfredAdmin')) return 'admin';
    if((localStorage.getItem('alfred_current_user')||'').toLowerCase()==='alfredadmin') return 'admin';
    try{
      const [a,t,p]=await Promise.all([db.ref('admins/'+u.uid).once('value'),db.ref('teachers/'+u.uid).once('value'),db.ref('players/'+u.uid).once('value')]);
      if(a.val()===true || (p.val()&&p.val().role==='admin')) return 'admin';
      if(t.exists() || (p.val()&&p.val().role==='teacher')) return 'teacher';
    }catch(e){console.warn('role lookup',e)}
    return 'student';
  }
  async function init(){
    if(!window.firebase){resolveReady(null);return}
    try{if(!firebase.apps.length)firebase.initializeApp(CFG);auth=firebase.auth();db=firebase.database();storage=(window.firebase && typeof firebase.storage==='function')?firebase.storage():null;
      auth.onAuthStateChanged(async u=>{current=u; localStorage.setItem('alfred_uid',u?u.uid:''); roleCache=await roleOf(u); localStorage.setItem('alfred_role',roleCache||'student'); if($('cloud'))$('cloud').textContent=u?'☁️ Online':'☁️ Offline'; resolveReady(u);});
    }catch(e){console.error(e);resolveReady(null)}
  }
  const waitForAuth=()=>ready;
  const currentUser=()=>current;
  const role=()=>roleCache||localStorage.getItem('alfred_role')||'student';
  const isAdmin=()=>role()==='admin'; const isTeacher=()=>role()==='teacher'||role()==='admin';
  async function requireStudent(){const u=await waitForAuth();if(!u){location.replace('index.html');return null}if(isTeacher()){location.replace(isAdmin()?'admin.html':'teacher.html');return null}return u}
  async function requireTeacher(){const u=await waitForAuth();if(!u){location.replace('index.html');return null}if(!isTeacher()){location.replace('student.html');return null}return u}
  async function requireAdmin(){const u=await waitForAuth();if(!u){location.replace('index.html');return null}if(!isAdmin()){location.replace(isTeacher()?'teacher.html':'student.html');return null}return u}
  async function login(n,p){n=n.trim();if(!n||p.length<6)throw Error('Username atau PIN tidak valid.');await waitForAuth();await auth.signInWithEmailAndPassword(email(n),p);await new Promise(r=>setTimeout(r,150));const r=await roleOf(auth.currentUser);localStorage.setItem('alfred_current_user',n);localStorage.setItem('alfred_role',r);location.replace(r==='admin'?'admin.html':r==='teacher'?'teacher.html':'student.html')}
  async function register(n,p){n=n.trim();if(!/^[A-Za-z0-9_. -]{2,30}$/.test(n)||['alfredadmin'].includes(n.toLowerCase()))throw Error('Username tidak valid.');if(p.length<6)throw Error('PIN minimal 6 karakter.');await waitForAuth();const c=await auth.createUserWithEmailAndPassword(email(n),p);await db.ref('players/'+c.user.uid).set({username:n,xp:0,level:1,bestScore:0,totalGames:0,role:'student',createdAt:firebase.database.ServerValue.TIMESTAMP,updatedAt:firebase.database.ServerValue.TIMESTAMP});localStorage.setItem('alfred_current_user',n);localStorage.setItem('alfred_role','student');location.replace('student.html')}
  async function logout(){try{if(auth)await auth.signOut()}catch(e){}localStorage.removeItem('alfred_current_user');localStorage.removeItem('alfred_role');localStorage.removeItem('alfred_uid');location.replace('index.html')}
  async function profile(){const u=await waitForAuth();if(!u)throw Error('Sesi login belum tersedia.');const s=await db.ref('players/'+u.uid).once('value');return s.val()||{username:localStorage.getItem('alfred_current_user')||'Siswa',xp:0,level:1,bestScore:0,totalGames:0}}
  async function addResult(score,game,correct,wrong){const u=await waitForAuth();if(!u)throw Error('Sesi login tidak tersedia.');if(isTeacher()){await db.ref('practiceResults/'+u.uid).push({game,score:+score||0,correct:+correct||0,wrong:+wrong||0,at:firebase.database.ServerValue.TIMESTAMP});return {rewarded:false}}const ref=db.ref('players/'+u.uid);await ref.transaction(p=>{p=p||{username:localStorage.getItem('alfred_current_user')||'Siswa',xp:0,level:1,bestScore:0,totalGames:0,role:'student'};p.xp=(+p.xp||0)+Math.max(0,+score||0);p.level=Math.floor(p.xp/1000)+1;p.bestScore=Math.max(+p.bestScore||0,+score||0);p.totalGames=(+p.totalGames||0)+1;p.updatedAt=firebase.database.ServerValue.TIMESTAMP;return p});return {rewarded:true}}
  async function top100(){await waitForAuth();const s=await db.ref('players').orderByChild('xp').limitToLast(100).once('value');let a=[];s.forEach(c=>{const p=c.val()||{};a.push({uid:c.key,username:p.username||'Siswa',xp:+p.xp||0,level:+p.level||1,totalGames:+p.totalGames||0,bestScore:+p.bestScore||0,role:p.role||'student'})});return a.sort((a,b)=>b.xp-a.xp||b.bestScore-a.bestScore||a.username.localeCompare(b.username))}
  async function listStudents(){const s=await db.ref('players').once('value');let a=[];s.forEach(c=>{const p=c.val()||{};if((p.role||'student')==='student')a.push({uid:c.key,...p})});return a.sort((a,b)=>(a.username||'').localeCompare(b.username||''))}
  async function listTeachers(){const s=await db.ref('teachers').once('value');let a=[];s.forEach(c=>a.push({uid:c.key,...(c.val()||{})}));return a}
  async function createTeacher(n,p){if(!isAdmin())throw Error('Hanya admin.');n=n.trim();if(!n||p.length<6)throw Error('Username dan password wajib diisi.');const appName='teacherProvisioner_'+Date.now();const app=firebase.initializeApp(CFG,appName);try{const au=app.auth();const c=await au.createUserWithEmailAndPassword(email(n),p);await db.ref('teachers/'+c.user.uid).set({username:n,role:'teacher',createdAt:firebase.database.ServerValue.TIMESTAMP});await db.ref('players/'+c.user.uid).set({username:n,role:'teacher',xp:0,level:1,bestScore:0,totalGames:0,createdAt:firebase.database.ServerValue.TIMESTAMP});return c.user.uid}finally{await app.delete()}}
  async function createTask(data){if(!isTeacher())throw Error('Akses guru diperlukan.');const u=await waitForAuth();const ref=db.ref('tasks').push();await ref.set({...data,teacherUid:u.uid,teacherName:localStorage.getItem('alfred_current_user')||'',createdAt:firebase.database.ServerValue.TIMESTAMP,status:'published'});return ref.key}
  async function listTasks(){const s=await db.ref('tasks').orderByChild('createdAt').limitToLast(100).once('value');let a=[];s.forEach(c=>a.push({id:c.key,...(c.val()||{})}));return a.reverse()}
  async function submitTask(taskId,answer){const u=await waitForAuth();const p=await profile();await db.ref('submissions/'+taskId+'/'+u.uid).set({uid:u.uid,username:p.username,answer,submittedAt:firebase.database.ServerValue.TIMESTAMP,status:'submitted'});await db.ref('notifications/'+u.uid).push({type:'task_submitted',text:'Tugas berhasil dikirim.',taskId,at:firebase.database.ServerValue.TIMESTAMP})}
  async function submissions(taskId){if(!isTeacher())throw Error('Akses guru diperlukan.');const s=await db.ref('submissions/'+taskId).once('value');let a=[];s.forEach(c=>a.push({uid:c.key,...(c.val()||{})}));return a}
  async function gradeTask(taskId,uid,score,feedback){if(!isTeacher())throw Error('Akses guru diperlukan.');await db.ref('submissions/'+taskId+'/'+uid).update({score:+score||0,feedback:feedback||'',status:'graded',gradedBy:current.uid,gradedAt:firebase.database.ServerValue.TIMESTAMP});await db.ref('notifications/'+uid).push({type:'graded',text:'Tugasmu sudah dinilai.',taskId,score:+score||0,at:firebase.database.ServerValue.TIMESTAMP})}
  async function sendChat(channel,text,toUid){const u=await waitForAuth();const p=await profile();const path=channel==='private'?'chats/private/'+[u.uid,toUid].sort().join('/'):'chats/'+channel;await db.ref(path).push({uid:u.uid,username:p.username,text:String(text||'').slice(0,1000),role:role(),at:firebase.database.ServerValue.TIMESTAMP})}
  async function findUsers(term){const s=await db.ref('players').once('value');let a=[];s.forEach(c=>{const p=c.val()||{};if((p.username||'').toLowerCase().includes(String(term||'').toLowerCase()))a.push({uid:c.key,username:p.username||'',role:p.role||'student'})});return a.slice(0,20)}
  async function voiceNote(blob){const u=await waitForAuth();if(!u)throw Error('Login diperlukan.');const path='voiceNotes/'+u.uid+'/'+Date.now()+'.webm';const snap=await storage.ref(path).put(blob,{contentType:blob.type||'audio/webm'});const url=await snap.ref.getDownloadURL();const p=await profile();return {url,username:p.username,uid:u.uid,at:Date.now()}}
  async function sendVoiceNote(channel,toUid,note){const n=await voiceNote(note.blob);const u=await waitForAuth();const path=channel==='private'?'chats/private/'+[u.uid,toUid].sort().join('/'):'chats/'+channel;await db.ref(path).push({uid:u.uid,username:n.username,voiceUrl:n.url,role:role(),at:firebase.database.ServerValue.TIMESTAMP})}
  async function broadcast(text){if(!isAdmin())throw Error('Hanya admin.');const s=await db.ref('players').once('value');const jobs=[];s.forEach(c=>jobs.push(db.ref('notifications/'+c.key).push({type:'admin',text:String(text||'').slice(0,500),at:firebase.database.ServerValue.TIMESTAMP})));await Promise.all(jobs)}
  function dbRef(path){return db.ref(path)}
  window.AlfredCore={init,waitForAuth,currentUser,role,isAdmin,isTeacher,requireStudent,requireTeacher,requireAdmin,login,register,logout,profile,addResult,top100,listStudents,listTeachers,createTeacher,createTask,listTasks,submitTask,submissions,gradeTask,sendChat,sendVoiceNote,findUsers,broadcast,dbRef,esc,storage};
  document.addEventListener('DOMContentLoaded',init);
})();
