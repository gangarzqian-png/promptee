# プロンプティー
画像とプロンプトを投稿し、いいねでランキング、コメントもできる掲示板(Next.js 14 + Supabase)。

## セットアップ
1. Supabaseでプロジェクト作成 → SQL Editorで `supabase/migrations/001_init.sql` を実行(テーブル・RLS・非公開バケット`images`が作られます)
2. `.env.example` を `.env.local` にコピーして3つ設定(`AUTH_SECRET`は `openssl rand -base64 32` など)
3. `npm install && npm run dev`
4. サイトで新規登録 → SQL Editorで `update users set role='admin' where name='あなたの名前';` を実行(管理画面 `/admin` が使えます)

## 公開
GitHubにpushしてVercelでインポート、環境変数3つを設定するだけです。

## 仕様
- ジャンル: 風景画像 / 画像加工 / ペット画像 / チラシ画像 / マニュアル作成 / テクニック / アダルト(`lib/genres.js`で変更可)
- ランキング: いいね数順(週間・月間・全期間)。1〜3位にバッジ
- アダルト: 年齢確認(Cookie)を通すまで一覧・詳細・画像URLを出しません。「すべて」には混ざりません
- 画像は非公開バケット+署名付きURL(1時間)で配信。投稿の通報→管理画面で非表示
- パスワードはArgon2id。ログイン連続失敗は簡易制限(メモリ内)
