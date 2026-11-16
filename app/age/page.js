import Link from 'next/link';
import { confirmAge } from '@/actions';
export default function Age({searchParams:sp}){
  return(<div className="narrow box" style={{textAlign:'center'}}><h1>年齢確認</h1>
    <p>このページには成人向けの内容が含まれます。<br/>あなたは18歳以上ですか?</p>
    <form action={confirmAge.bind(null,sp.next||'/')}><button className="btn">はい、18歳以上です</button></form>
    <p><Link href="/" className="mu">いいえ(トップへ戻る)</Link></p></div>);
}
