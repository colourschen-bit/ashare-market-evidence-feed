# A股市场证据 · 独立数据出口

数据交易日：2026-11-12｜导出时间：2026-11-12T11:14:38.632Z｜同日有效：11/25

- exported_at仅为生成时间；每个指标以date为准。缺失不是0，旧值不参与同日联合确认。
- change_1/change_5仅在沪深300交易日历对应前1/5期有有效值时计算；单位见change_unit；海外/汇率仅作独立背景。
- ETF五期净申购看flow_5_sum，change_5是当日流量与五期前流量之差，两者不能混淆。
- ETF申赎与融资是局部代理，不能推导全A净流入、行业轮动或资金主体；超跌不等于见底。

|指标|值|单位|数据日期|状态|前1期变化|前5期变化|变化单位|ETF五期累计|
|---|---:|---|---|---|---:|---:|---|---:|
|指数收盘|4043.925|点|2026-11-12|same_date|-31.784|-69.486|点|缺失|
|单日涨跌幅|-0.7798|%|2026-11-12|same_date|-1.1887|-1.0743|百分点|缺失|
|20EMA乖离率|-1.5577|%|2026-11-12|same_date|-0.6113|-0.9037|百分点|缺失|
|ATR标准化偏离|-0.9207|倍|2026-11-12|same_date|-0.3724|-0.5636|倍|缺失|
|沪深A股20日收盘新低家数|183|家|2026-11-12|same_date|132|147|家|缺失|
|沪深A股低于20日均线比例|56.8212|%|2026-11-12|same_date|14.9044|-0.8777|百分点|缺失|
|新低家数3日变化|-9.6667|家|2026-11-12|same_date|-3.6667|1596.6667|家|缺失|
|融资余额|22731.2824|亿元|2026-11-11|stale|74.7432|13.1702|亿元|缺失|
|沪市融资净偿还额|-27.895|亿元|2026-11-10|update_failed|-0.2076|-184.1408|亿元|缺失|
|沪市融资净偿还强度|-0.2368|%|2026-11-10|update_failed|0.0001|-1.5473|百分点|缺失|
|沪市融资压力3日变化|-0.1388|百分点|2026-11-10|update_failed|0.2867|-0.8417|百分点|缺失|
|上涨股票比例|15.7035|%|2026-11-12|same_date|缺失|-71.6933|百分点|缺失|
|上涨股票成交额占比|28.8442|%|2026-11-12|same_date|缺失|-45.3893|百分点|缺失|
|300ETF每日份额变化|-3.258|亿份|2026-11-10|update_failed|-3.537|-35.118|亿份|缺失|
|固定4只宽基ETF净申购估算|-32.6217|亿元|2026-11-10|update_failed|-37.248|-421.8075|亿元|232.0018|
|银银间7天回购利率|1.396|%|2026-11-12|same_date|0.0042|0.0781|百分点|缺失|
|DR007相对政策利率|-5|bp|2026-10-27|stale|-2.66|缺失|bp|缺失|
|信用利差|38.73|bp|2026-11-12|same_date|2.29|3.44|bp|缺失|
|美元兑离岸人民币|6.6737|CNH/美元|2026-11-11|background_only|-0.0389|-0.015|%|缺失|
|沪深300滚动市盈率|13.14|倍|2026-11-11|stale|0.01|-0.15|倍|缺失|
|盈利上修净比例（预测EPS代理）|缺失|百分点|缺失|missing|缺失|缺失|百分点|缺失|
|沪深300ETF 30日平值IV估算|21.0104|%|2026-11-03|update_failed|缺失|缺失|百分点|缺失|
|本地IV30 / IV90估算|1.023|倍|2026-11-03|stale|缺失|缺失|倍|缺失|
|沪深300ETF认沽认购成交比|0.4869|倍|2026-11-10|update_failed|-0.0636|-0.3368|倍|缺失|
|美国VIX收盘|17.49||2026-11-11|background_only|-1.97|0.88||缺失|

状态：same_date=与指数记录同日且有效；stale=日期滞后；missing=缺失；update_failed=最近更新失败；manual_unverified=手工待核；background_only=海外/汇率背景。
前1/5期的起始日期、来源、指标定义及限制见同目录latest.json；同日有效仅相对market_date，不保证是今天。

- close：新浪财经日线；https://quotes.sina.cn/cn/api/json_v2.php/CN_MarketDataService.getKLineData?symbol=sh000300&scale=240&ma=no&datalen=800
- return_1d：新浪财经日线；https://quotes.sina.cn/cn/api/json_v2.php/CN_MarketDataService.getKLineData?symbol=sh000300&scale=240&ma=no&datalen=800
- ema20_gap：新浪财经日线；https://quotes.sina.cn/cn/api/json_v2.php/CN_MarketDataService.getKLineData?symbol=sh000300&scale=240&ma=no&datalen=800
- atr_gap：新浪财经日线；https://quotes.sina.cn/cn/api/json_v2.php/CN_MarketDataService.getKLineData?symbol=sh000300&scale=240&ma=no&datalen=800
- new_low20_count：腾讯前复权日线·自行统计；https://gu.qq.com/
- below_ma20_pct：腾讯前复权日线·SMA20广度；https://gu.qq.com/
- new_low3_change：腾讯日线·新低扩散变化；https://gu.qq.com/
- margin_balance：东方财富融资账户统计；https://datacenter-web.eastmoney.com/api/data/v1/get?reportName=RPTA_WEB_MARGIN_DAILYTRADE&columns=ALL&pageNumber=1&pageSize=250&sortColumns=STATISTICS_DATE&sortTypes=-1
- margin_net_repay：上海证券交易所；https://query.sse.com.cn/marketdata/tradedata/queryMargin.do?isPagination=true&beginDate=20251106&endDate=20261111&tabType=&stockCode=&pageHelp.pageSize=5000&pageHelp.pageNo=1&pageHelp.beginPage=1&pageHelp.cacheSize=1&pageHelp.endPage=5
- margin_pressure：上海证券交易所·计算；https://query.sse.com.cn/marketdata/tradedata/queryMargin.do?isPagination=true&beginDate=20251106&endDate=20261111&tabType=&stockCode=&pageHelp.pageSize=5000&pageHelp.pageNo=1&pageHelp.beginPage=1&pageHelp.cacheSize=1&pageHelp.endPage=5
- margin_pressure_change：上交所·沪市压力变化；https://query.sse.com.cn/marketdata/tradedata/queryMargin.do?isPagination=true&beginDate=20251106&endDate=20261111&tabType=&stockCode=&pageHelp.pageSize=5000&pageHelp.pageNo=1&pageHelp.beginPage=1&pageHelp.cacheSize=1&pageHelp.endPage=5
- advancers_pct：新浪全A行情·计算；https://finance.sina.com.cn/stock/
- up_amount_pct：新浪全A行情·计算；https://finance.sina.com.cn/stock/
- etf300_share_change：上海证券交易所ETF规模；https://query.sse.com.cn/commonQuery.do?isPagination=true&pageHelp.pageSize=10000&pageHelp.pageNo=1&pageHelp.beginPage=1&pageHelp.cacheSize=1&pageHelp.endPage=1&sqlId=COMMON_SSE_ZQPZ_ETFZL_XXPL_ETFGM_SEARCH_L&STAT_DATE=2026-11-10
- etf_creation：沪深交易所份额 / 东方财富单位净值·估算；https://www.sse.com.cn/market/funddata/volumn/etfvolumn/
- dr007：中国货币网·DR007加权利率；https://www.chinamoney.com.cn/r/cms/www/chinamoney/data/currency/prr-md.json
- funding_spread：中国货币网 / 人民银行·计算；https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/index.html
- credit_spread：中债估值·同日同期限计算；https://yield.chinabond.com.cn/cbweb-pbc-web/pbc/historyQuery?startDate=2026-05-16&endDate=2026-11-12&gjqx=0&qxId=ycqx&locale=cn_ZH
- usdcnh：新浪财经·USD/CNH日线；https://vip.stock.finance.sina.com.cn/forex/api/jsonp.php/var%20_fx=/NewForexService.getDayKLine?symbol=fx_susdcnh
- pe_ttm：中证指数；https://www.csindex.com.cn/csindex-home/perf/index-perf?indexCode=000300&startDate=20230705&endDate=20261112
- earnings_revision：东方财富预测快照·计算；https://data.eastmoney.com/report/profitforecast.html
- local_iv30：上交所合约 / 新浪报价·平值IV估算；https://www.sse.com.cn/assortment/options/risk/
- iv_term：上交所合约 / 新浪报价·期限结构估算；https://www.sse.com.cn/assortment/options/risk/
- put_call：上交所510300期权；https://query.sse.com.cn/commonQuery.do?isPagination=false&sqlId=COMMON_SSE_ZQPZ_YSP_QQ_SJTJ_MRTJ_CX&tradeDate=20261110
- vix：CBOE；https://cdn.cboe.com/api/global/us_indices/daily_prices/VIX_History.csv
