FROM node:20-bookworm-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    make gcc g++ python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY lightning-jet/ /app/
RUN npm install --python=$(which python3)

FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    bash procps curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app /app

ENV PATH="/app:${PATH}"

CMD ["node", "/app/service/launcher.js"]
