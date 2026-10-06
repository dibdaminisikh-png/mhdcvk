"""Configure and retry the existing Pages project without logging credentials."""
import json
import os
import re
import time
import urllib.request
import urllib.error

account = os.environ.get('CLOUDFLARE_ACCOUNT_ID', '')
token = os.environ.get('CLOUDFLARE_API_TOKEN', '')
project = 'mhdcvk'
if not token or not re.fullmatch(r'[a-fA-F0-9]{32}', account):
    raise SystemExit('Missing Cloudflare token or invalid account ID. Check the two repository secrets.')
base = f'https://api.cloudflare.com/client/v4/accounts/{account}/pages/projects/{project}'

def api(path='', method='GET', payload=None):
    request = urllib.request.Request(base + path, method=method,
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            data = json.load(response)
    except urllib.error.HTTPError as exc:
        raise SystemExit(f'Cloudflare API returned HTTP {exc.code}. Check account, project and Pages Edit permission.') from None
    if not data.get('success'):
        codes = [str(item.get('code', 'unknown')) for item in data.get('errors', [])]
        raise SystemExit('Cloudflare request failed; error codes: ' + ', '.join(codes))
    return data['result']

current = api()
if current.get('name') != project:
    raise SystemExit('Unexpected project; refusing to modify it.')
api(method='PATCH', payload={'build_config': {'build_command': '', 'destination_dir': 'dist', 'root_dir': ''}})
print('Configured existing mhdcvk project: no build command, output directory dist.', flush=True)
deployments = api('/deployments')
production = next((d for d in deployments if d.get('environment') == 'production'), None)
if production is None:
    raise SystemExit('No production deployment exists to retry. Start the first production deployment in Cloudflare.')
deployment_id = production['id']
if not re.fullmatch(r'[a-zA-Z0-9-]+', deployment_id):
    raise SystemExit('Unexpected deployment ID.')
retried = api(f'/deployments/{deployment_id}/retry', method='POST')
deployment_id = retried['id']
if not re.fullmatch(r'[a-zA-Z0-9-]+', deployment_id):
    raise SystemExit('Unexpected retry deployment ID.')
for attempt in range(60):
    state = api(f'/deployments/{deployment_id}')
    status = state.get('latest_stage', {}).get('status', 'unknown')
    stage = state.get('latest_stage', {}).get('name', 'unknown')
    # Print only known stage names/statuses, never request headers or raw responses.
    print(f'Attempt {attempt+1}: stage={stage if stage in ("queued", "initialize", "clone_repo", "build", "deploy") else "other"}, status={status if status in ("idle", "active", "success", "failure", "canceled") else "other"}', flush=True)
    if stage == 'deploy' and status == 'success':
        print('Published: https://mhdcvk.pages.dev', flush=True)
        break
    if status in ('failure', 'canceled'):
        raise SystemExit('Deployment failed or was canceled. Inspect the Cloudflare build log.')
    time.sleep(10)
else:
    raise SystemExit('Deployment is still running. Check the Cloudflare deployment dashboard.')
