/* LLM client. API credentials and authoritative limits exist only on the backend. */
(()=>{
 const launcher=document.querySelector('#assistant-launcher'),panel=document.querySelector('#resume-assistant'),input=document.querySelector('#assistant-question'),log=document.querySelector('#assistant-log');
 const status=document.querySelector('#assistant-model-status'),retry=document.querySelector('#assistant-retry'),form=document.querySelector('#assistant-form'),submit=form.querySelector('button');
 const config=window.PORTFOLIO_CHAT_CONFIG||{};
 let apiBase='',widget=null,challengeToken='',loading=null,ready=false,busy=false,requestId=0,abort=null;
 try{const url=new URL(config.apiBase);if(url.protocol==='https:' && !url.username && !url.password && !url.search && !url.hash)apiBase=url.href.replace(/\/$/,'');}catch{}
 function controls(){input.disabled=!ready||busy;submit.disabled=!ready||busy||!challengeToken;panel.querySelectorAll('[data-question]').forEach(b=>b.disabled=!ready||busy||!challengeToken);}
 function text(message){log.replaceChildren();const p=document.createElement('p');p.textContent=message;log.append(p);}
 function unavailable(){ready=false;status.textContent='The assistant is not available yet. Explore the résumé and projects below.';retry.hidden=!apiBase;controls();}
 function loadChallenge(){
  if(window.turnstile)return Promise.resolve();
  if(loading)return loading;
  loading=new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;
   script.onload=()=>window.turnstile?resolve():reject(Error('challenge'));script.onerror=()=>reject(Error('challenge'));
   const timeout=setTimeout(()=>reject(Error('timeout')),15000);
   script.addEventListener('load',()=>clearTimeout(timeout));script.addEventListener('error',()=>clearTimeout(timeout));document.head.append(script);
  }).catch(error=>{loading=null;throw error;});return loading;
 }
 async function initialize(){
  if(!apiBase || !config.turnstileSiteKey){unavailable();return;}
  status.textContent='Connecting to the assistant…';retry.hidden=true;
  try{
   const response=await fetch(apiBase+'/status',{credentials:'omit',signal:AbortSignal.timeout(10000)});
   if(!response.ok || !(await response.json()).ready){unavailable();return;}
   await loadChallenge();ready=true;
   status.textContent='Answers use the public résumé. Complete the verification to ask a question.';
   if(widget===null)widget=window.turnstile.render('#assistant-challenge',{sitekey:config.turnstileSiteKey,action:'portfolio-chat',theme:'light',size:'flexible',
    callback:token=>{challengeToken=token;controls();},
    'expired-callback':()=>{challengeToken='';controls();},
    'error-callback':()=>{challengeToken='';status.textContent='Verification unavailable. Please retry.';retry.hidden=false;controls();}
   });else window.turnstile.reset(widget);
   controls();
  }catch{unavailable();}
 }
 function close(){panel.hidden=true;launcher.setAttribute('aria-expanded','false');requestId++;abort?.abort();abort=null;busy=false;log.removeAttribute('aria-busy');log.replaceChildren();input.value='';challengeToken='';if(widget!==null)window.turnstile.reset(widget);controls();launcher.focus();}
 launcher.addEventListener('click',()=>{if(!panel.hidden){close();return;}panel.hidden=false;launcher.setAttribute('aria-expanded','true');if(!ready)initialize();else input.focus();});
 document.querySelector('#assistant-close').addEventListener('click',close);
 retry.addEventListener('click',initialize);
 panel.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
 async function ask(raw){
  const question=raw.trim();if(!question||question.length>500||!ready||busy||!challengeToken)return;
  busy=true;controls();const id=++requestId;abort=new AbortController();
  const timeout=setTimeout(()=>abort?.abort(),30000),token=challengeToken;challengeToken='';
  log.replaceChildren();const q=document.createElement('p');q.className='assistant-user';q.textContent=question;log.append(q);
  const answer=document.createElement('p');answer.textContent='Reading the public résumé…';log.append(answer);log.setAttribute('aria-busy','true');
  try{
   const response=await fetch(apiBase+'/chat',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,challengeToken:token}),signal:abort.signal});
   const data=await response.json();if(id!==requestId||panel.hidden)return;
   if(!response.ok){answer.textContent=data.error||'The assistant is unavailable. Please try again later.';return;}
   if(typeof data.answer!=='string')throw Error('invalid');
   answer.textContent=data.answer;input.value='';
   const seen=new Set();
   for(const source of Array.isArray(data.sources)?data.sources:[]){
    if(!['#about','#work','#research','#writing','#contact','./assets/Pradeep-Muniasamy-Resume.pdf'].includes(source.href)||seen.has(source.href))continue;
    seen.add(source.href);const a=document.createElement('a');a.href=source.href;a.textContent=source.label+' →';a.style.display='block';a.addEventListener('click',()=>{if(source.href==='#about')document.querySelector('.early-career').open=true;close();});log.append(a);
   }
  }catch{if(id===requestId&&!panel.hidden)answer.textContent='The assistant could not respond. Please try again later or open the résumé.';}
  finally{clearTimeout(timeout);if(id===requestId){busy=false;abort=null;log.removeAttribute('aria-busy');if(widget!==null)window.turnstile.reset(widget);controls();}}
 }
 form.addEventListener('submit',event=>{event.preventDefault();ask(input.value);});
 panel.querySelectorAll('[data-question]').forEach(button=>button.addEventListener('click',()=>ask(button.dataset.question)));
 controls();
})();
