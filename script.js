const header=document.querySelector('.site-header');const menu=document.querySelector('.menu-toggle');const nav=document.querySelector('.main-nav');const backTop=document.querySelector('.back-top');const setHeaderHeight=()=>{document.documentElement.style.setProperty('--header-h',header.offsetHeight+'px')};const closeMenu=()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Menü öffnen');menu.innerHTML='<i class=\'bi bi-list\'></i>';document.body.classList.remove('nav-open')};const updateScroll=()=>{header.classList.toggle('scrolled',window.scrollY>60);backTop.classList.toggle('visible',window.scrollY>400);setHeaderHeight()};menu.addEventListener('click',()=>{const open=!nav.classList.contains('open');nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Menü schließen':'Menü öffnen');menu.innerHTML=open?'<i class=\'bi bi-x-lg\'></i>':'<i class=\'bi bi-list\'></i>';document.body.classList.toggle('nav-open',open)});nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));backTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));window.addEventListener('scroll',updateScroll,{passive:true});window.addEventListener('resize',()=>{setHeaderHeight();if(window.innerWidth>=768)closeMenu()});setHeaderHeight();updateScroll();const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;const revealGroups=document.querySelectorAll('.section2-reveal,.section3-reveal,.section4-reveal,.section5-reveal');revealGroups.forEach(group=>group.querySelectorAll('.reveal-item').forEach((item,index)=>item.style.transitionDelay=index*80+'ms'));if(reduced){document.querySelectorAll('.reveal-item').forEach(item=>item.classList.add('is-visible'))}else{const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.querySelectorAll('.reveal-item').forEach(item=>item.classList.add('is-visible'));observer.unobserve(entry.target)}})},{threshold:.14,rootMargin:'0px 0px -8%'});revealGroups.forEach(group=>observer.observe(group))}

(function(){
  const NAMESPACE = "Fahrschule Nickel";
  const WEBHOOK_URL = "https://barista-confined-headset.ngrok-free.dev/webhook/chat";
  const launcher = document.getElementById('ai-chat-launcher');
  const panel = document.getElementById('ai-chat-panel');
  const closeBtn = document.getElementById('ai-chat-close');
  const messages = document.getElementById('ai-chat-messages');
  const form = document.getElementById('ai-chat-form');
  const input = document.getElementById('ai-chat-input');

  let sessionId = localStorage.getItem('ai_chat_session');
  if(!sessionId){ sessionId='sess_'+Math.random().toString(36).slice(2); localStorage.setItem('ai_chat_session', sessionId); }

  let greeted = false;

  function setOpen(open){
    panel.hidden = !open;
    launcher.classList.toggle('open', open);
    launcher.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
    if(open){
      if(!greeted){
        addBotMessage("Hi! I'm your AI assistant. Ask me anything about our products, services, or how we can help.");
        greeted = true;
      }
      setTimeout(()=>input.focus(), 150);
    }
  }

  function toggle(){ setOpen(panel.hidden); }

  launcher.addEventListener('click', toggle);
  launcher.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggle(); } });
  closeBtn.addEventListener('click', ()=>setOpen(false));

  function addMsg(text, who){
    const el = document.createElement('div');
    el.className = 'ai-chat-msg ' + who;
    if(who === 'bot'){
      const icon = document.createElement('span');
      icon.className = 'ai-chat-bot-icon';
      icon.innerHTML = '<i class="bi bi-stars"></i>';
      const textSpan = document.createElement('span');
      textSpan.textContent = text;
      el.appendChild(icon);
      el.appendChild(textSpan);
    } else {
      el.textContent = text;
    }
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  function addBotMessage(text){ addMsg(text, 'bot'); }

  function showTyping(){
    const el = document.createElement('div');
    el.className = 'ai-chat-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const text = input.value.trim();
    if(!text) return;
    addMsg(text, 'user');
    input.value = '';
    const typing = showTyping();
    try{
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ message: text, namespace: NAMESPACE, sessionId })
      });
      const data = await res.json();
      typing.remove();
      addBotMessage(data.reply || "Sorry, I didn't get a response. Please try again.");
    }catch(err){
      typing.remove();
      addBotMessage("I'm having trouble connecting right now. Please try again in a moment.");
    }
  });
})();
