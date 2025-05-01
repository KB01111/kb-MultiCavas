#!/bin/bash

docker run --rm --entrypoint sh \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --workdir /app \
  docker:dind \
  -c "
    git clone https://github.com/Klavis-AI/klavis.git . && \
    touch mcp_servers/youtube/.env && \
    docker build -t youtube-mcp-server -f mcp_servers/youtube/Dockerfile .
  "
