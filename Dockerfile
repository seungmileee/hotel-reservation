# 호텔 예약 사이트 — json-server 0.17.4 정적 서빙 + REST API
FROM node:20-alpine

WORKDIR /app

# 의존성 먼저 설치 (레이어 캐시 활용)
COPY package.json package-lock.json ./
RUN npm ci

# 프로젝트 전체 복사 (db.json은 초기 씨앗 데이터로 이미지에 포함됨)
COPY . .

# 참고: k8s 배포 시 db.json은 PVC 볼륨으로 덮어쓸 예정
# (컨테이너 재시작마다 예약 데이터가 초기화되지 않도록)

EXPOSE 3000

# npm start 없이 json-server 바이너리를 직접 실행하므로 PATH에 추가
ENV PATH="/app/node_modules/.bin:${PATH}"

CMD ["json-server", "--watch", "db.json", "--static", "src", "--host", "0.0.0.0", "--port", "3000"]
