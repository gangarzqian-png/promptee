import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { ago } from '@/lib/genres';
import { hidePost } from '@/actions';
export const dynamic='force-dynamic';
export default async function Admin(){
  const u=await getUser();if(u?.role!=='admin')redirect('/');
  const {data}=await db.from('reports').select('id,reason,created_at,posts(id,title,hidden)').order('created_at',{ascending:false}).limit(50);
  return(<><h1>通報一覧</h1>{!data?.length&&<p className="mu">通報はありません。</p>}
    {(data||[]).map(r=><div className="box" key={r.id}><Link href={`/post/${r.posts?.id}`} style={{color:'var(--ac2)'}}>{r.posts?.title}</Link>
      <p className="mu">理由: {r.reason}（{ago(r.created_at)}）</p>
      {r.posts&&<form action={hidePost.bind(null,r.posts.id)}><button className="btn">この投稿を非表示にする</button></form>}</div>)}</>);
}
