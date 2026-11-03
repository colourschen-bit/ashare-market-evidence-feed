import type {EtfDay} from "./etf-data";
export type CategoryId="stress"|"pressure"|"buyers"|"funding"|"value"|"volatility";
export type Metric={id:string;name:string;short:string;category:CategoryId;unit:string;digits:number;scope:string;formula:string;meaning:string;limitation:string;source:string;url:string;automatic:boolean;};
export const CATEGORIES=[
{id:"stress",title:"下跌强度与覆盖范围",short:"下跌与广度",tag:"PRICE & BREADTH",description:"看下跌有多深，也看它扩散到了哪里。",color:"#547c72"},
{id:"pressure",title:"抛售压力变化",short:"抛售压力",tag:"SELLING PRESSURE",description:"观察去杠杆与新低扩散是否开始减速。",color:"#ba885b"},
{id:"buyers",title:"新增买盘与上涨广度",short:"买盘与上涨",tag:"DEMAND & PARTICIPATION",description:"辨别反弹有没有更广泛的承接。",color:"#7b8f58"},
{id:"funding",title:"资金与融资环境",short:"资金环境",tag:"LIQUIDITY CONDITIONS",description:"跟踪资金价格、信用与汇率约束。",color:"#6a8aab"},
{id:"value",title:"估值与盈利变化",short:"估值与盈利",tag:"VALUATION & EARNINGS",description:"判断下跌是否带来了足够的价值补偿。",color:"#9d7e9a"},
{id:"volatility",title:"波动与保护需求",short:"波动与保护",tag:"VOLATILITY & HEDGING",description:"观察保护需求与不确定性的变化。",color:"#638b8d"}
] as const;
export const MARKETS=[
{code:"000300",name:"沪深300",symbol:"sh000300"},
{code:"000001",name:"上证指数",symbol:"sh000001"},
{code:"000905",name:"中证500",symbol:"sh000905"},
{code:"399006",name:"创业板指",symbol:"sz399006"},
{code:"399001",name:"深证成指",symbol:"sz399001"},
];
function m(id:string,name:string,short:string,category:CategoryId,unit:string,digits:number,scope:string,formula:string,meaning:string,limitation:string,source:string,url:string,automatic=true):Metric{return{id,name,short,category,unit,digits,scope,formula,meaning,limitation,source,url,automatic};}
const sina="https://finance.sina.com.cn/realstock/";
const sse="https://www.sse.com.cn/market/othersdata/margin/sum/";
const legu="https://www.legulegu.com/stockdata/high-low-statistics";
export const METRICS:Metric[]=[
m("close","指数收盘","指数收盘","stress","点",2,"index","当日收盘价","价格参考，不作为单独加仓信号。","非实时行情；交易日结束后更新。","新浪财经",sina),
m("return_1d","单日涨跌幅","单日涨跌","stress","%",2,"index","(收盘/前日收盘−1)×100","急跌候选：单日跌幅超过3.5%。","研究阈值，未验证其独立预测能力。","新浪日线·计算",sina),
m("shock_z20","波动调整后跌幅","冲击强度","stress","σ",2,"index","日收益/此前20个交易日日收益标准差","按近期正常波动衡量当日冲击。","分母排除当日；不等同正态分布下的精确概率。","新浪日线·计算",sina),
m("ema20_gap","20EMA乖离率","均线乖离","stress","%",2,"index","(收盘/20日指数移动均线−1)×100","识别持续阴跌偏离。","价格衍生信号与RSI存在信息重叠。","新浪日线·计算",sina),
m("atr_gap","ATR标准化偏离","ATR偏离","stress","倍",2,"index","ln(收盘/EMA20)/(前日ATR20/前日收盘)","让不同波动水平的指数更可比。","ATR20采用20日真实振幅简单均值。","新浪日线·计算",sina),
m("new_low20_count","沪深A股20日收盘新低家数","收盘新低家数","stress","家",0,"hs-a-qfq20","当日前复权收盘严格低于此前19个交易日的最低收盘价的股票数","跟踪收盘下跌在股票间的扩散。","仅沪深A股连续20日有成交样本；不含北交所。短期回补使用当前股票池，存在存续样本偏差，不与其他来源直接拼接。","腾讯日线·自行统计","https://gu.qq.com/"),
m("below_ma20_pct","沪深A股低于20日均线比例","均线下方比例","stress","%",2,"hs-a-qfq20","收盘低于当日20日简单均线(SMA20)的股票数 / 有效样本数 ×100%","比例下降表示更多股票回到20日均线上方或相等位置；与新低家数配合观察修复广度。","与新低统计共用沪深A股、前复权、连续20个交易日有成交样本；均线含当日，等于均线不计低于。样本变化也影响比例；短期回补存在存续样本偏差。","腾讯前复权日线·自行统计","https://gu.qq.com/"),
m("new_low3_change","新低家数3日变化","新低扩散变化","pressure","家",1,"hs-a-qfq20","最近3日收盘新低家数均值−此前3日均值","负值表示新低扩散相对减缓。","需6个连续交易日；样本数变化也会影响家数，不自动等于卖压出清。","腾讯日线·自行计算","https://gu.qq.com/"),
m("margin_balance","融资余额","融资余额","pressure","亿元",2,"market","东方财富全市场融资账户统计口径余额","公开场内融资规模。","不包括所有场外杠杆和基金赎回。","东方财富·两融","https://data.eastmoney.com/rzrq/"),
m("margin_net_repay","沪市融资净偿还额","沪市净偿还","pressure","亿元",2,"market","上交所融资偿还额−融资买入额","正值表示融资净偿还，负值表示净增加。","含口径调整；并非直接观测的强平金额。","上交所·沪市两融计算",sse),
m("margin_pressure","沪市融资净偿还强度","沪市偿还强度","pressure","%",3,"market","(偿还额−买入额)/前日沪市融资余额×100","标准化的场内去杠杆压力代理。","单日变化不能确认所有卖压消失。","上交所·沪市两融计算",sse),
m("margin_pressure_change","沪市融资压力3日变化","沪市压力变化","pressure","百分点",3,"market","最近3日偿还强度均值−此前3日均值","负值提示可见融资压力减轻。","反映融资余额的变化，不直接识别卖方动机。","上交所·沪市两融计算",sse),
m("advancers_pct","上涨股票比例","上涨家数占比","buyers","%",2,"a-share","上涨股票数/当日有效全A报价股票数×100","观察反弹参与度。","包含平盘作为分母；停牌与无效报价排除。","新浪全A行情·计算",sina),
m("up_amount_pct","上涨股票成交额占比","上涨成交额","buyers","%",2,"a-share","上涨股票成交额/全样本成交额×100","衡量交易是否向上涨股票扩散。","是成交额广度，不代表主动买入或资金净流入。","新浪全A行情·计算",sina),
m("etf300_shares","华泰柏瑞300ETF份额","300ETF份额","buyers","亿份",3,"market","上交所公布的510300份额/1亿","观察一只固定宽基ETF的存续份额。","仅510300；份额增长不等于全市场新增现金。","上海证券交易所","https://www.sse.com.cn/assortment/fund/etf/list/scale/"),
m("etf300_share_change","300ETF每日份额变化","300ETF份额变化","buyers","亿份",3,"market","当日510300份额−上一交易日份额","固定产品的净申赎数量观察。","未乘净值；份额拆分等变更需要人工核查。","上交所·计算","https://www.sse.com.cn/assortment/fund/etf/list/scale/"),
m("etf_creation","固定4只宽基ETF净申购估算","ETF净申购","buyers","亿元",2,"market","Σ(当日份额−前一交易日份额)×同日单位净值/1亿","跟踪510300、510500、588000、159915四只代表性宽基ETF的申赎活动。","篮子broad4-v1固定；必须4/4资料齐全才汇总。5期累计需5个连续交易日。疑似份额变更待核验因子；未识别的小额变更仍需人工核查。实物申赎不等于新增现金；净值披露晚于收盘，历史回测须滞后使用。","沪深交易所份额 / 东方财富净值","https://www.sse.com.cn/market/funddata/volumn/etfvolumn/"),
m("fdr007","银银间7天回购定盘利率","FDR007","funding","%",4,"market","中国货币网11:30定盘的银银间7天回购利率","有明确定义的银行间资金价格参照。","这是FDR007，不是全日加权DR007；不用于替代DR007计算资金利差。","中国货币网","https://www.chinamoney.com.cn/chinese/bkfrr/"),
m("dr007","银银间7天回购利率","DR007","funding","%",4,"market","存款类机构7天质押式回购加权利率","观察银行间资金价格。","DR007与FDR007不同，不互相替代。","中国货币网","https://www.chinamoney.com.cn/"),
m("policy_7d","7天逆回购政策利率","政策利率","funding","%",2,"market","最近可核验实际7天逆回购操作公布利率","为资金价格提供政策参照。","记录实际公布该利率的操作日，不等于首次降息生效日；零操作日仅在核验公告后沿用，不当作零利率。","中国人民银行","https://www.pbc.gov.cn/"),
m("funding_spread","DR007相对政策利率","资金利差","funding","bp",2,"market","(DR007−当时有效政策利率)×100","利差扩大可能提示资金偏紧。","季末、假期与缴税影响明显。","中国货币网/人民银行·计算","https://www.chinamoney.com.cn/"),
m("credit_spread","信用利差","信用利差","funding","bp",2,"market","固定评级、固定期限信用债收益率−同期限国债收益率","观察信用融资压力。","记录口径必须固定，例如AAA 3年；不同口径不能混合。","中债估值","https://yield.chinabond.com.cn/"),
m("usdcnh","美元兑离岸人民币","USD/CNH","funding","CNH/美元",4,"market","1美元兑换的离岸人民币数；采用新浪USD/CNH供应商日线收盘","数值上升表示人民币走弱；辅助观察汇率压力。单日、5期变化按百分比收益计算。","非在岸CNY、非央行中间价、非A股15:00截面。源未逐条给出精确收盘时点；保守接收界限为次日北京时间08:00，不等同发布时间。回测需滞后使用。","新浪财经·离岸人民币","https://finance.sina.com.cn/money/forex/hq/USDCNH.shtml"),
m("pe_ttm","沪深300滚动市盈率","滚动PE","value","倍",2,"000300","中证指数官方滚动市盈率","与同口径历史对照估值。","短期分位不是长期估值分位；盈利口径会变化。","中证指数","https://www.csindex.com.cn/#/indices/family/detail?indexCode=000300"),
m("pb","沪深300市净率","市净率","value","倍",2,"000300","中证指数每日板块信息中的沪深300当日PB（倍）；不使用去年底PB字段","辅助观察资产估值；与抛压缓和、买盘扩散共同判断。","官方日频快照逐日积累；不足61期不显示分位，近252期分位不等于长期估值分位。低PB需结合ROE和资产质量。","中证指数·每日板块信息","https://www.csindex.com.cn/#/dataService/indexDashboard"),
m("earnings_yield","沪深300盈利收益率","盈利收益率","value","%",2,"000300","100/滚动PE","估值代理，较高可能意味着价格补偿增加。","使用历史利润，不能代替未来现金流估值。","中证指数·计算","https://www.csindex.com.cn/"),
m("earnings_revision","盈利上修净比例（预测EPS代理）","盈利修正","value","百分点",2,"market","对比20个交易日前真实采集快照中的同一预测年度EPS；(上修公司−下修公司)/有效可比公司×100；EPS按3位小数比较","观察公开覆盖公司的盈利预期变化；不是盈利同比增速或评级上调比例。","次年预测、研报数≥3的沪深公司；剔除研报数及实际EPS基准变化。仍不能完全隔离机构替换或股本影响。需真实历史快照；不足时留空，不能用当下数据回填。","东方财富预测快照·计算","https://data.eastmoney.com/report/profitforecast.html"),
m("local_iv30","沪深300ETF 30日平值IV估算","本地IV30","volatility","%",2,"options300","510300标准期权14:55—15:00买卖中间价；Black76反解虚值IV，按对数行权价插值平值方差，再用夹住30自然日的期限插值总方差；ACT/365年化","观察本地平值波动预期及其变化；不是涨跌预测。","自算平值IV，非官方波动率指数，不与VIX直接比数值。FDR007为折现代理；异常报价剔除，不外推、不填缺失交易日；历史不足61期不显示分位。","上交所合约 / 新浪报价·计算","https://www.sse.com.cn/assortment/options/risk/"),
m("iv_term","本地IV30 / IV90估算","波动期限结构","volatility","倍",3,"options300","同日510300平值IV30/固定90自然日平值IV；沿用相同报价筛选、Black76与总方差插值","比较短端与较长期年化波动预期；需分别查看分子和分母变化。","自算指标，非官方指数。相邻季月宽跨度结果标为观察估算；超98天、其他宽跨度或报价不足留空。FDR007仅为折现代理；不直接指示涨跌或见底。","上交所合约 / 新浪报价·计算","https://www.sse.com.cn/assortment/options/risk/"),
m("put_call","沪深300ETF认沽认购成交比","认沽 / 认购","volatility","倍",3,"options300","510300期权认沽成交量/认购成交量","观察期权交易结构。","成交量比不是投资者净看空程度，亦不区分买卖方。","上海证券交易所","https://www.sse.com.cn/assortment/options/date/"),
m("vix","美国VIX收盘","美国VIX","volatility","",2,"us","CBOE公布的VIX收盘","全球风险情绪背景。","美国市场指标；日期与A股分开显示，不作为本地底部信号。","CBOE","https://www.cboe.com/tradable-products/vix/vix-historical-data/"),
];
export type Point={date:string;value:number;source:string;sourceUrl:string;publishedAt:string|null;availableAt:string;quality:"observed"|"derived"|"manual";note?:string;etfBasket?:EtfDay;};
export type Series={metric:string;scope:string;points:Point[];updatedAt:string;};
export function scopeFor(metric:Metric,index:string){return metric.scope==="index"?index:metric.scope;}
export function formatValue(value:number|null|undefined,m:Metric){return value==null||!Number.isFinite(value)?"—":value.toLocaleString("zh-CN",{minimumFractionDigits:m.digits,maximumFractionDigits:m.digits});}
export function marketName(scope:string){return MARKETS.find(x=>x.code===scope)?.name||({"hs-a-qfq20":"沪深A股·前复权收盘口径",market:"中国市场","a-share":"全A有效报价","legu":"乐咕全市场口径",us:"美国市场",options300:"沪深300ETF期权"}[scope]||scope);}
