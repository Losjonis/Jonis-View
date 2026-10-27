const fs=require('fs');const languages=['es','en','fr','de','sv','ru'];const rows=fs.readFileSync('src/translations.txt','utf8').replace(/^\uFEFF/,'').trim().split(/\r?\n/).map(line=>line.split('|'));const dictionaries=Object.fromEntries(languages.map(l=>[l,{}]));for(const row of rows){if(row.length!==6)throw Error(row[0]);languages.forEach((l,i)=>dictionaries[l][row[0]]=row[i]);}
const code=`(function(root){
const dictionaries=${JSON.stringify(dictionaries,null,2)};
function resolve(locale){const base=String(locale||'').toLowerCase().replace(/_/g,'-').split('-')[0];return Object.hasOwn(dictionaries,base)?base:'en';}
function create(locale){const language=resolve(locale);function t(key,values={}){let text=dictionaries[language][key]??dictionaries.en[key];if(text===undefined){const suffix=key.match(/^(.*?)( · [A-Z]| ·)$/);text=suffix?t(suffix[1])+suffix[2]:key;}return text.replace(/\\{(\\w+)\\}/g,(_,name)=>values[name]??'{'+name+'}');}return {language,t};}
if(typeof module!=='undefined')module.exports={create,resolve,dictionaries};
else {root.I18n=create(root.desktop?.locale || navigator.language);document.documentElement.lang=root.I18n.language;const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);for(const node of nodes){if(node.parentElement.closest('script,style'))continue;const value=node.textContent.trim();if(!value)continue;node.textContent=node.textContent.replace(value,root.I18n.t(value));}for(const el of document.querySelectorAll('[title],[aria-label]'))for(const attr of ['title','aria-label'])if(el.hasAttribute(attr))el.setAttribute(attr,root.I18n.t(el.getAttribute(attr)));}
})(globalThis);
`;fs.writeFileSync('src/i18n.js',code);
