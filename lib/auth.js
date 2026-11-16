import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { hash, verify } from '@node-rs/argon2';
const key=()=>new TextEncoder().encode(process.env.AUTH_SECRET);
export async function setSession(u){
  const t=await new SignJWT({uid:u.id,name:u.name,role:u.role}).setProtectedHeader({alg:'HS256'}).setExpirationTime('30d').sign(key());
  cookies().set('s',t,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:2592000});
}
export async function getUser(){const c=cookies().get('s');if(!c)return null;try{return (await jwtVerify(c.value,key())).payload}catch{return null}}
export const hashPw=p=>hash(p);
export const verifyPw=(h,p)=>verify(h,p);
export const ageOk=()=>cookies().get('age')?.value==='1';
