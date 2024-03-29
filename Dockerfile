# Static web site compiler
FROM node:14 as builder

ARG COMMIT_SHA
ENV COMMIT_SHA=${COMMIT_SHA}
ARG VOCDONI_ENVIRONMENT="dev"
ENV VOCDONI_ENVIRONMENT=${VOCDONI_ENVIRONMENT}
ARG NODE_ENV="development"
ENV NODE_ENV=${NODE_ENV}
ARG ETH_NETWORK_ID
ENV ETH_NETWORK_ID=${ETH_NETWORK_ID}
ARG ETH_CHAIN_ID
ENV ETH_CHAIN_ID=${ETH_CHAIN_ID}
ARG ETHERSCAN_PREFIX
ENV ETHERSCAN_PREFIX=${ETHERSCAN_PREFIX}
ARG BLOCK_TIME
ENV BLOCK_TIME=${BLOCK_TIME}
ARG BOOTNODES_URL="https://bootnodes.vocdoni.net/gateways.dev.json"
ENV BOOTNODES_URL=${BOOTNODES_URL}
ARG SIGNALING_ORACLE_URL="https://signaling-oracle.dev.vocdoni.net/dvote"
ENV SIGNALING_ORACLE_URL=${SIGNALING_ORACLE_URL}
ARG ANALYTICS_KEY="1w2W1aAJRMbVRAgHVOIRVVIh1Nc"
ENV ANALYTICS_KEY=${ANALYTICS_KEY}
ARG FORTMATIC_API_KEY="pk_test_A5D318B08D001541"
ENV FORTMATIC_API_KEY=${FORTMATIC_API_KEY}

WORKDIR /app
ADD package.json /app
# ADD package-lock.json /app
RUN npm install

ADD . /app
RUN npm run export

FROM node:14

RUN apt update && apt install nginx -y && apt clean

COPY --from=builder /app /app

WORKDIR /app

ENTRYPOINT [ "/app/entrypoint.sh" ]
