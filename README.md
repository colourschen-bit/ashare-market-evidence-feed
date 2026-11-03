# A股市场证据 · 独立数据出口

这是独立的市场证据快照项目，供 Grok 等机器人每天低成本读取。与 `A-share-monitor` 投资研究看板分开维护；不包含个股关注价或组合建议。

数据来自 [A股机会观察站](https://ashare-opportunity-observatory.safefawn35.chatgpt.site/)，只复用其已保存记录及既有更新逻辑。本站不调用大模型、不生成行情、不提供预测胜率。

## 读取

固定原文入口（不需要GitHub Pages）：

- 纯文本：https://raw.githubusercontent.com/colourschen-bit/ashare-market-evidence-feed/main/data/latest.txt
- JSON：https://raw.githubusercontent.com/colourschen-bit/ashare-market-evidence-feed/main/data/latest.json


- 机器人优先读取 [data/latest.txt](data/latest.txt)：25项指标、日期、状态、前1/5期变化、ETF五期累计和来源。
- 需要精确口径时读取 [data/latest.json](data/latest.json)：另含范围、对比起始日期、定义和限制。
- 人工查看 [data/index.html](data/index.html)。这些文件是静态内容，不需要 JavaScript、登录或点击刷新。
- [data/update-status.json](data/update-status.json) 记录最近刷新尝试及分组失败；只有运行更新脚本后才存在。

`exported_at` 是导出时间，`market_date` 是指数数据日期；各指标还有自己的 `date`。生成了新文件，不代表取得了新行情。`same_date` 仅表示与 `market_date` 同日；不能据此断言是今天。

## 更新方式

更新脚本复用观察站：更新来源 → 读取持久化结果 → 本地压缩导出 → 发布这份快照。更新例行运行不重新发布原网站。

运行环境：Python 3、Node.js 22.18或更高版本，无额外依赖。

1. 通过连接的 Sites `get_site`，对项目 `appgprj_6adc43d918608191883d5e140dedd44a` 取得临时服务凭据。
2. 执行 `python3 scripts/refresh_export.py --secure-stdin`；在隐藏标准输入中传入一行JSON（`token`字段）。凭据只在内存中，仅发往原站，不得保存到文件、GitHub、日志或任务提示词。
3. 检查 `data/latest.json` 及 `data/update-status.json`，将 `data/` 文件作为一次提交推送至本仓库。
4. 通过 GitHub 读取已提交内容，再以未登录的公共请求检查纯文本；比较内容摘要和数据日期。

`--read-only` 仅导出、不刷新；`--newlow-limit` 默认65，批量扫描在脚本内完成，无需每批调用大模型。waiting按正常等待处理；error/busy停止当前分组，继续其余分组；绝不把失败补成0。HTTP超时后不自动重放写入，避免重复扫描。

若未来云任务无法取得服务凭据或GitHub写入能力，须报告未同步，保留旧快照，不得报告更新成功。GitHub Pages静态网页更新依赖仓库的Pages配置；GitHub文件原文链接可独立使用。

## 每日解读提示词

读取本仓库 `data/latest.txt`（需要口径时查 `latest.json`）。先报告market_date、导出时间及重要滞后/缺失。约400—600字给出：一句短期市场状态；技术、抛压与承接、资金三条洞察，各用数字变化解释含义及未确认之处；下个交易日两个验证条件。只分析有效记录，不联网扩展新闻、不重算整套指标。日期不同不作同日联合确认；超跌不等于见底；ETF申购、上涨成交额占比不等于全A资金净流入；不得推断行业轮动。读取失败停止判断，旧数据只能作对应日期复盘。

## 验证与来源版本

运行 `node --experimental-strip-types --test tests/feed.test.ts`。

指标定义与计算基线复制自原站源码提交 `e9d68a6713a509dc95e4f1d38a0a16af40dd3919`。新增导出逻辑位于 `lib/feed.ts`。核心校验：旧数据不升级为当日、缺失不补零、缺前一交易日不伪造日变化、ETF五期累计与流量差分开、未来可用时间不泄露。

当前是否已启用定时同步，以云任务实际保存结果为准；不能仅凭README声称自动更新已启用。
