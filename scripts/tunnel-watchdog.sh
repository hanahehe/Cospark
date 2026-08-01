#!/bin/bash
# Watches the Cloudflare tunnel backing the CoSpark backend. If it goes down
# (dies, gets invalidated, drops connection), automatically starts a fresh
# tunnel, points Vercel's VITE_API_URL at the new address, and redeploys the
# frontend — so a dead tunnel self-heals instead of needing manual fixes.

REPO_ROOT="/Users/hana/Desktop/cospark"
TUNNEL_LOG="/tmp/cloudflared.log"
CHECK_INTERVAL=30

get_tunnel_url() {
  grep -oE 'https://[a-z-]+\.trycloudflare\.com' "$TUNNEL_LOG" | tail -1
}

start_tunnel() {
  pkill -f "cloudflared tunnel" 2>/dev/null
  sleep 1
  nohup cloudflared tunnel --protocol http2 --url http://localhost:8080 > "$TUNNEL_LOG" 2>&1 &
  disown
  sleep 8
}

redeploy_with_url() {
  local url="$1"
  cd "$REPO_ROOT" || return
  vercel env rm VITE_API_URL production --yes >/dev/null 2>&1
  echo "${url}/api" | vercel env add VITE_API_URL production >/dev/null 2>&1
  (cd "$REPO_ROOT/frontend" && npm run build >/dev/null 2>&1)
  vercel --prod --yes >/dev/null 2>&1
}

echo "$(date): Tunnel watchdog started"

while true; do
  url=$(get_tunnel_url)
  healthy=false
  if [ -n "$url" ]; then
    status=$(curl -s -m 8 -o /dev/null -w "%{http_code}" "$url/actuator/health")
    [ "$status" = "200" ] && healthy=true
  fi

  if [ "$healthy" = false ]; then
    echo "$(date): Tunnel down (was: ${url:-none}) — restarting"
    start_tunnel
    new_url=$(get_tunnel_url)
    if [ -n "$new_url" ]; then
      echo "$(date): New tunnel up at $new_url — redeploying frontend"
      redeploy_with_url "$new_url"
      echo "$(date): Redeploy complete"
    else
      echo "$(date): Failed to establish a new tunnel, will retry next cycle"
    fi
  fi

  sleep "$CHECK_INTERVAL"
done
