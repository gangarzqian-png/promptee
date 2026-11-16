import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db, withUrls } from '@/lib/db';
import { ageOk } from '@/lib/auth';
import { GENRES, gname, ago } from '@/lib/genres';
export const dynamic='force-dynamic';
const PER={week:7,month:30};
export default async function Home({searchParams:sp}){
  const g=GENRES.some(x=>x.id===sp.g)?sp.g:'',s=sp.s==='new'?'new':'rank',p=PER[sp.p]?sp.p:'all',q=(sp.q||'').trim().slice(0,40);
  const ok=ageOk();
  if(g==='adult'&&!ok)redirect('/age?next='+encodeURIComponent('/?g=adult'));
  let qb=db.from('posts').select('id,title,genre,image_path,like_count,comment_count,created_at,users(name)').eq('hidden',false);
  qb=g?qb.eq('genre',g):qb.neq('genre','adult');
  if(q)qb=qb.ilike('title',`%${q.replace(/[%,]/g,'')}%`);
  if(s==='rank'&&PER[p])qb=qb.gte('created_at',new Date(Date.now()-PER[p]*864e5).toISOString());
  qb=s==='new'?qb.order('created_at',{ascending:false}):qb.order('like_count',{ascending:false}).order('created_at',{ascending:false});
  const {data}=await qb.limit(60);
  const posts=await withUrls(data||[],ok);
  const href=o=>{const m={g,s,p,q,...o},u=new URLSearchParams();for(const k in m)if(m[k])u.set(k,m[k]);return '/?'+u};
  return(<>
    <form className="srch"><input name="q" defaultValue={q} placeholder="タイトルで検索"/><input type="hidden" name="g" value={g}/><input type="hidden" name="s" value={s}/><button className="btn">検索</button></form>
    <div className="tabs"><Link href={href({g:''})} className={!g?'on':''}>すべて</Link>{GENRES.map(x=><Link key={x.id} href={href({g:x.id})} className={g===x.id?'on':''}>{x.name}</Link>)}</div>
    <div className="tabs"><Link href={href({s:'rank'})} className={s==='rank'?'on':''}>🏆 ランキング</Link><Link href={href({s:'new'})} className={s==='new'?'on':''}>新着</Link>
      {s==='rank'&&[['week','週間'],['month','月間'],['all','全期間']].map(([k,l])=><Link key={k} href={href({p:k})} className={p===k?'on':''}>{l}</Link>)}</div>
    {posts.length===0?<div className="box mu">まだ投稿がありません。最初の1枚を投稿してみましょう。</div>:
    <div className="grid">{posts.map((x,i)=><Link key={x.id} href={`/post/${x.id}`} className="card">
      {s==='rank'&&i<3&&<span className={`rk r${i+1}`}>{i+1}位</span>}
      <div className="th">{x.url?<img src={x.url} alt={x.title} loading="lazy"/>:'📝 テキスト投稿'}</div>
      <div className="cb"><h3>{x.title}</h3><div className="mt"><span>{gname(x.genre)}・{x.users?.name}</span><span>{ago(x.created_at)}</span></div>
      <div className="mt"><span>♥ {x.like_count}　💬 {x.comment_count}</span></div></div></Link>)}</div>}
  </>);
}
