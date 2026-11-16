create table users(id uuid primary key default gen_random_uuid(), name text unique not null, pass_hash text not null, role text not null default 'user', created_at timestamptz default now());
create table posts(id uuid primary key default gen_random_uuid(), user_id uuid not null references users on delete cascade, genre text not null, title text not null, prompt text not null, tool text, image_path text, like_count int not null default 0, comment_count int not null default 0, hidden boolean not null default false, created_at timestamptz default now());
create table likes(post_id uuid references posts on delete cascade, user_id uuid references users on delete cascade, primary key(post_id,user_id));
create table comments(id uuid primary key default gen_random_uuid(), post_id uuid not null references posts on delete cascade, user_id uuid not null references users on delete cascade, body text not null, created_at timestamptz default now());
create table reports(id uuid primary key default gen_random_uuid(), post_id uuid not null references posts on delete cascade, user_id uuid references users on delete set null, reason text not null, created_at timestamptz default now());
create index on posts(genre, like_count desc); create index on posts(created_at desc); create index on comments(post_id);
-- RLSを全表で有効化(ポリシーなし=サーバー(service role)からのみアクセス可)
alter table users enable row level security; alter table posts enable row level security; alter table likes enable row level security; alter table comments enable row level security; alter table reports enable row level security;
-- 画像は非公開バケット(署名付きURLで配信。アダルトは年齢確認後のみ)
insert into storage.buckets(id,name,public) values('images','images',false) on conflict do nothing;
