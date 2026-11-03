import {METRICS,scopeFor,type Series,type Point} from './catalog.ts';
import {chinaDate,cleanDate} from './analytics.ts';

export const CORE_IDS=['close','return_1d','ema20_gap','atr_gap','new_low20_count','below_ma20_pct','new_low3_change','margin_balance','margin_net_repay','margin_pressure','margin_pressure_change','advancers_pct','up_amount_pct','etf300_share_change','etf_creation','dr007','funding_spread','credit_spread','usdcnh','pe_ttm','earnings_revision','local_iv30','iv_term','put_call','vix'];
export type Dashboard={series:Series[];index:string;generatedAt:string;sourceAudit?:{rows:{metric:string;attempt?:{status:string;message?:string;checkedAt?:string}|null}[]};collectionStatus?:unknown[];runs?:unknown[]};
export function makeFeed(data:Dashboard,now=new Date()){
 if(data.index!=='000300'||!Array.isArray(data.series))throw new Error('仅接受沪深300观察站真实dashboard数据');
 const today=chinaDate(now),valid=(p:Point)=>cleanDate(p.date)&&p.date<=today&&Number.isFinite(p.value)&&Number.isFinite(Date.parse(p.availableAt))&&Date.parse(p.availableAt)<=now.getTime();
 const points=(id:string)=>{const m=METRICS.find(m=>m.id===id);return m?(data.series.find(s=>s.metric===id&&s.scope===scopeFor(m,'000300'))?.points||[]).filter(valid).sort((a,b)=>a.date.localeCompare(b.date)):[];};
 const calendar=points('close').map(p=>p.date),marketDate=calendar.at(-1)||null;
 if(!marketDate)throw new Error('缺少有效指数日期；拒绝用空数据覆盖出口');
 const metrics=CORE_IDS.flatMap(id=>{
  const m=METRICS.find(m=>m.id===id);if(!m)return [];
  const ps=points(id).filter(p=>p.date<=marketDate),p=ps.at(-1),pos=p?calendar.indexOf(p.date):-1;
  const attempt=data.sourceAudit?.rows.find(r=>r.metric===id)?.attempt||null;
  const background=id==='vix'||id==='usdcnh';
  const status=!p?'missing':p.quality==='manual'?'manual_unverified':attempt?.status==='error'?'update_failed':background?'background_only':p.date!==marketDate?'stale':'same_date';
  const comparable=(n:number)=>pos>=n?ps.find(q=>q.date===calendar[pos-n]&&q.quality!=='manual'):undefined;
  const q=comparable(1),q5=comparable(5);
  const delta=(q:Point|undefined)=>p&&p.quality!=='manual'&&q?(id==='usdcnh'?(q.value===0?null:(p.value/q.value-1)*100):p.value-q.value):null;
  const flow5=id==='etf_creation'&&pos>=4?calendar.slice(pos-4,pos+1).map(d=>ps.find(q=>q.date===d&&q.quality!=='manual')):[];
  return [{id,name:m.name,category:m.category,scope:scopeFor(m,'000300'),value:p?.value??null,unit:m.unit,date:p?.date??null,status,aligned_with_market_date:status==='same_date',change_1:delta(q),change_1_from:q?.date??null,change_5:delta(q5),change_5_from:q5?.date??null,change_unit:id==='usdcnh'?'%':m.unit==='%'?'百分点':m.unit,flow_5_sum:flow5.length===5&&flow5.every(Boolean)?flow5.reduce((v,q)=>v+q!.value,0):null,source:p?.source??m.source,source_url:p?.sourceUrl??m.url,source_available_at:p?.availableAt??null,last_update_status:attempt?.status??null,definition:m.formula,caution:m.limitation}];
 });
 return {schema_version:'1.0',title:'A股市场证据 · 独立数据出口',origin:'https://ashare-opportunity-observatory.safefawn35.chatgpt.site/',index:'000300',timezone:'Asia/Shanghai',exported_at:now.toISOString(),source_read_at:data.generatedAt,market_date:marketDate,export_local_date:today,current_session_verified:marketDate===today,aligned_count:metrics.filter(m=>m.aligned_with_market_date).length,metric_count:metrics.length,warnings:[...(marketDate<today?[`指数最新记录为${marketDate}，早于导出北京时间日期${today}；本次导出不证明数据已更新至最新交易日，节假日需另核。`]:[]),'exported_at仅为生成时间；每个指标以date为准。缺失不是0，旧值不参与同日联合确认。','change_1/change_5仅在沪深300交易日历对应前1/5期有有效值时计算；单位见change_unit；海外/汇率仅作独立背景。','ETF五期净申购看flow_5_sum，change_5是当日流量与五期前流量之差，两者不能混淆。','ETF申赎与融资是局部代理，不能推导全A净流入、行业轮动或资金主体；超跌不等于见底。'],metrics};
}
export type Feed=ReturnType<typeof makeFeed>;
export function textFeed(f:Feed){
 const fmt=(x:number|null)=>x===null?'缺失':Number(x.toFixed(4)).toString();
 return [`# ${f.title}`,'',`数据交易日：${f.market_date}｜导出时间：${f.exported_at}｜同日有效：${f.aligned_count}/${f.metric_count}`,'',...f.warnings.map(w=>'- '+w),'','|指标|值|单位|数据日期|状态|前1期变化|前5期变化|变化单位|ETF五期累计|','|---|---:|---|---|---|---:|---:|---|---:|',...f.metrics.map(m=>`|${m.name}|${fmt(m.value)}|${m.unit}|${m.date??'缺失'}|${m.status}|${fmt(m.change_1)}|${fmt(m.change_5)}|${m.change_unit}|${fmt(m.flow_5_sum)}|`),'','状态：same_date=与指数记录同日且有效；stale=日期滞后；missing=缺失；update_failed=最近更新失败；manual_unverified=手工待核；background_only=海外/汇率背景。','前1/5期的起始日期、来源、指标定义及限制见同目录latest.json；同日有效仅相对market_date，不保证是今天。','',...f.metrics.map(m=>`- ${m.id}：${m.source}；${m.source_url}`),''].join('\n');
}
