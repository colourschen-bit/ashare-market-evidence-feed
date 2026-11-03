import {cleanDate} from "./analytics.ts";
export const ETF_VERSION="broad4-v1";
export const ETF_BASKET=[
 {code:"510300",name:"华泰柏瑞沪深300ETF",benchmark:"沪深300",exchange:"SH"},
 {code:"510500",name:"南方中证500ETF",benchmark:"中证500",exchange:"SH"},
 {code:"588000",name:"华夏科创50ETF",benchmark:"科创50",exchange:"SH"},
 {code:"159915",name:"易方达创业板ETF",benchmark:"创业板指",exchange:"SZ"},
] as const;
export type EtfInput={date:string;shares?:number;nav?:number;event?:string;sharesUrl?:string;navUrl?:string;observedAt:string};
export type EtfComponent={code:string;name:string;benchmark:string;date:string;previousDate:string;shares:number|null;previousShares:number|null;nav:number|null;navDate:string|null;deltaShares:number|null;value:number|null;fiveValue?:number|null;status:string;sharesUrl?:string;previousSharesUrl?:string;navUrl?:string;observedAt?:string;adjustmentUrl?:string;};
export type EtfDay={date:string;version:string;covered:number;expected:number;value:number|null;fiveTotal?:number|null;fiveStart?:string|null;components:EtfComponent[]};
export type EtfAdjustment={factor:number;sourceUrl:string};
function num(v:any){return v===null||v===undefined||String(v).trim()===""?NaN:Number(String(v).replaceAll(",",""));}
export function sseBasketShares(raw:any,date:string){
 if(!Array.isArray(raw?.result))throw new Error("上交所份额结构变化");
 return ETF_BASKET.filter(f=>f.exchange==="SH").map(f=>{
  const rows=raw.result.filter((r:any)=>String(r.SEC_CODE).trim()===f.code&&r.STAT_DATE===date);
  if(rows.length!==1||!Number.isFinite(num(rows[0].TOT_VOL))||num(rows[0].TOT_VOL)<=0)throw new Error(f.code+"份额缺失或日期不符："+date);
  return{code:f.code,date,shares:Math.round(num(rows[0].TOT_VOL)*10000)};
 });
}
export function szseBasketShares(raw:any){
 const t=raw?.[0];if(!Array.isArray(t?.data)||!String(t?.metadata?.cols?.current_size).includes("万份"))throw new Error("深交所历史规模单位或结构变化");
 return t.data.map((r:any)=>{
  const date=String(r.size_date),code=String(r.fund_code).trim(),shares=Math.round(num(r.current_size)*10000);
  if(code!=="159915"||!cleanDate(date)||!Number.isFinite(shares)||shares<=0)throw new Error("深交所历史份额字段无效");
  return{code,date,shares};
 });
}
export function etfNavRows(raw:any){
 if(raw?.ErrCode!==0||!Array.isArray(raw?.Data?.LSJZList))throw new Error("历史单位净值结构变化");
 return raw.Data.LSJZList.map((r:any)=>{
  const date=String(r.FSRQ),nav=num(r.DWJZ);
  if(!cleanDate(date)||!Number.isFinite(nav)||nav<=0)throw new Error("单位净值日期或数值无效");
  const event=[r.FHFCZ,r.FHFCZ10,r.FHSP].filter(Boolean).join("；");
  return{date,nav,event:/拆分|合并|折算|份额变更/.test(event)?event:""};
 });
}
export function basketDays(calendar:string[],inputs:Record<string,EtfInput[]>,adjustments:Record<string,Record<string,EtfAdjustment>>={}){
 const maps=Object.fromEntries(ETF_BASKET.map(f=>[f.code,new Map((inputs[f.code]||[]).map(r=>[r.date,r]))]));
 return calendar.slice(1).map((date,i):EtfDay=>{
  const previousDate=calendar[i];
  const components:EtfComponent[]=ETF_BASKET.map(f=>{
   const a=maps[f.code].get(previousDate),b=maps[f.code].get(date),adj=adjustments[f.code]?.[date];
   const c:EtfComponent={...f,date,previousDate,shares:b?.shares??null,previousShares:a?.shares??null,nav:b?.nav??null,navDate:b?.nav?date:null,deltaShares:null,value:null,status:"资料不足",sharesUrl:b?.sharesUrl,previousSharesUrl:a?.sharesUrl,navUrl:b?.navUrl,observedAt:b?.observedAt,adjustmentUrl:adj?.sourceUrl};
   if(!a?.shares||!b?.shares||!a?.nav||!b?.nav){c.status="缺少相邻交易日份额或单位净值";return c;}
   if(adj&&(!Number.isFinite(adj.factor)||adj.factor<=0||!adj.sourceUrl.startsWith("https://"))){c.status="份额调整因子无效";return c;}
   const navRatio=b.nav/a.nav,shareRatio=b.shares/a.shares;
   if(!adj&&(b.event||Math.abs(navRatio-1)>.35||(Math.abs(shareRatio-1)>.5&&Math.abs(shareRatio*navRatio-1)<.03))){c.status="疑似份额变更，待核验调整因子";return c;}
   c.deltaShares=b.shares-a.shares*(adj?.factor||1);c.value=c.deltaShares*b.nav/1e8;c.status=adj?"已按有来源的份额因子调整":"已核验同日数据";return c;
  });
  const covered=components.filter(c=>c.value!==null).length;
  return{date,version:ETF_VERSION,covered,expected:ETF_BASKET.length,value:covered===ETF_BASKET.length?components.reduce((s,c)=>s+c.value!,0):null,components};
 });
}
export function rollingEtfFive(days:EtfDay[],calendar:string[]){
 const map=new Map(days.map(d=>[d.date,d]));
 return days.map(d=>{
  const i=calendar.indexOf(d.date),window=i>=4?calendar.slice(i-4,i+1).map(date=>map.get(date)):[];
  const complete=window.length===5&&window.every(x=>x&&x.value!==null&&x.version===d.version&&x.covered===x.expected);
  return{...d,fiveTotal:complete?window.reduce((s,x)=>s+x!.value!,0):null,fiveStart:complete?window[0]!.date:null,components:d.components.map(c=>({...c,fiveValue:complete?window.reduce((s,x)=>s+x!.components.find(k=>k.code===c.code)!.value!,0):null}))};
 });
}
