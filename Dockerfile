FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    bash procps make gcc g++ curl wget sudo python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy upstream Lightning Jet source (git submodule)
COPY lightning-jet/ /app/

RUN npm install --python=$(which python3)

ENV PATH="/app:${PATH}"

CMD ["jet", "start", "daddy"]
