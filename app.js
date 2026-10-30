
let DB=null, ALLDOCS=[]; const $=x=>document.getElementById(x);

// URLs extraídas dos hyperlinks do PDF "Ferramentas Econet todas.pdf".
const SIMULADORES_ECONET = {
  "BA": "https://www.econeteditora.com.br/links_pagina_inicial/calculos/icmsba/Simulador_BA/index.php",
  "CE": "https://www.econeteditora.com.br/links_pagina_inicial/calculos/icmsce/Simulador_CE/index.php",
  "GO": "https://www.econeteditora.com.br/links_pagina_inicial/calculos/icmsgo/Simulador_GO/index.php",
  "MA": "https://www.econeteditora.com.br/links_pagina_inicial/calculos/icmsma/Simulador_MA/index.php",
  "MG": "https://www.econeteditora.com.br/links_pagina_inicial/calculos/icmsmg/Simulador_MG/index.php",
  "MS": "https://www.econeteditora.com.br/links_pagina_inicial/calculos/icmsms/Simulador_MS/index.php",
  "MT": "https://www.econeteditora.com.br/links_pagina_inicial/calculos/icmsmt/Simulador_MT2/index.php",
  "PA": "https://www.econeteditora.com.br/links_pagina_inicial/calculos/icmspa/Simulador_PA/index.php",
  "PB": "https://www.econeteditora.com.br/links_pagina_inicial/calculos/icmspb/Simulador_PB/index.php",
  "PE": "https://www.econeteditora.com.br/links_pagina_inicial/calculos/icmspe/Simulador_PE/index.php",
  "PI": "https://www.econeteditora.com.br/links_pagina_inicial/calculos/icmspi/Simulador_PI/index.php",
  "PR": "https://www.econeteditora.com.br/links_pagina_inicial/calculos/icmspr/Simulador_PR/index.php",
  "RS": "https://www.econeteditora.com.br/links_pagina_inicial/calculos/icmsrs/Simulador_RS/index.php",
  "SC": "https://www.econeteditora.com.br/links_pagina_inicial/calculos/icmssc/Simulador_SC/index.php",
  "SP": "https://www.econeteditora.com.br/links_pagina_inicial/calculos/icmssp/Simulador_SP/index.php"
};

const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function formatReduction(value){
  // Exibe somente o percentual já calculado e gravado em dados.json.
  if (value === null || value === undefined || String(value).trim() === '') return 'NÃO INFORMADO';
  const n = typeof value === 'number' ? value : Number(String(value).replace('%','').replace(',','.').trim());
  if (!Number.isFinite(n)) return 'NÃO INFORMADO';
  if (Math.abs(n) < 0.00000001) return 'NÃO POSSUI REDUÇÃO';
  return n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:4}) + '%';
}
function metric(label,value){let v=label==='Redução da BC-ST'?formatReduction(value):String(value??'').trim()||'Não informado';return `<div class="tile"><span>${e(label)}</span><strong>${e(v)}</strong></div>`;}
function render(){let uf=$('uf').value;let d=DB.estados.find(x=>x.uf===uf); if(!d)return;$('titulo').textContent='Parâmetros — '+uf;$('ncm').textContent='NCM '+d.ncm+'  ·  CEST '+d.cest;
 $('metrics').innerHTML=metric('ICMS interno',d.interna)+metric('ICMS interestadual',d.interestadual)+metric('MVA original',d.original)+metric('MVA ajustada 4%',d.ajustada)+metric('Redução da BC-ST',d.reducao);
 // Botão de simulador exclusivo da UF selecionada, quando houver URL confirmada no PDF.
 const simUrl=SIMULADORES_ECONET[uf];
 $('metrics').insertAdjacentHTML('beforeend', simUrl
 ? `<div class="tile" style="display:flex;flex-direction:column;justify-content:center;gap:9px"><span>Simulador de ICMS-ST — ${e(uf)}</span><a href="${e(simUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;font-weight:700;padding:10px 12px;border-radius:8px;text-align:center">Abrir simulador Econet ↗</a></div>`
 : `<div class="tile" style="display:flex;flex-direction:column;justify-content:center;gap:7px"><span>Simulador de ICMS-ST — ${e(uf)}</span><strong style="font-size:14px">LINK NÃO DISPONÍVEL NO PDF</strong></div>`);
 $('obs').textContent=d.observacoes||'Nenhuma observação cadastrada.';
 const laws=[['Fundamentação legal',d.legislacao],['Complemento 1',d.complemento1],['Complemento 2',d.complemento2]].filter(x=>x[1]);$('leis').innerHTML=laws.length?laws.map(x=>`<div class="law"><b>${e(x[0])}</b><div class="note">${e(x[1])}</div></div>`).join(''):'<p class="subtle">A planilha não informou fundamentação nesta linha.</p>';
 $('pdfs').innerHTML=d.docs.length?d.docs.map(x=>`<a class="doclink" href="${e(x.url)}" target="_blank" rel="noopener noreferrer" title="${e(x.source_file)}">📄 ${e(x.label)} ↗</a>`).join(''):'<p class="subtle">Nenhum PDF associado a esta UF.</p>';
 $('search').value='';$('statecount').textContent=DB.estados.length+' estados cadastrados';
}
function showDocs(){let q=$('search').value.toLocaleLowerCase('pt-BR');let a=ALLDOCS.filter(d=>d.name.toLowerCase().includes(q)||String(d.n).includes(q));$('catalog-list').innerHTML=a.map(d=>`<a href="${e(d.file)}" class="doclink" target="_blank" rel="noopener noreferrer">📑 ${e(d.name)} ↗</a>`).join('');}
async function init(){try{let [r,d]=await Promise.all([fetch('dados.json'),fetch('documentos.json')]);if(!r.ok||!d.ok)throw Error('Falha ao abrir dados');DB=await r.json();ALLDOCS=await d.json();$('uf').innerHTML=DB.estados.map(o=>`<option value="${e(o.uf)}">${e(o.uf)}</option>`).join('');$('uf').addEventListener('change',render);$('search').addEventListener('input',showDocs);$('toggle').onclick=()=>{let c=$('catalog');c.classList.toggle('active');$('toggle').textContent=c.classList.contains('active')?'Ocultar biblioteca completa':'Ver todos os 37 PDFs';showDocs()};$('uf').value='GO';render();}catch(err){$('loadstatus').textContent='Erro ao carregar: publique os arquivos no GitHub Pages ou use um servidor local. Abrir o HTML diretamente (file://) pode bloquear a leitura dos dados.';console.error(err)}}init();
