import Link from 'next/link';
import { login } from '@/actions';
export default function Login({searchParams:sp}){
  return(<div className="narrow"><h1>ログイン</h1>{sp.e&&<div className="er">{sp.e}</div>}
    <form action={login} className="box"><label>名前</label><input name="name" required/><label>パスワード</label><input type="password" name="password" required/><button className="btn">ログイン</button></form>
    <p className="mu">はじめての方は <Link href="/register" style={{color:'var(--ac2)'}}>新規登録</Link></p></div>);
}
