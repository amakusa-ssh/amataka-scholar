'use strict';
const AS2Core=(()=>{
 const keys=['id','title','keywords','category1','category2','submissionFiscalYear','pdfUrl','fileSizeBytes'].sort().join(',');
 const plain=v=>typeof v==='string'&&v.trim().length>0;
 const arr=v=>Array.isArray(v)&&v.every(plain)&&new Set(v).size===v.length;
 const norm=v=>String(v).normalize('NFKC').toLocaleLowerCase('ja-JP').trim();
 const terms=v=>norm(v).split(/\s+/u).filter(Boolean);
 const pdfOk=v=>typeof v==='string'&&/^https:\/\/drive\.google\.com\/file\/d\/[A-Za-z0-9_-]{10,}\/view(?:\?resourcekey=[A-Za-z0-9_-]+)?$/.test(v);
 function requireOk(ok){if(!ok)throw Error('INVALID_CATALOG');}
 function validate(d){
  requireOk(d&&d.ok===true&&d.schemaVersion===1&&Number.isSafeInteger(d.count)&&d.count>=0&&Array.isArray(d.papers)&&d.papers.length===d.count&&Array.isArray(d.categories)&&typeof d.revision==='string'&&/^[0-9a-f]{64}$/.test(d.revision));
  const cats=new Map(),ids=new Set(),urls=new Set();
  for(const c of d.categories){requireOk(c&&plain(c.category1)&&!cats.has(c.category1)&&arr(c.category2)&&arr(c.historicalCategory2)&&!c.historicalCategory2.some(x=>c.category2.includes(x)));cats.set(c.category1,new Set([...c.category2,...c.historicalCategory2]));}
  for(const p of d.papers){requireOk(p&&Object.keys(p).sort().join(',')===keys&&/^AMT-[0-9A-F]{24}$/.test(p.id)&&!ids.has(p.id)&&plain(p.title)&&arr(p.keywords)&&p.keywords.length>0&&cats.has(p.category1)&&arr(p.category2)&&p.category2.every(x=>cats.get(p.category1).has(x))&&(p.submissionFiscalYear===null||Number.isInteger(p.submissionFiscalYear)&&p.submissionFiscalYear>=1900&&p.submissionFiscalYear<=9999)&&pdfOk(p.pdfUrl)&&!urls.has(p.pdfUrl)&&Number.isSafeInteger(p.fileSizeBytes)&&p.fileSizeBytes>0);ids.add(p.id);urls.add(p.pdfUrl);}
  return d;
 }
 const prepare=d=>validate(d).papers.map(p=>({...p,searchText:norm([p.title,...p.keywords].join(' '))}));
 function search(papers,f){const ts=terms(f.query||'');return papers.filter(p=>ts.every(t=>p.searchText.includes(t))&&(!f.major||p.category1===f.major)&&(!f.minor||p.category2.includes(f.minor))&&(!f.year||(f.year==='unknown'?p.submissionFiscalYear===null:String(p.submissionFiscalYear)===f.year))).sort((a,b)=>{if(f.sort==='title')return a.title.localeCompare(b.title,'ja')||a.id.localeCompare(b.id);const av=a.submissionFiscalYear,bv=b.submissionFiscalYear;return av===bv?a.id.localeCompare(b.id):av===null?1:bv===null?-1:f.sort==='oldest'?av-bv:bv-av;});}
 function page(results,n,size=24){const pages=Math.max(1,Math.ceil(results.length/size));const number=Math.max(1,Math.min(pages,n));return {pages,number,items:results.slice((number-1)*size,number*size),start:results.length?(number-1)*size+1:0,end:Math.min(results.length,number*size)};}
 return {validate,prepare,search,page,pdfOk};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=AS2Core;
