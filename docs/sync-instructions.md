# 云端同步操作说明

计划北京时间19:00启动采集，供20:00复盘读取。启动时间不保证完成时间；未公布的来源不等待到齐再造数。成功项正常保存，失败项保留日期和状态，按已有规则完成整轮导出。

目标仅为 `colourschen-bit/ashare-market-evidence-feed` 的数据快照。不得写入 `A-share-monitor`，不做个股研究或证券交易，也无需重新部署原网站。

1. 从 GitHub 本仓库当前 main 读取本说明、README 和更新代码。可用公开 Git clone；若运行环境不允许该网络路径，改用连接的 GitHub 读取工具取得代码。不要依赖旧对话工作目录。Node >=22.18、Python 3，无额外依赖。
2. 使用连接的 Sites `get_site` 读取项目 `appgprj_6adc43d918608191883d5e140dedd44a`，取得临时 `siwc_bypass_bearer_token`。只在内存中持有；不打印、写文件、提交 GitHub 或转发给任何其他主机。
3. 在本仓库目录运行 `python3 scripts/refresh_export.py --secure-stdin`。TTY显示READY后，经隐藏标准输入传入一行JSON，字段名为token。脚本复用原站更新接口，顺序更新core、earnings、funding、breadth、newlow、options、etf；newlow仅在返回明确progress且complete=false时继续，最多65批。waiting非进度、error或busy停止该组，继续其他组。单次网络请求最多120秒，超时写入不自动重放。不要用LLM逐批循环。
4. 运行结束检查退出码、`data/latest.json`和`data/update-status.json`。若脚本失败或读不到有效指数日期，不发布伪造的新文件；保留上次已发布快照并报告失败。部分来源失败时，允许发布有明确逐项日期和状态的快照。检查market_date、exported_at、aligned_count、metric_count，以及错误、旧值、空值。不得用生成时间冒充行情日期。
5. 用连接的 GitHub 工具一次提交data目录下5个文件：latest.json、latest.txt、latest.md、index.html、update-status.json。先取main当前头及tree；用create_tree保留base_tree_sha并覆盖这5个文件，再以当前头为parent创建提交，最后非force更新main并携带expected_sha。如果分支并发变化，重新读最新头并保留其他文件后再合并数据更新；不强推。
6. 从已提交的GitHub原文读取latest.txt、latest.json和update-status.json，核对文本内容/哈希、market_date及导出时间。尽可能用不带任何凭据的公共HTTP请求复核 `https://raw.githubusercontent.com/colourschen-bit/ashare-market-evidence-feed/main/data/latest.txt` 返回200及一致正文。若公共网络检查不可用，明确只完成GitHub读回，不能声称已验证Grok本身。
7. 简短报告同步成功或失败、真实数据日期、同日有效数量及主要来源缺口。无须重复市场解读、重新搜索新闻或修改估值。节假日保留实际日期，不补零、不造新交易日。

凭据、源站完整dashboard和临时下载数据都不进入本公开仓库；仅公开既有公开市场指标及其来源。仓库不存储个人持仓或账户数据。
