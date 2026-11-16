import Link from 'next/link';
import { register } from '@/actions';
export default function Register({searchParams:sp}){
  return(<div className="narrow"><h1>新規登録</h1>{sp.e&&<div className="er">{sp.e}</div>}
    <form action={register} className="box"><label>表示名(2〜20文字)</label><input name="name" minLength={2} maxLength={20} required/><label>パスワード(8文字以上)</label><input type="password" name="password" minLength={8} required/><button className="btn">登録する</button></form>
    <p className="mu">登録済みの方は <Link href="/login" style={{color:'var(--ac2)'}}>ログイン</Link></p></div>);
}
