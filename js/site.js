(function(){
"use strict";
var $=function(id){return document.getElementById(id)};
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e}
var store={get:function(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
var done=store.get("haluch-done")||{};

var PARTS=[
{n:1,c:"var(--glc)",t:"Carboidratos",d:"Classificação, digestão, índice glicêmico, glicogênio, insulina, frutose, hipertrofia, endurance e saúde.",on:true},
{n:2,c:"var(--fat)",t:"Lipídios",d:"Tipos de gordura, digestão, lipogênese, lipólise, cetose, colesterol e risco cardiovascular.",on:true},
{n:3,c:"var(--pro)",t:"Proteínas",d:"Aminoácidos, síntese e degradação, dose por refeição, qualidade, suplementos proteicos e rim.",on:true},
{n:4,c:"var(--adr)",t:"Bioenergética, exercício e fadiga",d:"Krebs, fosforilação oxidativa, sistemas energéticos, fadiga, dano e recuperação muscular.",on:true},
{n:5,c:"var(--ins)",t:"Gasto energético e cálculo de dieta",d:"Componentes do gasto, fórmulas, superávit, déficit e montagem passo a passo.",on:true},
{n:6,c:"var(--glu)",t:"Emagrecimento",d:"Obesidade, fome e saciedade, resistência à insulina e à leptina, adaptação metabólica, reganho.",on:true},
{n:7,c:"var(--gly)",t:"Estratégias nutricionais",d:"Dieta flexível, refeição livre, ciclo de carboidratos, modelo Haluch, jejum intermitente e nutrient timing.",on:true},
{n:8,c:"var(--fib)",t:"Suplementação e termogênicos",d:"Creatina, cafeína, tampões, vasodilatadores, termogênicos e fármacos do emagrecimento.",on:true},
{n:9,c:"var(--glc)",t:"Fisiculturismo",d:"Potencial genético, off season, avaliação por dobras, pré-contest, semana final e rebote.",on:true},
{n:10,c:"var(--cor)",t:"Hormônios",d:"Eixo hormonal, testosterona, estrogênio, riscos documentados, mulheres e GH. Fisiologia e riscos, sem doses.",on:true},
{n:11,c:"var(--pro)",t:"Longevidade",d:"Envelhecimento, mTOR e IGF-1, restrição calórica e proteica, zonas azuis, jejum e o conflito com a hipertrofia.",on:true},
{n:12,c:"var(--fib)",t:"Vitaminas e minerais",d:"Coenzimas do complexo B, metilação, vitaminas C, A, D, E e K, eletrólitos, cálcio, magnésio, ferro e hepcidina, zinco, selênio e iodo.",on:true},
{n:13,c:"var(--pro)",t:"Aminoácidos",d:"Essenciais e não essenciais, leucina e mTOR, BCAA e EAA, glutamina, glutationa, citrulina, colágeno e fadiga central.",on:true}];

var ph=$("parts");
PARTS.forEach(function(p){
  var a=el(p.on?"a":"div","part "+(p.on?"on":"off"),'<span class="no">'+("0"+p.n).slice(-2)+"</span><span><b>"+p.t+"</b><small>"+p.d+'</small></span><span class="st">'+(p.on?"Ler":"Em preparo")+"</span>");
  a.style.setProperty("--c",p.c);if(p.on)a.href="#parte-"+p.n;ph.appendChild(a);
});

/* ---------- rotas ---------- */
var home=$("home"),reader=$("reader"),nav=$("nav"),drawer=$("drawer"),cache={},current=0;
function route(){
  var m=/^#parte-(\d+)$/.exec(location.hash),n=m?+m[1]:0,p=PARTS[n-1];
  if(!p||!p.on){current=0;reader.hidden=true;home.hidden=false;$("where").textContent="Sumário";$("menuBtn").textContent="Partes";buildNavHome();meter();return}
  current=n;home.hidden=true;reader.hidden=false;$("menuBtn").textContent="Seções";
  $("where").textContent="Parte "+n+" · "+p.t;
  if(cache[n]){mount(n);return}
  reader.innerHTML='<div class="loading">Carregando a parte '+n+"…</div>";
  fetch("partes/p"+n+".html").then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(h){cache[n]=h;if(current===n)mount(n)})
    .catch(function(){reader.innerHTML='<div class="loading">Não foi possível carregar esta parte. Recarregue a página.</div>'});
}
function buildNavHome(){nav.innerHTML="<h3>Partes</h3>";PARTS.forEach(function(p){if(!p.on)return;var a=el("a",null,'<span class="n">'+("0"+p.n).slice(-2)+"</span><span>"+p.t+"</span>");a.href="#parte-"+p.n;nav.appendChild(a)})}
function mount(n){
  reader.innerHTML=cache[n];window.scrollTo(0,0);
  nav.innerHTML="<h3>Parte "+n+"</h3>";
  var h=el("a",null,'<span class="n">←</span><span>Voltar ao sumário</span>');h.href="#inicio";nav.appendChild(h);
  [].forEach.call(reader.querySelectorAll(".sec"),function(s){
    var a=el("a",null,'<span class="n">'+s.dataset.n+"</span><span>"+s.querySelector("h2").textContent+"</span>");a.href="#";a.dataset.to=s.id;
    if(done[s.id])a.classList.add("done");nav.appendChild(a);
    var b=s.querySelector(".donebtn");if(b){b.dataset.id=s.id;paintBtn(b)}
  });
  widgets();gloss();meter();
}
function paintBtn(b){var d=!!done[b.dataset.id];b.setAttribute("aria-pressed",d);b.textContent=d?"Seção estudada ✓":"Marcar seção como estudada"}
function meter(){var s=reader.querySelectorAll(".sec"),k=0;[].forEach.call(s,function(x){if(done[x.id])k++});$("meter").style.width=(current&&s.length?k/s.length*100:0)+"%"}
window.addEventListener("hashchange",route);
$("menuBtn").onclick=function(){drawer.classList.add("open")};
$("shade").onclick=function(){drawer.classList.remove("open")};
document.addEventListener("keydown",function(e){if(e.key==="Escape"){drawer.classList.remove("open");$("sheet").classList.remove("open")}});
nav.addEventListener("click",function(e){var a=e.target.closest("a");if(!a)return;drawer.classList.remove("open");
  if(a.dataset.to){e.preventDefault();var t=$(a.dataset.to);if(t)window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-60})}});
document.addEventListener("click",function(e){
  var b=e.target.closest(".donebtn");
  if(b){var id=b.dataset.id;done[id]=!done[id];store.set("haluch-done",done);paintBtn(b);meter();var l=nav.querySelector('[data-to="'+id+'"]');if(l)l.classList.toggle("done",!!done[id]);return}
  var g=e.target.closest(".g");
  if(g){var x=G[+g.dataset.g];$("sheetT").textContent=x[0];$("sheetD").textContent=x[2];$("sheet").classList.add("open");return}
  if(!e.target.closest("#sheet"))$("sheet").classList.remove("open");
});
$("sheetX").onclick=function(){$("sheet").classList.remove("open")};

/* ---------- widgets ---------- */
function widgets(){
  [].forEach.call(reader.querySelectorAll(".tabs"),function(t){
    var chips=el("div","chips"),panels=[].slice.call(t.querySelectorAll(":scope > .panel"));
    panels.forEach(function(p,i){var b=el("button","chip",p.dataset.label);b.type="button";b.setAttribute("aria-pressed",i===0);p.hidden=i!==0;
      b.onclick=function(){[].forEach.call(chips.children,function(c){c.setAttribute("aria-pressed","false")});b.setAttribute("aria-pressed","true");panels.forEach(function(q){q.hidden=q!==p})};chips.appendChild(b)});
    t.insertBefore(chips,panels[0]);
  });
  var cg=reader.querySelector('[data-w="cg"]');
  if(cg){
    var foods=[["Arroz branco cozido",64,28],["Arroz integral cozido",55,26],["Batata inglesa cozida",81,12],["Batata doce cozida",61,18],["Macarrão cozido",61,25],["Feijão cozido",40,14],["Pão integral",52,44],["Aveia",55,57],["Banana",52,24],["Maçã",40,15],["Melancia",72,8],["Abacaxi",66,12]];
    var sel=cg.querySelector("select"),gr=cg.querySelector("input"),out=cg.querySelector(".res");
    foods.forEach(function(f,i){var o=el("option",null,f[0]+" (IG "+f[1]+")");o.value=i;sel.appendChild(o)});
    var run=function(){var f=foods[+sel.value],g=parseFloat(gr.value);
      if(!(g>0&&g<=2000)){out.innerHTML="<span>Informe uma porção entre 1 e 2.000 g.</span>";return}
      var carb=f[2]*g/100,v=f[1]*carb/100,cl=v<10?"baixa":v<20?"média":"alta";
      out.innerHTML="<b>"+v.toFixed(1).replace(".",",")+"</b><span>Carga glicêmica <b style=\"font:inherit;font-weight:700;color:#fff\">"+cl+"</b>. A porção tem "+carb.toFixed(0)+" g de carboidrato. Conta: "+f[1]+" × "+carb.toFixed(0)+" ÷ 100.</span>"};
    sel.onchange=run;gr.oninput=run;run();
  }
  var pr=reader.querySelector('[data-w="prot"]');
  if(pr){var pw=pr.querySelector("input"),ps=pr.querySelector("select"),po=pr.querySelector(".res"),r5p=function(n){return (Math.round(n/5)*5).toLocaleString("pt-BR")};
    var pf=function(){var k=parseFloat(pw.value);if(!(k>=35&&k<=200)){po.innerHTML="<span>Informe um peso entre 35 e 200 kg.</span>";return}
      var v=ps.value.split(","),lo=+v[0],hi=+v[1];
      po.innerHTML='<span style="display:grid;gap:6px;width:100%">'+[["Total por dia",r5p(lo*k)+" a "+r5p(hi*k)+" g"],["Por refeição (0,25 a 0,50 g/kg)",Math.round(.25*k)+" a "+Math.round(.5*k)+" g"],["Antes de dormir (~0,5 g/kg)","~"+Math.round(.5*k)+" g"]].map(function(x){return '<span style="display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid rgba(255,255,255,.12);padding-bottom:5px"><span>'+x[0]+'</span><b style="font-family:var(--serif);font-weight:400;font-size:22px;color:var(--pro);white-space:nowrap">'+x[1]+"</b></span>"}).join("")+"</span>"};
    pw.oninput=pf;ps.onchange=pf;pf();}
  var gerAll=function(sx,I,P,A,bf){var m=sx==="m",o={};
    o.hb=m?66+13.8*P+5*A-6.8*I:655+9.6*P+1.9*A-4.7*I;
    var f=I<18?(m?[17.686,658.2]:[13.384,692.6]):I<30?(m?[15.057,692.2]:[14.818,486.6]):I<=60?(m?[11.472,873.1]:[8.126,845.6]):(m?[11.711,587.7]:[9.082,658.5]);
    o.fa=f[0]*P+f[1];o.mi=10*P+6.25*A-5*I+(m?5:-161);o.tp=24.8*P+10;
    if(bf>=3&&bf<=60){var L=P*(1-bf/100);o.mlg=L;o.cu=22*L+500;o.tm=25.9*L+284}
    return o};
  var eqN={hb:"Harris-Benedict",fa:"FAO/OMS",mi:"Mifflin-St Jeor",cu:"Cunningham (MLG)",tp:"Tinsley (peso)",tm:"Tinsley (MLG)"};
  var fmtK=function(n){return Math.round(n).toLocaleString("pt-BR")};
  var rowK=function(a,b,c){return '<span style="display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid rgba(255,255,255,.12);padding-bottom:5px"><span>'+a+'</span><b style="font-family:var(--serif);font-weight:400;font-size:21px;color:'+(c||"var(--glc)")+';white-space:nowrap">'+b+"</b></span>"};
  var gr=reader.querySelector('[data-w="ger"]');
  if(gr){var gq=function(i){return gr.querySelector("#"+i)},go=gr.querySelector(".res");
    var gf=function(){var P=parseFloat(gq("grP").value),A=parseFloat(gq("grA").value),I=parseFloat(gq("grI").value),bf=parseFloat(gq("grG").value);
      if(!(P>=35&&P<=200&&A>=130&&A<=220&&I>=10&&I<=90)){go.innerHTML="<span>Confira idade, peso e altura.</span>";return}
      var o=gerAll(gq("grS").value,I,P,A,bf),ks=["hb","fa","mi","cu","tp","tm"].filter(function(k){return o[k]}),vs=ks.map(function(k){return o[k]});
      go.innerHTML='<span style="display:grid;gap:6px;width:100%">'+ks.map(function(k){return rowK(eqN[k],fmtK(o[k])+" kcal")}).join("")+rowK("Diferença entre a menor e a maior",fmtK(Math.max.apply(0,vs)-Math.min.apply(0,vs))+" kcal","var(--glu)")+(o.mlg?'<span style="font-size:13px;opacity:.8">Massa livre de gordura: '+o.mlg.toFixed(1).replace(".",",")+" kg</span>":"")+"</span>"};
    [].forEach.call(gr.querySelectorAll("input,select"),function(e){e.oninput=gf;e.onchange=gf});gf();}
  var dt=reader.querySelector('[data-w="dieta"]');
  if(dt){var dq=function(i){return dt.querySelector("#"+i)},dout=dt.querySelector(".res");
    var df=function(){var P=parseFloat(dq("dtP").value),A=parseFloat(dq("dtA").value),I=parseFloat(dq("dtI").value),bf=parseFloat(dq("dtG").value),fa=parseFloat(dq("dtF").value),aj=parseFloat(dq("dtJ").value)||0,pk=parseFloat(dq("dtR").value),pc=parseFloat(dq("dtC").value),eq=dq("dtE").value;
      if(!(P>=35&&P<=200&&A>=130&&A<=220&&I>=10&&I<=90&&pk>=0.8&&pk<=3.5&&pc>=10&&pc<=70)){dout.innerHTML="<span>Confira os campos.</span>";return}
      var o=gerAll(dq("dtS").value,I,P,A,bf);if(!o[eq]){dout.innerHTML="<span>Essa equação precisa do percentual de gordura.</span>";return}
      var ger=Math.round(o[eq]),get=Math.round(ger*fa),vet=get+aj;if(vet<800){dout.innerHTML="<span>O ajuste deixou a dieta abaixo de 800 kcal. Reduza o déficit.</span>";return}
      var pg=P*pk,pp=pg*4/vet*100,gp=100-pp-pc,cg=vet*pc/100/4,gg=vet*gp/100/9;
      if(gp<10){dout.innerHTML="<span>Proteína e carboidrato somam "+Math.round(pp+pc)+"% e sobra pouco para gordura. Reduza o carboidrato.</span>";return}
      var l1=function(n){return n.toFixed(1).replace(".",",")};
      dout.innerHTML='<span style="display:grid;gap:6px;width:100%">'+rowK("1 · GER ("+eqN[eq]+")",fmtK(ger)+" kcal")+rowK("2 · GET (× "+String(fa).replace(".",",")+")",fmtK(get)+" kcal")+rowK("3 · VET ("+(aj>=0?"+":"−")+Math.abs(aj)+")",fmtK(vet)+" kcal","#fff")+rowK("4 · Proteína · "+Math.round(pp)+"%",Math.round(pg)+" g","var(--pro)")+rowK("5 · Carboidrato · "+Math.round(pc)+"% · "+l1(cg/P)+" g/kg",Math.round(cg)+" g","var(--glc)")+rowK("5 · Gordura · "+Math.round(gp)+"% · "+l1(gg/P)+" g/kg",Math.round(gg)+" g","var(--fat)")+'<span style="font-size:13px;opacity:.8">Por refeição, em 4 refeições: cerca de '+Math.round(pg/4)+" g de proteína. Faixa dos livros: "+Math.round(.25*P)+" a "+Math.round(.5*P)+" g.</span></span>"};
    [].forEach.call(dt.querySelectorAll("input,select"),function(e){e.oninput=df;e.onchange=df});df();}
  var cy=reader.querySelector('[data-w="ciclo"]');
  if(cy){var cq=function(i){return parseFloat(cy.querySelector("#"+i).value)},cout=cy.querySelector(".res");
    var cf=function(){var C=cq("ccC"),P=cq("ccP"),G=cq("ccG"),lc=cq("ccLC"),lp=cq("ccLP"),lg=cq("ccLG");
      if(!(C>0&&P>0&&G>0&&lc>0&&lp>0&&lg>0)){cout.innerHTML="<span>Preencha os seis campos.</span>";return}
      if(lc>=C){cout.innerHTML="<span>O carboidrato do dia low carb precisa ser menor que o do dia moderado.</span>";return}
      var hc=(5*C-3*lc)/2,hp=(5*P-3*lp)/2,hg=(5*G-3*lg)/2;
      if(hp<40||hg<15){cout.innerHTML="<span>Com esses dias low carb, sobra pouca "+(hp<40?"proteína":"gordura")+" para os dias high carb. Reduza "+(hp<40?"a proteína":"a gordura")+" dos dias low carb.</span>";return}
      var k=function(c,p,g){return 4*c+4*p+9*g},km=k(C,P,G),kl=k(lc,lp,lg),kh=k(hc,hp,hg),r=Math.round;
      var ln=function(c,p,g){return r(c)+" C · "+r(p)+" P · "+r(g)+" G"};
      cout.innerHTML='<span style="display:grid;gap:6px;width:100%">'+rowK("Low × 3 · "+ln(lc,lp,lg),fmtK(kl)+" kcal","var(--ins)")+rowK("Moderado × 2 · "+ln(C,P,G),fmtK(km)+" kcal","var(--gly)")+rowK("High × 2 · "+ln(hc,hp,hg),fmtK(kh)+" kcal","var(--glc)")+rowK("Semana ciclada",fmtK(3*kl+2*km+2*kh)+" kcal","#fff")+rowK("Semana contínua (7 × moderado)",fmtK(7*km)+" kcal","#fff")+'<span style="font-size:13px;opacity:.8">Gramas por dia de carboidrato (C), proteína (P) e gordura (G). As duas semanas fecham iguais: o déficit semanal é o mesmo.</span></span>'};
    [].forEach.call(cy.querySelectorAll("input"),function(e){e.oninput=cf;e.onchange=cf});cf();}
  var sp=reader.querySelector('[data-w="supl"]');
  if(sp){var sout=sp.querySelector(".res"),sin=sp.querySelector("#spP");
    var sf=function(){var P=parseFloat(sin.value);if(!(P>=40&&P<=160)){sout.innerHTML="<span>Informe um peso entre 40 e 160 kg.</span>";return}
      var r=Math.round,g1=function(n){return n.toFixed(1).replace(".",",")};
      sout.innerHTML='<span style="display:grid;gap:6px;width:100%">'+rowK("Creatina · todo dia","3 a 5 g","var(--glc)")+rowK("Creatina · saturação opcional, 5 a 7 dias",r(.3*P)+" g/dia","var(--glc)")+rowK("Beta-alanina · todo dia, doses de até 1,6 g","3,2 a 6,4 g","var(--pro)")+rowK("Cafeína · 1 h antes",r(3*P)+" a "+r(6*P)+" mg","var(--adr)")+rowK("Bicarbonato · 60 a 150 min antes",g1(.3*P)+" g","var(--ins)")+rowK("Citrulina · 45 a 60 min antes","6 a 8 g","var(--glu)")+rowK("Nitrato · 2 h antes",r(4*P)+" a "+r(10*P)+" mg","var(--fat)")+'<span style="font-size:13px;opacity:.8">Cafeína: '+r(3*P)+" mg equivalem a cerca de "+g1(3*P/100)+" cafés expressos de 150 ml, pelos valores do livro. Nitrato: a beterraba tem de 100 a 150 mg por 100 g.</span></span>"};
    sin.oninput=sf;sin.onchange=sf;sf();}
  var pw=reader.querySelector('[data-w="prep"]');
  if(pw){var pq=function(i){return pw.querySelector("#"+i)},pout=pw.querySelector(".res");
    var BFM={3:"4 a 5",4:"5 a 6",5:"6 a 7",6:"7 a 8",7:"8 a 9",8:"9 a 10",9:"10 a 11",10:"11 a 12",11:"12 a 13",12:"14 a 15",13:"15 a 16",14:"17 a 18",15:"18 a 20"};
    var BFF={3:"7 a 8",4:"8 a 10",5:"10 a 12",6:"12 a 14",7:"13 a 15",8:"15 a 17",9:"17 a 19",10:"18 a 20",11:"19 a 21",12:"20 a 22",13:"21 a 23",14:"22 a 24",15:"23 a 25"};
    var pf=function(){var sx=pq("ppS").value,d=Math.round(parseFloat(pq("ppD").value)),P=parseFloat(pq("ppP").value);
      if(!(d>=3&&d<=15&&P>=40&&P<=160)){pout.innerHTML="<span>Dobra de 3 a 15 mm e peso de 40 a 160 kg.</span>";return}
      var f=sx=="f",bf=(f?BFF:BFM)[d],lo=parseFloat(bf.split(" a ")[0]),hi=parseFloat(bf.split(" a ")[1]);
      var t,alvo=f?"8 a 10":"4 a 6";
      if(hi<=(f?13:8))t="8 semanas";else if(hi<=(f?15:12))t="10 a 12 semanas";else if(hi<=(f?18:15))t="12 a 16 semanas";else t="16 a 20 semanas";
      var g1=function(n){return n.toFixed(1).replace(".",",")};
      var kgs=P*(lo+hi)/200-P*(f?0.09:0.05);
      pout.innerHTML='<span style="display:grid;gap:6px;width:100%">'+rowK("Dobra abdominal",d+" mm","var(--gly)")+rowK("Gordura estimada",bf+" %","var(--glu)")+rowK("Condição de palco",alvo+" %","var(--glc)")+rowK("Tempo de pré-contest",t,"#fff")+rowK("Perda de 0,5 a 1% por semana",g1(P*0.005)+" a "+g1(P*0.01)+" kg","var(--pro)")+(kgs>0?rowK("Gordura a perder, aproximada",g1(kgs)+" kg","var(--fat)"):"")+'<span style="font-size:13px;opacity:.8">Estimativas das tabelas do livro (dobra e tempo) e do ritmo de Helms (2014). A gordura a perder usa o ponto médio da faixa estimada. Ferramenta de estudo, não é prescrição.</span></span>'};
    [].forEach.call(pw.querySelectorAll("input,select"),function(e){e.oninput=pf;e.onchange=pf});pf();}
  var ed=reader.querySelector('[data-w="endur"]');
  if(ed){var w=ed.querySelector("input"),o=ed.querySelector(".res"),r5=function(n){return (Math.round(n/5)*5).toLocaleString("pt-BR")};
    var f=function(){var k=parseFloat(w.value);if(!(k>=35&&k<=200)){o.innerHTML="<span>Informe um peso entre 35 e 200 kg.</span>";return}
      o.innerHTML='<span style="display:grid;gap:6px;width:100%">'+[["Treino até 1 h/dia",5,7],["Treino de 1 a 3 h/dia",6,10],["Treino acima de 4 h/dia",8,12],["48 h antes de prova longa",10,12],["Pré-prova (1 a 4 h antes)",1,4]].map(function(x){return '<span style="display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid rgba(255,255,255,.12);padding-bottom:5px"><span>'+x[0]+'</span><b style="font-family:var(--serif);font-weight:400;font-size:22px;color:var(--glc);white-space:nowrap">'+r5(x[1]*k)+" a "+r5(x[2]*k)+" g</b></span>"}).join("")+"</span>"};
    w.oninput=f;f();}
}

/* ---------- glossário automático ---------- */
var byForm={},forms=[];
G.forEach(function(g,i){g[1].forEach(function(f){[f,f.charAt(0).toUpperCase()+f.slice(1)].forEach(function(v){if(!(v in byForm)){byForm[v]=i;forms.push(v)}})})});
forms.sort(function(a,b){return b.length-a.length});
var re=new RegExp("(?<![\\p{L}\\p{N}-])("+forms.map(function(s){return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}).join("|")+")(?![\\p{L}\\p{N}])","u");
var skip={SVG:1,BUTTON:1,A:1,H1:1,H2:1,H3:1,H4:1,H5:1,TH:1,LABEL:1,SELECT:1,OPTION:1,SUMMARY:1,FIGCAPTION:1,CAPTION:1};
function gloss(){
  [].forEach.call(reader.querySelectorAll(".sec"),function(sec){
    var used={},tw=document.createTreeWalker(sec,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
      for(var p=n.parentNode;p&&p!==sec;p=p.parentNode){if(skip[p.nodeName.toUpperCase()]||(p.classList&&(p.classList.contains("m")||p.classList.contains("res")||p.classList.contains("tag")||p.classList.contains("ask")||p.classList.contains("anchor")||p.classList.contains("refs"))))return NodeFilter.FILTER_REJECT}
      return NodeFilter.FILTER_ACCEPT}}),nodes=[],n;
    while((n=tw.nextNode()))nodes.push(n);
    nodes.forEach(function(node){var guard=0;
      while(node&&guard++<40){var txt=node.nodeValue,m,from=0,hit=null;
        while((m=re.exec(txt.slice(from)))){var k=byForm[m[1]];if(!used[k]){hit={i:from+m.index,len:m[1].length,k:k};break}from+=m.index+m[1].length}
        if(!hit)break;used[hit.k]=1;
        var rest=node.splitText(hit.i),after=rest.splitText(hit.len),b=document.createElement("button");
        b.type="button";b.className="g";b.dataset.g=hit.k;b.textContent=rest.nodeValue;rest.parentNode.replaceChild(b,rest);node=after}
    });
  });
}
route();
})();
