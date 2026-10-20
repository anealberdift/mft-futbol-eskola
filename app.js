'use strict';
    const API='https://script.google.com/macros/s/AKfycbwyu5S5y3OejwATu4earJEVct6uwxgHF_-zCF8idhTofCFlA3Mc1-1JY6YCfpavtoG5/exec';
    const cats=[['BEN1','Benjaminak 1U'],['BEN2','Benjaminak 2U'],['ALE','Alebinak']];
    const names={
      BEN1:'BENJAMINAK 1U',BEN2:'BENJAMINAK 2U',ALE:'ALEBINAK'
    };
    const el=id=>document.getElementById(id);
    const node=(tag,text,cls)=>{
      const e=document.createElement(tag);
      if(text!==undefined)e.textContent=String(text);
      if(cls)e.className=cls;
      return e;
    };
    let dataset={
    },page='',category='guztiak',team='guztiak';
    function categoryOf(item){
      const s=String(item['Kategoria ID']||item.Kategoria||'').toLowerCase();
      if(s.includes('ben1')||s.includes('1u')||s.includes('2018'))return 'BEN1';
      if(s.includes('ben2')||s.includes('2u')||s.includes('2017'))return 'BEN2';
      if(s.includes('ale')||s.includes('2015')||s.includes('2016'))return 'ALE';
      return '';
    }
    function field(card,label,value){
      if(value!==undefined&&String(value).trim()){
        card.append(node('p',label+': '+value));
      }
    }
    function filterButton(bar,label,active,fn){
      const b=node('button',label,'filter'+(active?' active':''));
      b.type='button';
      b.addEventListener('click',fn);
      bar.append(b);
    }
    function teamOf(item){
      const t=String(item.Taldea||'').trim().toUpperCase();
      return categoryOf(item)==='BEN2'?'':t;
    }
    function titleOf(item){
      const c=categoryOf(item);
      return 'MUTRIKU FT · '+(names[c]||String(item.Kategoria||item['Kategoria ID']||'KATEGORIA'))+(teamOf(item)?' · '+teamOf(item):'');
    }
    function matches(){
      return Array.isArray(dataset.jardunaldiak)?dataset.jardunaldiak:[];
    }
    function filteredMatches(){
      return matches().filter(m=>(category==='guztiak'||categoryOf(m)===category)&&(team==='guztiak'||teamOf(m)===team));
    }
    function addMap(card,url){
      if(!/^https:\/\//i.test(String(url||'')))return;
      const a=node('a','📍 Kokapena mapan ireki','map-link');
      a.href=url;
      a.target='_blank';
      a.rel='noopener noreferrer';
      card.append(a);
    }
    function busFor(match){
      const id=String(match['Autobus ID']||'').trim();
      return id&&(dataset.autobusak||[]).find(b=>String(b['Autobus ID']||'').trim()===id);
    }
    function matchCard(m){
      const card=node('article',undefined,'entry '+categoryOf(m));
      card.append(node('h3','⚽ '+titleOf(m)));
      const place=String(m['Etxean/Kanpoan']||'');
      if(place){
        const badge=node('span',place,'tag');
        badge.classList.add(place.trim().toLowerCase()==='etxean'?'home-tag':'away-tag');
        card.append(badge);
      }
      field(card,'📋 Jardunaldia',m['Jardunaldi zk.']);
      field(card,'📅 Data',m.Data);
      field(card,'⚽ Aurkaria',m.Aurkaria);
      field(card,'🕒 Ordua',m['Hasiera ordua']);
      field(card,'📍 Zelaia',m.Zelaia);
      if(place.trim().toLowerCase()==='etxean'){
        field(card,'🚪 Aldagela',m.Aldagela||m.Aldagelak);
      }
      field(card,'Egoera',m.Egoera);
      addMap(card,m['Helbidea / mapa esteka']);
      const bus=busFor(m);
      if(bus){
        card.append(node('p','🚌 Autobusa','tag'));
        field(card,'🚌 Irteera',bus['Irteera ordua']);
        field(card,'Irteera lekua',bus['Irteera lekua']);
        field(card,'Helmuga',bus.Helmuga);
        field(card,'Itzulera',bus['Itzulera ordua']);
      }else if(m['Autobus ID'])field(card,'Autobusa',m['Autobus ID']+' (xehetasunak zehazteke)');
      field(card,'Oharrak',m.Oharrak);
      return card;
    }
    function trainingCard(t){
      const card=node('article',undefined,'entry '+categoryOf(t));
      card.append(node('h3','🏃 '+(names[categoryOf(t)]||'Entrenamendua')));
      field(card,'📅 Eguna',t['Asteko eguna']);
      const start=t['Hasiera ordua']||'',end=t['Amaiera ordua']||'';
      field(card,'🕒 Ordutegia',start+(start&&end?' – ':'')+end);
      field(card,'🚪 Aldagela',t.Aldagela||t.Aldagelak);
      field(card,'Oharrak',t.Oharrak);
      return card;
    }
    function render(){
      const titles={
        jardunaldiak:'Jardunaldiak',entrenamenduak:'Entrenamenduak',urteko:'Urteko egutegia'
      };
      el('page-title').textContent=titles[page]||'';
      const bar=el('filter-bar');
      bar.replaceChildren();
      filterButton(bar,'Guztiak',category==='guztiak',()=>{category='guztiak';team='guztiak';render();});
      cats.forEach(([id,label])=>filterButton(bar,label,category===id,()=>{category=id;team='guztiak';render();}));
      if(page==='urteko'){
        const options=category==='BEN1'?['A','B']:category==='BEN2'?[]:category==='ALE'?['A','B','C']:[];
        options.forEach(t=>filterButton(bar,'Talde '+t,team===t,()=>{team=t;render();}));
      }
      const out=el('results');
      out.replaceChildren();
      if(page==='urteko')out.append(node('p','Denboraldi osoko partidak. Taldearen letra Google Sheets-eko Taldea zutabetik hartzen da.','section-note'));
      const list=page==='entrenamenduak'?(Array.isArray(dataset.entrenamenduak)?dataset.entrenamenduak:[]).filter(x=>category==='guztiak'||categoryOf(x)===category):filteredMatches();
      if(!list.length){
        out.append(node('div','Ez dago daturik hautatutako aukerarako. Google Sheets-en fitxak eta ikusgarritasuna egiaztatu.','notice'));
        return;
      }
      list.forEach(item=>out.append(page==='entrenamenduak'?trainingCard(item):matchCard(item)));
    }
    function showPage(p){
      page=p;
      category='guztiak';
      team='guztiak';
      el('home').classList.remove('active');
      el('detail').classList.add('active');
      render();
    }
    function goHome(){
      el('detail').classList.remove('active');
      el('home').classList.add('active');
      page='';
    }
    document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-tab]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',x===b?'true':'false')});document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===b.dataset.tab));}));
    document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page)));
    el('back').addEventListener('click',goHome);
    el('refresh').addEventListener('click',loadData);
    el('login-button').addEventListener('click',()=>{el('login-status').textContent='Barne eremua oraindik ez dago aktibatuta.';});
    function loadData(){
      el('api-status').textContent='Google Sheets-eko datuak kargatzen…';
      return new Promise((resolve,reject)=>{const cb='mftCallback_'+Date.now();const script=document.createElement('script');let done=false;const timer=setTimeout(()=>finish(new Error('Konexioaren denbora agortu da.')),12000);function finish(err,data){if(done)return;done=true;clearTimeout(timer);script.remove();delete window[cb];err?reject(err):resolve(data);}window[cb]=data=>finish(null,data);script.onerror=()=>finish(new Error('Ezin izan da Apps Script irakurri.'));script.src=API+'?callback='+cb+'&t='+Date.now();document.head.append(script);}).then(data=>{if(!data||!Array.isArray(data.jardunaldiak))throw Error('Apps Script-en API formatua ez da egokia.');dataset=data;el('api-status').textContent='✓ Google Sheets-eko datuak kargatuta.';if(page)render();}).catch(err=>{el('api-status').textContent='⚠ '+err.message;if(page)el('results').prepend(node('div',err.message,'notice'));});
    }
    loadData();
