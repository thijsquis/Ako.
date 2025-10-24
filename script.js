// ======================
// Dark Mode Toggle
// ======================
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
    drawMindmap();
  });
});

// ======================
// Section Navigation
// ======================
function showSection(sectionId){
  const sections = ['home','features','reviews','stats','faq','notes','agenda','mindmaps','pomodoro','quickNotes'];
  sections.forEach(id => document.getElementById(id).classList.add('hidden'));
  document.getElementById(sectionId).classList.remove('hidden');
}

// ======================
// Fade-in Animation
// ======================
const faders = document.querySelectorAll('.fade-in');
const appearOptions = { threshold:0.1 };
const appearOnScroll = new IntersectionObserver((entries, observer)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.style.opacity=1;
      entry.target.style.transform='translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, appearOptions);
faders.forEach(fader=>appearOnScroll.observe(fader));

// ======================
// Accordion FAQ
// ======================
document.querySelectorAll(".accordion-button").forEach(btn=>{
  btn.addEventListener("click",()=>{
    btn.classList.toggle("active");
    const panel = btn.nextElementSibling;
    panel.style.display = panel.style.display === "block" ? "none" : "block";
  });
});

// ======================
// Notes with Tags & Search
// ======================
function saveNote(){
  const title = document.getElementById("noteTitle").value.trim();
  const content = document.getElementById("noteInput").value.trim();
  const tag = document.getElementById("noteTag").value.trim();
  if(title && content){
    let notes = JSON.parse(localStorage.getItem("notes")||"[]");
    notes.push({title,content,tag});
    localStorage.setItem("notes", JSON.stringify(notes));
    document.getElementById("noteTitle").value = "";
    document.getElementById("noteInput").value = "";
    document.getElementById("noteTag").value = "";
    displayNotes();
    updateStats();
  }
}
function displayNotes(){
  const savedNotes = document.getElementById("savedNotes");
  let notes = JSON.parse(localStorage.getItem("notes")||"[]");
  savedNotes.innerHTML = "";
  notes.forEach((n,i)=>{
    let div = document.createElement("div");
    div.classList.add("noteItem");
    div.innerHTML = `<strong>${n.title}</strong> [${n.tag}]<br>${n.content}`;
    savedNotes.appendChild(div);
  });
}
displayNotes();
function filterNotes(){
  const term = document.getElementById("searchNotes").value.toLowerCase();
  const notes = document.querySelectorAll(".noteItem");
  notes.forEach(note=>{
    note.style.display = note.textContent.toLowerCase().includes(term) ? "block" : "none";
  });
}

// ======================
// Agenda with Tasks & Calendar View
// ======================
function addTask(){
  const date = document.getElementById("taskDate").value;
  const task = document.getElementById("taskInput").value.trim();
  if(date && task){
    let tasks = JSON.parse(localStorage.getItem("tasks")||"[]");
    tasks.push({date,task});
    localStorage.setItem("tasks", JSON.stringify(tasks));
    document.getElementById("taskInput").value="";
    displayTasks();
    updateStats();
  }
}
function displayTasks(){
  const taskList = document.getElementById("taskList");
  let tasks = JSON.parse(localStorage.getItem("tasks")||"[]");
  taskList.innerHTML="";
  tasks.sort((a,b)=>new Date(a.date)-new Date(b.date));
  tasks.forEach(t=>{
    let p = document.createElement("p");
    p.textContent = `${t.date}: ${t.task}`;
    taskList.appendChild(p);
  });
  displayCalendar(tasks);
}
displayTasks();
function displayCalendar(tasks){
  const calendar = document.getElementById("calendarView");
  calendar.innerHTML = "<ul>"+tasks.map(t=>`<li>${t.date}: ${t.task}</li>`).join("")+"</ul>";
}

// ======================
// Mindmaps with Templates & Colors
// ======================
const canvas=document.getElementById("mindmapCanvas"); 
const ctx=canvas.getContext("2d");
let nodes=[],edges=[],draggingNode=null,offsetX,offsetY,connectMode=false,firstNode=null;

function toggleConnectMode(){
  connectMode=!connectMode;
  firstNode=null;
  document.getElementById("connectStatus").textContent = connectMode?"Click two nodes to connect.":"";
}
canvas.addEventListener("click", e=>{
  if(draggingNode) return;
  const rect=canvas.getBoundingClientRect(), x=e.clientX-rect.left, y=e.clientY-rect.top;
  const clickedNode=nodes.find(n=>Math.hypot(x-n.x,y-n.y)<20);
  if(connectMode && clickedNode){ 
    if(!firstNode) firstNode=clickedNode;
    else{
      edges.push({from:firstNode.label,to:clickedNode.label});
      firstNode=null; connectMode=false;
      document.getElementById("connectStatus").textContent="";
      drawMindmap();
      updateStats();
    }
    return;
  }
  if(!connectMode && !clickedNode){
    const label=prompt("Enter node label:");
    if(label){ nodes.push({x,y,label,color:document.getElementById("nodeColorPicker").value}); drawMindmap(); updateStats(); }
  }
});
canvas.addEventListener("mousedown", e=>{ const rect=canvas.getBoundingClientRect(); const x=e.clientX-rect.left,y=e.clientY-rect.top; nodes.forEach(n=>{ if(Math.hypot(x-n.x,y-n.y)<20){ draggingNode=n; offsetX=x-n.x; offsetY=y-n.y; } }); });
canvas.addEventListener("mousemove", e=>{ if(draggingNode){ const rect=canvas.getBoundingClientRect(); draggingNode.x=e.clientX-rect.left-offsetX; draggingNode.y=e.clientY-rect.top-offsetY; drawMindmap(); } });
canvas.addEventListener("mouseup", ()=>{ draggingNode=null; });
function drawMindmap(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle=document.body.classList.contains("dark")?"#000":"#fff";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  edges.forEach(edge=>{ const from=nodes.find(n=>n.label===edge.from),to=nodes.find(n=>n.label===edge.to); if(from && to){ ctx.beginPath(); ctx.moveTo(from.x,from.y); ctx.lineTo(to.x,to.y); ctx.strokeStyle="#aaa"; ctx.stroke(); } });
  nodes.forEach(node=>{
    ctx.beginPath();
    ctx.arc(node.x,node.y,20,0,2*Math.PI);
    ctx.fillStyle = node.color || "#4CAF50";
    ctx.shadowColor="rgba(0,0,0,0.3)"; ctx.shadowBlur=6;
    ctx.fill(); ctx.shadowBlur=0;
    ctx.fillStyle="#fff"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.font="bold 14px Inter, sans-serif"; ctx.fillText(node.label,node.x,node.y);
  });
}
function saveMindmap(){ localStorage.setItem("mindmap", JSON.stringify({nodes,edges})); alert("Mindmap saved!"); updateStats(); }
function loadMindmap(){ const data=JSON.parse(localStorage.getItem("mindmap")||"{}"); nodes=data.nodes||[]; edges=data.edges||[]; drawMindmap(); updateStats(); }
function clearMindmap(){ if(confirm("Clear mindmap?")){ nodes=[]; edges=[]; localStorage.removeItem("mindmap"); drawMindmap(); updateStats(); } }
function applyTemplate(){ const val=document.getElementById("templateSelect").value; if(val==="brainstorm"){ nodes=[{x:200,y:200,label:"Idea1",color:"#4CAF50"},{x:400,y:200,label:"Idea2",color:"#4CAF50"}]; edges=[]; } if(val==="project"){ nodes=[{x:200,y:150,label:"Task1"},{x:400,y:150,label:"Task2"},{x:300,y:300,label:"Task3"}]; edges=[]; } if(val==="qa"){ nodes=[{x:250,y:200,label:"Q1"},{x:450,y:200,label:"A1"}]; edges=[]; } drawMindmap(); updateStats(); }

// ======================
// Pomodoro Timer
// ======================
let pomodoroTime=25*60, pomodoroInterval=null;
function updatePomodoroDisplay(){ 
  const min=Math.floor(pomodoroTime/60); 
  const sec=pomodoroTime%60; 
  document.getElementById("pomodoroDisplay").textContent=`${min.toString().padStart(2,"0")}:${sec.toString().padStart(2,"0")}`;
}
function startPomodoro(){ if(!pomodoroInterval) pomodoroInterval=setInterval(()=>{ if(pomodoroTime>0){ pomodoroTime--; updatePomodoroDisplay(); } else{ clearInterval(pomodoroInterval); pomodoroInterval=null; alert("Time's up!"); } },1000); }
function pausePomodoro(){ if(pomodoroInterval){ clearInterval(pomodoroInterval); pomodoroInterval=null; } }
function resetPomodoro(){ pausePomodoro(); pomodoroTime=25*60; updatePomodoroDisplay(); }
updatePomodoroDisplay();

// ======================
// Quick Notes / Sticky Notes
// ======================
function createQuickNote(){
  const container=document.getElementById("quickNotesContainer");
  const note=document.createElement("div");
  note.className="quickNote"; note.contentEditable=true; note.style.position="absolute"; note.style.top="50px"; note.style.left="50px"; note.style.background="#FFFA65"; note.style.padding="10px"; note.style.border="1px solid #ccc"; note.style.borderRadius="8px"; note.style.width="150px"; note.style.cursor="move"; container.appendChild(note);
  note.onmousedown = function(e){
    let shiftX=e.clientX-note.getBoundingClientRect().left;
    let shiftY=e.clientY-note.getBoundingClientRect().top;
    function moveAt(pageX,pageY){ note.style.left=pageX-shiftX+'px'; note.style.top=pageY-shiftY+'px'; }
    function onMouseMove(e){ moveAt(e.pageX,e.pageY); }
    document.addEventListener('mousemove',onMouseMove);
    note.onmouseup=function(){ document.removeEventListener('mousemove',onMouseMove); note.onmouseup=null; };
  };
  note.ondragstart = ()=>false;
}

// ======================
// Update Stats / Achievements
// ======================
function updateStats(){
  document.getElementById("notesCount").textContent = JSON.parse(localStorage.getItem("notes")||"[]").length;
  document.getElementById("tasksCount").textContent = JSON.parse(localStorage.getItem("tasks")||"[]").length;
  document.getElementById("mindmapsCount").textContent = nodes.length;
  // simple achievement: if notes+tasks+mindmaps > 10
  let badges=0;
  if(JSON.parse(localStorage.getItem("notes")||"[]").length>=5) badges++;
  if(JSON.parse(localStorage.getItem("tasks")||"[]").length>=5) badges++;
  if(nodes.length>=3) badges++;
  document.getElementById("badgesCount").textContent = badges;
}
updateStats();

// Redraw mindmap if dark mode toggled
new MutationObserver(drawMindmap).observe(document.body,{attributes:true,attributeFilter:['class']});
