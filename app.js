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
      const raw = String(item.Taldea ?? item['Taldea '] ?? '').trim().toUpperCase();
      if (categoryOf(item) === 'BEN2') return '';
      const normalized = raw.normalize('NFKC').replace(/[ ​]/g, ' ').trim();
      const found = normalized.match(/(?:^|\s)([ABC])(?:\s|$)/);
      return found ? found[1] : normalized;
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
    // Urteko egutegia: kategoria bakoitzeko talde guztiak zutabeetan.
    const calendarTeams = {
      BEN1: ['A', 'B'],
      BEN2: [''],
      ALE: ['A', 'B', 'C']
    };

    function roundOf(match) {
      return String(match['Jardunaldi zk.'] ?? '').trim();
    }

    function roundSort(a, b) {
      const na = Number(a);
      const nb = Number(b);
      if (a && b && Number.isFinite(na) && Number.isFinite(nb)) {
        return na - nb;
      }
      return a.localeCompare(b, 'eu', { numeric: true });
    }

    function calendarCell(match) {
      const box = node('div', undefined, 'calendar-match');
      if (!match) {
        box.append(node('span', '—', 'calendar-empty'));
        return box;
      }

      const date = String(match.Data ?? '').trim();
      const opponent = String(match.Aurkaria ?? '').trim();
      const place = String(match['Etxean/Kanpoan'] ?? '').trim();

      box.append(node('div', '📅 ' + (date || 'Zehazteke'), 'calendar-date'));
      box.append(node('div', '⚽ ' + (opponent || 'Zehazteke'), 'calendar-opponent'));
      if (place) {
        const badge = node('span', place, 'calendar-place');
        badge.classList.add(place.toLowerCase() === 'etxean' ? 'home-tag' : 'away-tag');
        box.append(badge);
      }
      return box;
    }

    function calendarTable(cat) {
      const section = node('section', undefined, 'calendar-section ' + cat);
      section.append(node('h3', names[cat], 'calendar-heading'));

      const relevant = matches().filter(m => categoryOf(m) === cat);
      if (!relevant.length) {
        section.append(node('p', 'Ez dago jardunaldirik kategoria honetan.', 'section-note'));
        return section;
      }

      const teams = calendarTeams[cat];
      const rounds = [...new Set(relevant.map(roundOf))].sort(roundSort);
      const scroll = node('div', undefined, 'calendar-scroll');
      scroll.setAttribute('tabindex', '0');
      scroll.setAttribute('aria-label', names[cat] + ' egutegia, horizontalki mugitzeko aukera');
      const table = node('table', undefined, 'calendar-table');
      const thead = node('thead');
      const header = node('tr');
      header.append(node('th', 'Jard.', 'calendar-round-head'));
      teams.forEach(t => header.append(node('th', t ? t + ' taldea' : 'Talde bakarra')));
      thead.append(header);
      table.append(thead);

      const tbody = node('tbody');
      rounds.forEach(round => {
        const row = node('tr');
        row.append(node('th', round ? round + '. jard.' : 'Jard. zehazteke', 'calendar-round'));
        teams.forEach(t => {
          const td = node('td');
          const roundGames = relevant.filter(m => roundOf(m) === round);
          let games = roundGames.filter(m => teamOf(m) === t);
          // Taldea eremua APIan hutsik badator, dokumentuko
          // A/B/C hurrenkera erabiltzen da soilik talde guztiak
          // identifikatu gabe daudenean eta kopurua bat datorrenean.
          const noTeamLabels = roundGames.every(m => !teamOf(m));
          if (!games.length && noTeamLabels && roundGames.length === teams.length) {
            games = [roundGames[teams.indexOf(t)]];
          }
          if (!games.length) {
            td.append(calendarCell(null));
          } else {
            games.forEach(m => td.append(calendarCell(m)));
          }
          row.append(td);
        });
        tbody.append(row);
      });
      table.append(tbody);
      scroll.append(table);
      section.append(scroll);
      return section;
    }

    // Jardunaldiak: kategoria bakoitzaren hurrengo jardunaldia soilik.
    function matchDate(value) {
      if (value === undefined || value === null || value === '') return null;
      const s = String(value).trim();
      let year, month, day;
      let found = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (found) {
        [, year, month, day] = found.map(Number);
      } else {
        found = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
        if (!found) return null;
        [, day, month, year] = found.map(Number);
      }
      const date = new Date(year, month - 1, day);
      if (date.getFullYear() !== year ||
          date.getMonth() !== month - 1 ||
          date.getDate() !== day) return null;
      return date;
    }

    function nextMatches() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = category === 'guztiak'
        ? cats.map(([id]) => id)
        : [category];
      const result = [];

      selected.forEach(cat => {
        const upcoming = matches()
          .filter(m => categoryOf(m) === cat)
          .map(m => ({ match: m, date: matchDate(m.Data) }))
          .filter(x => x.date && x.date >= today)
          .sort((a, b) => a.date - b.date);
        if (!upcoming.length) return;

        // Jardunaldi bereko talde guztiak batera agertuko dira.
        const first = upcoming[0];
        const round = roundOf(first.match);
        const sameRound = upcoming.filter(x => round
          ? roundOf(x.match) === round
          : x.date.getTime() === first.date.getTime());
        sameRound.forEach(x => result.push(x.match));
      });
      return result;
    }


    // Guraso arduradunak: izen publikoak soilik, kategoriaka.
    function parentCards() {
      const wrap = node('div', undefined, 'parents-grid');
      const people = Array.isArray(dataset.gurasoArduradunak) ? dataset.gurasoArduradunak : [];
      const selected = category === 'guztiak' ? cats : cats.filter(([id]) => id === category);
      selected.forEach(([id, label]) => {
        const card = node('article', undefined, 'entry ' + id + ' parent-card');
        card.append(node('h3', '👥 ' + label));
        const list = people.filter(person => categoryOf(person) === id && String(person.Izena || '').trim());
        if (list.length) {
          const ul = node('ul', undefined, 'parent-names');
          list.forEach(person => ul.append(node('li', person.Izena)));
          card.append(ul);
        } else {
          card.append(node('p', 'Ez dago guraso arduradunik argitaratuta.'));
        }
        wrap.append(card);
      });
      return wrap;
    }

    function protocolContent() {
      const section = node('section', undefined, 'protocol-content');
      section.append(node('p', 'Haur eta gazteen iruzkin oldarkorren aurrean, errespetuzko espazio seguruak sustatzeko protokoloa.', 'section-note'));
      const steps = [
        ['1. Erasoa identifikatzea', 'Egoera arretaz entzun eta jarrera homofoboak, arrazistak, matxistak edo bestelako errespetu faltak identifikatu.'],
        ['2. Interbentzioa', 'Jarrera onartezina dela argi adierazi eta erasoa jasan duen pertsonari laguntza eskaini.'],
        ['3. Gertaera dokumentatzea eta informatzea', 'Gertaeraren xehetasunak parte-orrian jaso eta familiari bidali.'],
        ['4. Ondorioak', 'Bi parte: bi asteko kanporatzea. Hirugarren partea: hilabeteko kanporatzea. Laugarren partea: Eskola Kiroletik eta Kirol Eskoletatik kanporatzea.'],
        ['5. Erreparazioa', 'Kasuaren arabera, eragindako kalte materialen erantzukizuna eta aitortza nahiz barkamen eskaera publikoa.'],
        ['6. Jarraipena', 'Erasoa jasan duen pertsonaren egoeraren eta hartutako neurrien jarraipena egitea.'],
        ['7. Berrazterketa', 'Protokoloa aldizka berrikusi eta eguneratzea.'],
        ['8. Bide legala', 'Egoeraren arabera, kaltetuek bide legala erabiltzeko aukera dute.'],
        ['9. Onarpena', 'Protokoloa 2024ko azaroaren 12an onartu zen Udaleko Kirol Batzordean eta Kirol Lan Mahaian.']
      ];
      steps.forEach(([heading, description]) => {
        const card = node('article', undefined, 'protocol-step');
        card.append(node('h3', heading));
        card.append(node('p', description));
        section.append(card);
      });
      const a = node('a', '📄 Jatorrizko protokolo osoa eta parte-orria ireki (PDF)', 'protocol-pdf-link');
      a.href = 'jarrera-protokoloa.pdf';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      section.append(a);
      return section;
    }

    function render() {
      const titles = {
        jardunaldiak: 'Jardunaldiak',
        entrenamenduak: 'Entrenamenduak',
        urteko: 'Urteko egutegia',
        gurasoak: 'Guraso arduradunak',
        protokoloa: 'Jarrera protokoloa'
      };
      el('page-title').textContent = titles[page] || '';
      const bar = el('filter-bar');
      bar.replaceChildren();
      el('refresh').hidden = page === 'protokoloa';
      if (page === 'protokoloa') {
        const out = el('results');
        out.replaceChildren();
        out.append(protocolContent());
        return;
      }
      filterButton(bar, 'Guztiak', category === 'guztiak', () => {
        category = 'guztiak';
        team = 'guztiak';
        render();
      });
      cats.forEach(([id, label]) => {
        filterButton(bar, label, category === id, () => {
          category = id;
          team = 'guztiak';
          render();
        });
      });

      const out = el('results');
      out.replaceChildren();

             if (page === 'gurasoak') {
         out.append(parentCards());
         return;
       }

if (page === 'urteko') {
        out.append(node('p', 'Jardunaldiak errenkadetan eta taldeak zutabeetan. Mugikorrean, mugitu taula alboetara behar izanez gero.', 'section-note'));
        const selected = category === 'guztiak' ? cats.map(c => c[0]) : [category];
        selected.forEach(cat => out.append(calendarTable(cat)));
        return;
      }

      const list = page === 'entrenamenduak'
        ? (Array.isArray(dataset.entrenamenduak) ? dataset.entrenamenduak : [])
            .filter(x => category === 'guztiak' || categoryOf(x) === category)
        : nextMatches();
      if (!list.length) {
        out.append(node('div', page === 'jardunaldiak' ? 'Ez dago hurrengo jardunaldirik hautatutako kategorian.' : 'Ez dago daturik hautatutako aukerarako. Google Sheets-en fitxak eta ikusgarritasuna egiaztatu.', 'notice'));
        return;
      }
      list.forEach(item => out.append(page === 'entrenamenduak' ? trainingCard(item) : matchCard(item)));
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
      el('api-status').hidden=false;
      el('api-status').textContent='Google Sheets-eko datuak kargatzen…';
      return new Promise((resolve,reject)=>{const cb='mftCallback_'+Date.now();const script=document.createElement('script');let done=false;const timer=setTimeout(()=>finish(new Error('Konexioaren denbora agortu da.')),12000);function finish(err,data){if(done)return;done=true;clearTimeout(timer);script.remove();delete window[cb];err?reject(err):resolve(data);}window[cb]=data=>finish(null,data);script.onerror=()=>finish(new Error('Ezin izan da Apps Script irakurri.'));script.src=API+'?callback='+cb+'&t='+Date.now();document.head.append(script);}).then(data=>{if(!data||!Array.isArray(data.jardunaldiak))throw Error('Apps Script-en API formatua ez da egokia.');dataset=data;el('api-status').hidden=true;if(page)render();}).catch(err=>{el('api-status').hidden=false;el('api-status').textContent='⚠ '+err.message;if(page)el('results').prepend(node('div',err.message,'notice'));});
    }
    loadData();