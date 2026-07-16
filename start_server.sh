#!/bin/bash
# kopolab-auto-server : json-server 로 정적 사이트(src) + API(db.json) 를 한 서버에서 서빙
cd "$(dirname "$0")"
if [ -f server.pid ] && kill -0 "$(cat server.pid)" 2>/dev/null && [ -f server.port ]; then
  echo "이미 실행 중 (포트 $(cat server.port))"; exit 0
fi
rm -f server.pid
PORT=$(python3 -c "import socket,random
def free(p):
 s=socket.socket();r=s.connect_ex(('127.0.0.1',p));s.close();return r!=0
for p in random.sample(range(10000,20000),100):
 if free(p): print(p); break")
# json-server : --static ./src 로 정적파일 서빙, db.json 으로 REST API (/rooms, /db ...)
# --host 0.0.0.0 으로 외부 노출, 포트는 10000~19999
setsid npx json-server db.json --static ./src --watch --host 0.0.0.0 --port "$PORT" > server.log 2>&1 &
echo $! > server.pid; echo "$PORT" > server.port; sleep 2
echo "서버 실행됨 (포트 $PORT)."
echo "외부 접속 주소(잠시 후 열림): https://aisw-lab.kopoctc.kr/g/$(basename "$HOME")/$(basename "$PWD")/"
