import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { GENRES } from '@/lib/genres';
import { createPost } from '@/actions';
export default async function New({searchParams:sp}){
  if(!await getUser())redirect('/login');
  return(<div className="narrow" style={{maxWidth:640}}><h1>投稿する</h1>{sp.e&&<div className="er">{sp.e}</div>}
    <form action={createPost} className="box">
      <label>ジャンル</label><select name="genre">{GENRES.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select>
      <label>タイトル(80文字まで)</label><input name="title" maxLength={80} required/>
      <label>使用したAI(例: Midjourney / Stable Diffusion)</label><input name="tool" maxLength={40}/>
      <label>プロンプト</label><textarea name="prompt" maxLength={4000} required/>
      <label>画像(JPEG/PNG/WebP・4MBまで。マニュアル作成・テクニックは省略可)</label><input type="file" name="image" accept="image/jpeg,image/png,image/webp"/>
      <div className="mu" style={{fontSize:13,marginBottom:12}}>【投稿ルール】他人の著作物の無断転載、実在の人物、18歳未満に見える表現は禁止です。性的な内容は必ず「アダルト」ジャンルに投稿してください。違反投稿は非表示にします。</div>
      <label><input type="checkbox" name="agree"/>ルールに同意します</label><br/><br/><button className="btn">投稿する</button>
    </form></div>);
}
