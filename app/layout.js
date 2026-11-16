import './globals.css';
import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { logout } from '@/actions';
export const metadata={title:'プロンプティー',description:'画像とプロンプトを共有して、ランキングで競う掲示板'};
export default async function RootLayout({children}){
  const u=await getUser();
  return(<html lang="ja"><body>
    <header className="hd"><Link href="/" className="logo">プロンプ<b>ティー</b></Link>
      <nav>{u?<><Link href="/new" className="btn">＋ 投稿</Link>{u.role==='admin'&&<Link href="/admin">管理</Link>}<span className="mu">{u.name}</span><form action={logout}><button className="lnk">ログアウト</button></form></>
      :<><Link href="/login">ログイン</Link><Link href="/register" className="btn">新規登録</Link></>}</nav></header>
    <main>{children}</main><footer>© プロンプティー ／ 18歳未満の方はアダルトジャンルを利用できません</footer>
  </body></html>);
}
