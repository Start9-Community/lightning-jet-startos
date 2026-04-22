FROM node:18-alpine

RUN apk update && apk add --no-cache --virtual build-dependencies \
    bash procps make gcc g++ curl wget sudo python3

WORKDIR /app

# Copy upstream Lightning Jet source (git submodule)
COPY lightning-jet/ /app/

RUN npm install --build-from-source --python=$(which python3)

ENV PATH="/app:${PATH}"

CMD ["jet", "start", "daddy"]
