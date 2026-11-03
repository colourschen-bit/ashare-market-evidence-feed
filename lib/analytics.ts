export type Bar={date:string;open:number;high:number;low:number;close:number;volume?:number;};
export function mean(a:number[]){return a.reduce((x,y)=>x+y,0)/a.length;}
export function sampleStd(a:number[]){const m=mean(a);return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/(a.length-1));}
export function indexMetrics(bars:Bar[]){
 const sorted=[...bars].sort((a,b)=>a.date.localeCompare(b.date));
 let ema=sorted[0]?.close||0;const returns:number[]=[],trs:number[]=[];
 return sorted.map((b,i)=>{
  ema=i?b.close*(2/21)+ema*(19/21):b.close;
  const previous=sorted[i-1],r=previous?b.close/previous.close-1:null;
  const tr=previous?Math.max(b.high-b.low,Math.abs(b.high-previous.close),Math.abs(b.low-previous.close)):b.high-b.low;
  const priorVol=returns.length>=20?sampleStd(returns.slice(-20)):null;
  const priorAtr=trs.length>=20?mean(trs.slice(-20)):null;
  const output:Record<string,number>={close:b.close};
  if(r!==null)output.return_1d=r*100;
  if(i>=19)output.ema20_gap=(b.close/ema-1)*100;
  if(r!==null&&priorVol&&priorVol>0)output.shock_z20=r/priorVol;
  if(i>=20&&previous&&priorAtr&&priorAtr>0)output.atr_gap=Math.log(b.close/ema)/(priorAtr/previous.close);
  if(r!==null)returns.push(r);trs.push(tr);
  return{date:b.date,values:output};
 });
}
export function trailingChange(values:{date:string;value:number}[],n=3){
 return values.flatMap((p,i)=>i<2*n-1?[]:[{date:p.date,value:mean(values.slice(i-n+1,i+1).map(x=>x.value))-mean(values.slice(i-2*n+1,i-n+1).map(x=>x.value))}]);
}
export function priorPercentile(points:{value:number;date:string}[],date?:string){
 const visible=points.filter(p=>!date||p.date<=date);if(visible.length<61)return null;
 const v=visible[visible.length-1].value,prior=visible.slice(0,-1).slice(-252);
 return prior.filter(p=>p.value<=v).length/prior.length*100;
}
export function cleanDate(s:string){return /^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s+"T00:00:00Z").toISOString().slice(0,10)===s;}
export function chinaDate(now=new Date()){return new Date(now.getTime()+8*3600000).toISOString().slice(0,10);}
export function completedBars(bars:Bar[],now=new Date()){
 const bj=new Date(now.getTime()+8*3600000),today=bj.toISOString().slice(0,10);
 return bars.filter(b=>cleanDate(b.date)&&b.date<=today&&(b.date<today||bj.getUTCHours()>=16)&&[b.open,b.close,b.high,b.low].every(v=>Number.isFinite(v)&&v>0)&&b.high>=b.low);
}
export function metricDelta(points:{value:number;date:string}[],days=1){return points.length>days?points.at(-1)!.value-points.at(-1-days)!.value:null;}
