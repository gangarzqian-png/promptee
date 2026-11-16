export const GENRES=[{id:'landscape',name:'風景画像'},{id:'edit',name:'画像加工'},{id:'pet',name:'ペット画像'},{id:'flyer',name:'チラシ画像'},{id:'manual',name:'マニュアル作成'},{id:'tips',name:'テクニック'},{id:'adult',name:'アダルト'}];
export const gname=id=>GENRES.find(g=>g.id===id)?.name||id;
export const ago=d=>{const s=(Date.now()-new Date(d))/1000;return s<60?'たった今':s<3600?`${~~(s/60)}分前`:s<86400?`${~~(s/3600)}時間前`:`${~~(s/86400)}日前`};
