import test from 'node:test';import assert from 'node:assert/strict';
import {makeFeed,textFeed} from '../lib/feed.ts';
import {METRICS,scopeFor,type Series} from '../lib/catalog.ts';
const now=new Date('2026-11-03T13:00:00Z');
const dates=['2026-10-26','2026-10-27','2026-10-28','2026-10-29','2026-10-30','2026-11-02','2026-11-03'];
const s=(id:string,vs:[string,number][]):Series=>({metric:id,scope:scopeFor(METRICS.find(m=>m.id===id)!,'000300'),updatedAt:now.toISOString(),points:vs.map(([date,value])=>({date,value,source:'测试来源',sourceUrl:'https://example.com',publishedAt:null,availableAt:now.toISOString(),quality:'observed'}))});
const base=()=>({index:'000300',generatedAt:now.toISOString(),series:[s('close',dates.map((d,i)=>[d,100+i]))]});
test('stale, missing and failed observations are never same-day confirmation; zero is valid',()=>{
 const d=base();d.series.push(s('advancers_pct',[[dates[4],40]]),s('funding_spread',[[dates[6],0]]),s('local_iv30',[[dates[6],25]]));
 const f=makeFeed({...d,sourceAudit:{rows:[{metric:'local_iv30',attempt:{status:'error'}}]}},now);
 assert.equal(f.metrics.find(m=>m.id==='advancers_pct')!.status,'stale');assert.equal(f.metrics.find(m=>m.id==='funding_spread')!.value,0);assert.equal(f.metrics.find(m=>m.id==='local_iv30')!.aligned_with_market_date,false);assert.equal(f.metrics.find(m=>m.id==='earnings_revision')!.value,null);
});
test('missing intermediate sessions do not turn last observation into daily change',()=>{
 const d=base();d.series.push(s('ema20_gap',[[dates[4],-3],[dates[6],-2]]));
 assert.equal(makeFeed(d,now).metrics.find(m=>m.id==='ema20_gap')!.change_1,null);
});
test('ETF five-session sum differs from change in daily flow; future availability is excluded',()=>{
 const d=base();d.series.push(s('etf_creation',dates.map((date,i)=>[date,i+1])));const f=makeFeed(d,now),m=f.metrics.find(m=>m.id==='etf_creation')!;
 assert.equal(m.flow_5_sum,25);assert.equal(m.change_5,5);
 d.series.push(s('advancers_pct',[[dates[6],90]]));d.series.at(-1)!.points[0].availableAt='2026-11-04T00:00:00Z';assert.equal(makeFeed(d,now).metrics.find(m=>m.id==='advancers_pct')!.value,null);
});
test('fresh export time never upgrades old data; no valid index fails closed',()=>{
 const d=base();d.series[0].points=d.series[0].points.slice(0,5);const f=makeFeed(d,now);
 assert.equal(f.current_session_verified,false);assert.match(textFeed(f),/早于导出/);
 assert.throws(()=>makeFeed({...d,series:[]},now),/缺少有效指数/);
});
