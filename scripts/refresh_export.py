#!/usr/bin/env python3
"""Read a short-lived Sites service token from stdin only; never save it.
Run from repository root. Requires Python 3 and Node >=22.18. No dependencies.
"""
import argparse, json, os, pathlib, subprocess, sys, tempfile, time, urllib.request

ORIGIN = 'https://ashare-opportunity-observatory.safefawn35.chatgpt.site'

PARTS=['core', 'earnings', 'funding', 'breadth', 'newlow', 'options', 'etf']

def run(token, refresh=True, newlow_limit=65, parts=None):
    if not isinstance(token, str) or len(token) < 16:
        raise ValueError('缺少有效服务访问凭据；从 Sites get_site 动态取得后仅经 stdin 传入')
    def call(path, method='GET'):
        req = urllib.request.Request(ORIGIN + path, data=b'{}' if method == 'POST' else None,
            headers={'OAI-Sites-Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'}, method=method)
        # No redirect can forward the service token to another host.
        class NoRedirect(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, req, fp, code, msg, headers, newurl): return None
        with urllib.request.build_opener(NoRedirect).open(req, timeout=120) as response:
            data = json.load(response)
        if not isinstance(data, dict) or 'error' in data:
            raise ValueError('网站接口失败：' + str(data.get('error', '响应非对象')))
        return data
    attempts=[]
    if refresh:
        for part in (parts or PARTS):
            for batch in range(newlow_limit if part == 'newlow' else 1):
                started=time.monotonic()
                try:
                    result=call('/api/refresh?part='+part, 'POST')
                    attempts.append({'part': part, 'batch': batch+1, 'result': result})
                    print(json.dumps({'part': part, 'batch': batch+1, 'status': result.get('status'),
                        'seconds': round(time.monotonic()-started, 1)}, ensure_ascii=False), flush=True)
                    rows=result.get('results', [])
                    progressing=part=='newlow' and any(r.get('complete') is False and isinstance(r.get('progress'),int) for r in rows)
                    if part != 'newlow' or result.get('status') in ['error','busy'] or any(r.get('status')=='error' or r.get('complete') is True for r in rows) or not progressing:
                        break
                except Exception as exc:
                    attempts.append({'part': part, 'batch': batch+1, 'status': 'error', 'message': str(exc)})
                    print(json.dumps({'part': part, 'status': 'error', 'message': str(exc)}, ensure_ascii=False), flush=True)
                    break
    # Read persisted data after the attempted writes. No inferred or synthetic values.
    dashboard=call('/api/dashboard?index=000300')
    if not isinstance(dashboard.get('series'), list) or dashboard.get('index') != '000300':
        raise ValueError('dashboard内容校验失败')
    root=pathlib.Path(__file__).resolve().parents[1]
    with tempfile.TemporaryDirectory(prefix='ashare-feed-') as tmp:
        source=pathlib.Path(tmp)/'dashboard.json'
        source.write_text(json.dumps(dashboard, ensure_ascii=False), encoding='utf-8')
        # Stage all files first, so a failed export never destroys the last valid snapshot.
        out=pathlib.Path(tmp)/'data'
        subprocess.run(['node','--experimental-strip-types',str(root/'scripts/export.ts'),str(source),str(out)], check=True, cwd=root)
        target=root/'data'; target.mkdir(exist_ok=True)
        for f in out.iterdir(): os.replace(f, target/f.name)
    status={'schema_version':'1.0','exported_at':json.load(open(root/'data/latest.json'))['exported_at'],
        'mode':'refresh_then_export' if refresh else 'read_only_export', 'attempts':attempts,
        'note':'刷新尝试成功不证明每项均为最新交易日；以latest.json逐项日期和状态为准。'}
    (root/'data/update-status.json').write_text(json.dumps(status, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--read-only',action='store_true')
    parser.add_argument('--newlow-limit',type=int,default=65)
    parser.add_argument('--parts',nargs='+',choices=PARTS,help='仅重试指定分组，不重复成功的其他采集')
    parser.add_argument('--secure-stdin',action='store_true',help='PTY输入前关闭回显')
    args=parser.parse_args()
    if not 1 <= args.newlow_limit <= 65: parser.error('newlow-limit须为1—65')
    if args.secure_stdin and sys.stdin.isatty():
        import termios
        settings=termios.tcgetattr(0); settings[3] &= ~termios.ECHO
        termios.tcsetattr(0,termios.TCSANOW,settings)
    print('READY: send one JSON line on stdin',flush=True)
    payload=json.loads(sys.stdin.readline())
    run(payload.get('token'), refresh=not args.read_only, newlow_limit=args.newlow_limit,parts=args.parts)
