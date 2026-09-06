const scroller=document.querySelector("#invitation");
const cover=document.querySelector("#cover");
const opening=document.querySelector("#opening");
const openingVideo=document.querySelector("#openingVideo");
const details=document.querySelector("#details");
const detailsVideo=document.querySelector("#detailsVideo");
const openButton=document.querySelector("#openInvite");
const music=document.querySelector("#backgroundMusic");
const musicToggle=document.querySelector("#musicToggle");
const countdownTarget=new Date("2026-09-16T17:00:00+03:00").getTime();

let invitationOpened=false;

function updateCountdown(){
  const remaining=Math.max(0,countdownTarget-Date.now());
  const totalSeconds=Math.floor(remaining/1000);
  document.querySelector("#days").textContent=String(Math.floor(totalSeconds/86400)).padStart(2,"0");
  document.querySelector("#hours").textContent=String(Math.floor(totalSeconds%86400/3600)).padStart(2,"0");
  document.querySelector("#minutes").textContent=String(Math.floor(totalSeconds%3600/60)).padStart(2,"0");
  document.querySelector("#seconds").textContent=String(totalSeconds%60).padStart(2,"0");
}
updateCountdown();
setInterval(updateCountdown,1000);

function goTo(section){section.scrollIntoView({behavior:"smooth",block:"start"});}

openButton.addEventListener("click",async()=>{
  if(invitationOpened)return;
  invitationOpened=true;
  openButton.classList.add("hidden");
  cover.classList.add("opened");
  opening.classList.add("playing");
  opening.classList.remove("locked");
  scroller.style.overflowY="hidden";
  music.volume=.7;
  music.currentTime=0;
  music.play().catch(()=>{});
  musicToggle.classList.add("visible");
  openingVideo.currentTime=0;
  goTo(opening);
  try{await openingVideo.play();}
  catch{
    invitationOpened=false;
    openButton.classList.remove("hidden");
    cover.classList.remove("opened");
    opening.classList.remove("playing");
    opening.classList.add("locked");
    scroller.style.overflowY="auto";
    goTo(cover);
  }
});

openingVideo.addEventListener("ended",()=>{
  opening.classList.remove("playing");
  scroller.style.overflowY="auto";
  document.querySelectorAll(".page").forEach(page=>page.classList.remove("locked"));
  goTo(details);
  detailsVideo.currentTime=0;
  detailsVideo.play().catch(()=>{});
});

musicToggle.addEventListener("click",()=>{
  if(music.paused){
    music.play().catch(()=>{});
    musicToggle.classList.remove("muted");
    musicToggle.textContent="♫";
    musicToggle.setAttribute("aria-label","كتم الموسيقى");
    musicToggle.setAttribute("aria-pressed","false");
  }else{
    music.pause();
    musicToggle.classList.add("muted");
    musicToggle.textContent="♪";
    musicToggle.setAttribute("aria-label","تشغيل الموسيقى");
    musicToggle.setAttribute("aria-pressed","true");
  }
});

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.target===details){
      if(entry.isIntersecting&&entry.intersectionRatio>.65)detailsVideo.play().catch(()=>{});
      else detailsVideo.pause();
    }
  });
},{root:scroller,threshold:[0,.65,1]});
observer.observe(details);

window.addEventListener("pageshow",()=>{
  if(!invitationOpened){
    scroller.scrollTop=0;
    openingVideo.pause();
    openingVideo.currentTime=0;
  }
});
