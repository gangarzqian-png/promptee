'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { getUser, setSession, hashPw, verifyPw } from '@/lib/auth';
import { GENRES } from '@/lib/genres';
const fails=new Map();
const err=(path,m)=>redirect(`${path}${path.includes('?')?'&':'?'}e=${encodeURIComponent(m)}`);
const s=(fd,k,n)=>String(fd.get(k)||'').trim().slice(0,n);

export async function register(fd){
  const name=s(fd,'name',20),pw=String(fd.get('password')||'');
  if(name.length<2)err('/register','名前は2〜20文字で入力してください');
  if(pw.length<8)err('/register','パスワードは8文字以上にしてください');
  const {data,error}=await db.from('users').insert({name,pass_hash:await hashPw(pw)}).select('id,name,role').single();
  if(error)err('/register',error.code==='23505'?'その名前はすでに使われています':'登録に失敗しました');
  await setSession(data);redirect('/');
}
export async function login(fd){
  const name=s(fd,'name',20),pw=String(fd.get('password')||'');
  const f=fails.get(name)||{n:0,t:0},recent=Date.now()-f.t<600000;
  if(f.n>=5&&recent)err('/login','失敗が続いたため、10分ほど待ってください');
  const {data:u}=await db.from('users').select('id,name,role,pass_hash').eq('name',name).maybeSingle();
  let ok=false;try{ok=!!u&&await verifyPw(u.pass_hash,pw)}catch{}
  if(!ok){fails.set(name,{n:(recent?f.n:0)+1,t:Date.now()});err('/login','名前かパスワードが違います');}
  fails.delete(name);await setSession(u);redirect('/');
}
export async function logout(){cookies().delete('s');redirect('/');}
export async function confirmAge(next){
  cookies().set('age','1',{httpOnly:true,sameSite:'lax',path:'/',maxAge:31536000});
  redirect(next&&next.startsWith('/')&&!next.startsWith('//')?next:'/');
}
export async function createPost(fd){
  const u=await getUser();if(!u)redirect('/login');
  const genre=s(fd,'genre',20),title=s(fd,'title',80),prompt=s(fd,'prompt',4000),tool=s(fd,'tool',40);
  if(!GENRES.some(g=>g.id===genre)||!title||!prompt)err('/new','ジャンル・タイトル・プロンプトは必須です');
  if(fd.get('agree')!=='on')err('/new','投稿ルールへの同意が必要です');
  const file=fd.get('image');let path=null;
  if(file&&file.size>0){
    const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type];
    if(!ext)err('/new','画像はJPEG・PNG・WebPのみです');
    if(file.size>4*1024*1024)err('/new','画像は4MB以下にしてください');
    path=`${u.uid}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
    const {error}=await db.storage.from('images').upload(path,Buffer.from(await file.arrayBuffer()),{contentType:file.type});
    if(error)err('/new','画像のアップロードに失敗しました');
  }else if(!['manual','tips'].includes(genre))err('/new','このジャンルは画像が必須です');
  const {data,error}=await db.from('posts').insert({user_id:u.uid,genre,title,prompt,tool,image_path:path}).select('id').single();
  if(error)err('/new','投稿に失敗しました');
  revalidatePath('/');redirect(`/post/${data.id}`);
}
export async function toggleLike(id){
  const u=await getUser();if(!u)redirect('/login');
  const {data}=await db.from('likes').select('post_id').eq('post_id',id).eq('user_id',u.uid).maybeSingle();
  if(data)await db.from('likes').delete().eq('post_id',id).eq('user_id',u.uid);
  else await db.from('likes').insert({post_id:id,user_id:u.uid});
  const {count}=await db.from('likes').select('*',{count:'exact',head:true}).eq('post_id',id);
  await db.from('posts').update({like_count:count||0}).eq('id',id);
  revalidatePath(`/post/${id}`);revalidatePath('/');
}
export async function addComment(id,fd){
  const u=await getUser();if(!u)redirect('/login');
  const body=s(fd,'body',500);if(!body)return;
  await db.from('comments').insert({post_id:id,user_id:u.uid,body});
  const {count}=await db.from('comments').select('*',{count:'exact',head:true}).eq('post_id',id);
  await db.from('posts').update({comment_count:count||0}).eq('id',id);
  revalidatePath(`/post/${id}`);
}
export async function report(id,fd){
  const u=await getUser();if(!u)redirect('/login');
  await db.from('reports').insert({post_id:id,user_id:u.uid,reason:s(fd,'reason',200)||'未記入'});
  redirect(`/post/${id}?r=1`);
}
export async function hidePost(id){
  const u=await getUser();if(u?.role!=='admin')redirect('/');
  await db.from('posts').update({hidden:true}).eq('id',id);
  await db.from('reports').delete().eq('post_id',id);
  revalidatePath('/admin');revalidatePath('/');
}
