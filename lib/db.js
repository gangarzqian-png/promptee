import { createClient } from '@supabase/supabase-js';
export const db=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
// 画像の署名付きURLを付与。アダルトは年齢確認済みのときだけ
export async function withUrls(posts,ok){
  const paths=posts.filter(p=>p.image_path&&(ok||p.genre!=='adult')).map(p=>p.image_path);
  const m={};
  if(paths.length){const {data}=await db.storage.from('images').createSignedUrls(paths,3600);(data||[]).forEach(d=>{if(d.signedUrl)m[d.path]=d.signedUrl});}
  return posts.map(p=>({...p,url:m[p.image_path]||null}));
}
