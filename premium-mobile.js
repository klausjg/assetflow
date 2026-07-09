const STORAGE_KEY='af-app-url';
let deferredInstallPrompt=null;

(function checkUrlParam(){
  try{
    const params=new URLSearchParams(window.location.search);
    const appParam=params.get('app');
    if(appParam&&isValidGasUrl(appParam)){
      localStorage.setItem(STORAGE_KEY,appParam);
      history.replaceState(null,'',window.location.pathname);
    }
  }catch(e){}
})();

function isValidGasUrl(url){
  if(!url||typeof url!=='string') return false;
  return /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec/.test(url.trim());
}

function getStoredUrl(){
  try{return localStorage.getItem(STORAGE_KEY);}catch(e){return null;}
}

function detectDevice(){
  const ua=navigator.userAgent||'';
  const isIOS=/iPad|iPhone|iPod/.test(ua)&&!window.MSStream;
  const isAndroid=/Android/.test(ua);
  return {isIOS,isAndroid,isDesktop:!isIOS&&!isAndroid};
}

function closeGuide(){
  const overlay=document.getElementById('guide-overlay');
  if(overlay) overlay.classList.remove('active');
}

function setScreen(id){
  ['setup-ui','install-ui','loading-ui'].forEach(screenId=>{
    const el=document.getElementById(screenId);
    if(el) el.classList.toggle('active',screenId===id);
  });
  closeGuide();
}

function saveUrl(){
  const input=document.getElementById('gas-url-input');
  const errorEl=document.getElementById('url-error');
  const url=(input&&input.value||'').trim();
  if(!url){errorEl.textContent='웹앱 URL을 입력하세요.';return;}
  if(!isValidGasUrl(url)){
    errorEl.textContent='https://script.google.com/macros/s/.../exec 형식의 URL만 연결할 수 있습니다.';
    return;
  }
  try{
    localStorage.setItem(STORAGE_KEY,url);
    errorEl.textContent='';
    init();
  }catch(e){errorEl.textContent='저장에 실패했습니다. 브라우저 저장소 설정을 확인하세요.';}
}

function resetUrl(){
  if(!confirm('등록된 웹앱 URL을 초기화하시겠어요?')) return;
  try{localStorage.removeItem(STORAGE_KEY);init();}catch(e){}
}

async function triggerInstall(){
  if(deferredInstallPrompt){
    try{
      deferredInstallPrompt.prompt();
      const choice=await deferredInstallPrompt.userChoice;
      deferredInstallPrompt=null;
      updateInstallButton();
      if(choice.outcome!=='accepted') showGuide();
    }catch(e){console.warn('Install prompt failed:',e);showGuide();}
    return;
  }
  showGuide();
}

function showGuide(){
  const device=detectDevice();
  const iosGuide=document.getElementById('guide-ios');
  const androidGuide=document.getElementById('guide-android');
  const arrow=document.getElementById('guide-arrow-ios');
  if(device.isIOS){
    iosGuide.style.display='grid';
    androidGuide.style.display='none';
    arrow.style.display='block';
  }else{
    iosGuide.style.display='none';
    androidGuide.style.display='grid';
    arrow.style.display='none';
  }
  document.getElementById('guide-overlay').classList.add('active');
}

function updateInstallButton(){
  const btn=document.getElementById('install-btn');
  const badge=document.getElementById('device-badge');
  if(!btn) return;
  const device=detectDevice();
  if(deferredInstallPrompt){
    btn.textContent='홈 화면에 설치하기';
    if(badge) badge.textContent='ONE-TAP INSTALL';
  }else if(device.isIOS){
    btn.textContent='설치 가이드 보기';
    if(badge) badge.textContent='iOS SAFARI';
  }else if(device.isAndroid){
    btn.textContent='설치 가이드 보기';
    if(badge) badge.textContent='ANDROID';
  }else{
    btn.textContent='설치 가이드 보기';
    if(badge) badge.textContent='DESKTOP PREVIEW';
  }
}

function init(){
  const APP_URL=getStoredUrl();
  if(!APP_URL){
    setScreen('setup-ui');
    const input=document.getElementById('gas-url-input');
    if(input) input.value='';
    return;
  }
  const isStandalone=window.navigator.standalone===true||window.matchMedia('(display-mode: standalone)').matches;
  const device=detectDevice();
  if(device.isDesktop&&!isStandalone){
    setScreen('loading-ui');
    setTimeout(()=>{window.location.href=APP_URL;},360);
    return;
  }
  if(isStandalone){
    setScreen('loading-ui');
    setTimeout(()=>{window.location.href=APP_URL;},420);
    return;
  }
  setScreen('install-ui');
  updateInstallButton();
}

window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();
  deferredInstallPrompt=event;
  updateInstallButton();
});

window.addEventListener('appinstalled',()=>{
  deferredInstallPrompt=null;
  updateInstallButton();
  closeGuide();
});

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('SW registration failed:',err));
  });
}

document.addEventListener('DOMContentLoaded',()=>{
  const input=document.getElementById('gas-url-input');
  if(input){
    input.addEventListener('keydown',event=>{
      if(event.key==='Enter'){
        event.preventDefault();
        saveUrl();
      }
    });
  }
  init();
});
