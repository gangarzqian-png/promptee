import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { db, withUrls } from '@/lib/db';
import { getUser, ageOk } from '@/lib/auth';
import { gname, ago } from '@/lib/genres';
import { toggleLike, addComment, report } from '@/actions';
import CopyButton from '@/components/CopyButton';
export const dynamic='force-dynamic';
export default async function Post({params,searchParams:sp}){
  const {data:p}=await db.from('posts').select('*,users(name)').eq('id',params.id).eq('hidden',false).maybeSingle();
  if(!p)notFound();
  const ok=ageOk();
  if(p.genre==='adult'&&!ok)redirect('/age?next='+encodeURIComponent('/post/'+p.id));
  const [{url}]=await withUrls([p],ok);
  const u=await getUser();
  const {data:cs}=await db.from('comments').select('id,body,created_at,users(name,role)').eq('post_id',p.id).order('created_at');
  const liked=u?!!(await db.from('likes').select('post_id').eq('post_id',p.id).eq('user_id',u.uid).maybeSingle()).data:false;
  return(<>
    <p><Link href={`/?g=${p.genre}`} className="mu">← {gname(p.genre)}</Link></p>
    {url&&<img className="big" src={url} alt={p.title}/>}
    <div className="box"><h1 style={{marginTop:0}}>{p.title}</h1>
      <p className="mu">{gname(p.genre)} ／ {p.users?.name} ／ {ago(p.created_at)}{p.tool?` ／ 使用AI: ${p.tool}`:''}</p>
      <h3>プロンプト</h3><div className="pr">{p.prompt}</div><CopyButton text={p.prompt}/>
      <form action={toggleLike.bind(null,p.id)} style={{marginTop:14}}><button className={'like'+(liked?' on':'')}>♥ {p.like_count}</button>{!u&&<span className="mu"> ※いいねにはログインが必要です</span>}</form></div>
    <div className="box"><h3 style={{marginTop:0}}>コメント ({cs?.length||0})</h3>
      {u?<form action={addComment.bind(null,p.id)}><textarea name="body" maxLength={500} placeholder="コメントを書く(500文字まで)" required/><button className="btn">投稿する</button></form>
        :<p><Link href="/login" className="btn">ログインしてコメントする</Link></p>}
      {(cs||[]).map(c=><div className="cm" key={c.id}><b>{c.users?.name}</b>{c.users?.role==='admin'&&' 🛡運営'} <small>{ago(c.created_at)}</small><div style={{whiteSpace:'pre-wrap'}}>{c.body}</div></div>)}</div>
    {sp.r&&<p className="ok">通報を受け付けました。ご協力ありがとうございます。</p>}
    {u&&<details><summary className="mu">この投稿を通報</summary><form action={report.bind(null,p.id)} style={{marginTop:8}}><input name="reason" maxLength={200} placeholder="理由(未成年的な表現・実在人物・無断転載・権利侵害など)" required/><button className="btn">通報する</button></form></details>}
  </>);
}
