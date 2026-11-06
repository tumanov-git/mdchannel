// mdchannel — бот @mdchannelbot внутри Telegram-виджета. Документация: docs/mdchannel.md
//
// Подключать не нужно: пишите в коде виджета mdchannel.… — бот сам вставит библиотеку перед кодом, когда
// публикует виджет и показывает превью: `var mdchannel=` + эта функция + `(поля формы)`. В виджет попадают
// только методы, которые есть в коде (по одному на строку), — библиотека занимает 0,3–0,6 КБ из 4 КБ.
// Строки, начинающиеся с //, бот выбрасывает.
(function(F){
var T=window.TelegramWidget||{},H=T.HapticFeedback,S,C,L=[],md;
function js(x){try{return JSON.parse(x||"{}")||{}}catch(e){return{}}}
function ld(){S=js(T.publicData);C=js(T.chatData)}
function up(){ld();if(!F)md.fields=S;L.forEach(function(f){f()})}
function g(k,d){try{var v=localStorage["md"+k];return v==null?d:JSON.parse(v)}catch(e){return d}}
function p(k,v){try{localStorage["md"+k]=JSON.stringify(v)}catch(e){}}
function q(s,f,b,e){var r;try{r=T.request&&T.request(s)}catch(o){}return(r||Promise.reject()).then(function(a){var x=JSON.parse(a.result);if(!x||x.error&&!e)throw 0;f(x);return b()},function(){return b()})}
function n(a){return a||0}
ld();T.onEvent&&(T.onEvent("publicDataChanged",up),T.onEvent("chatDataChanged",up));T.watchPublicData&&T.watchPublicData();
return md={
fields:F||S,preview:!!T.isPreview,me:T.viewer||null,
data:function(k){return(S.d||{})[k]||null},
on:function(e,f){L.push(f)},
total:function(k){return n((C.k||{})[k])+g("k"+k,0)},
count:function(k){p("k"+k,g("k"+k,0)+1);return q("c:"+k,function(x){p("k"+k,0);C.k=x.k},function(){return md.total(k)})},
countOnce:function(k){if(g("o"+k))return Promise.resolve(md.total(k));p("o"+k,1);p("k"+k,g("k"+k,0)+1);var t=md.total(k);return q("o:"+k,function(x){p("k"+k,0);C.k=x.k},function(){return md.total(k)})},
counted:function(k){return!!g("o"+k)},
voted:function(){return g("v",null)},
votes:function(m){var c=(C.c||[]).slice(),v=md.voted(),j=0;if(v!=null&&!g("vs"))c[v]=n(c[v])+1;for(;j<(m||c.length);j++)c[j]=n(c[j]);return c},
revote:function(i){if(md.voted()===i)return Promise.resolve(md.votes());p("v",i);p("vs",0);return q("x:"+i,function(x){p("vs",1);C.c=x.c},md.votes)},
vote:function(i){if(md.voted()!=null)return Promise.resolve(md.votes());p("v",i);return q("v:"+i,function(x){p("vs",1);C.c=x.c},md.votes)},
rated:function(){return g("r",null)},
rating:function(){var m=md.rated(),o=m!=null&&!g("rs"),s=n(C.s)+(o?m:0),c=n(C.n)+(o?1:0);return{avg:c?s/c:0,count:c,me:m}},
rate:function(v){if(md.rated()!=null)return Promise.resolve(md.rating());p("r",v);return q("r:"+v,function(x){p("rs",1);C.s=x.s;C.n=x.n},md.rating)},
open:function(u){/^https:\/\/t\.me\//.test(u)?T.openTelegramLink(u):T.openLink(u)},
copy:function(t){T.copyText(t)},
haptic:function(k){H&&(/^(success|error|warning)$/.test(k)?H.notificationOccurred(k):k=="select"?H.selectionChanged():H.impactOccurred(k||"light"))},
score:function(v){var b=Math.max(v,g("s",0)),r;p("s",b);return q("s:"+Math.floor(v),function(x){r=x;C.t=x.t},function(){return r||{t:C.t||[],best:b,place:null}})},
top:function(){return C.t||[]},
claim:function(f){var r;return q("k:"+f,function(x){r=x},function(){return r||{error:"offline"}},1)},
isMember:function(c){var r=null;return q("m:"+(c||""),function(x){r=x.member==null?null:x.member},function(){return r},1)},
unlock:function(f){var r;return q("u:"+f,function(x){r=x},function(){return r||{error:"offline"}},1)},
remind:function(f){var r;return q("n:"+f,function(x){r=x},function(){return r||{error:"offline"}},1)},
}})
