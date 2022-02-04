# Bridge UI

Frontend for the Vocdoni Bridge voting client

## Docker Builds

There are two types of docker images, bootstrap generated and fully static, depending on the Dockerfile used:

-   `Dockerfile`: By default, the image includes all NodeJS dependencies, and generates the static site at bootstrap based on the env vars provided. Hence, the initial run of the image takes few minutes to start since it has to build itself. This image is for testing and/or developing purposes.

-   `Dockerfile.static`: This image generates the static site at build time, and serves the content with nginx, so once it's built no parameters can be configured at runtime. It starts instantly as you would expect. This is a final image, to be used in production environments.

## Docker compose deployment

To deploy using [Docker Compose](https://docs.docker.com/compose) follow the instructions.

### Prerequisites

-   GNU/Linux based operating system
-   Docker engine (version 19.03 or above) [Installation](https://docs.docker.com/engine/install/#server)
-   Docker compose (version 1.24 or above) [Installation](https://docs.docker.com/compose/install)
-   A DNS domain

### Environment Variables

The build arguments are defined in several stages of the lifecycle and build flow:
- `env-config.js`
- `Dockerfile`
- `Dockerfile.static`
- `.github/workflows/main.yaml`
- `lib/constants/env.ts`

#### UI Docker build args

- **Vochain environment**: What is the Vochain environment being targeted from this network (`dev, stg, prod`)
  - `MAINNET_VOCDONI_ENVIRONMENT`
  - `RINKEBY_VOCDONI_ENVIRONMENT`
  - `MATIC_VOCDONI_ENVIRONMENT`
- **Bootnode URL**: URL to fetch the JSON containing nodes information (gateways, etc.)
  - `MAINNET_BOOTNODE_URL`
  - `RINKEBY_BOOTNODE_URL`
  - `MATIC_BOOTNODE_URL`
- **Signaling oracle**: The URL of the signaling oracle, used to create gassless proposals
  - `MAINNET_SIGNALING_ORACLE_URL`
  - `RINKEBY_SIGNALING_ORACLE_URL`
  - `MATIC_SIGNALING_ORACLE_URL`
- **Archive IPNS ID**: (Optional) The ID of the IPNS folder where the archive is hosted
  - `MAINNET_ARCHIVE_IPNS_ID`
  - `RINKEBY_ARCHIVE_IPNS_ID`
  - `MATIC_ARCHIVE_IPNS_ID`
- **Detault Eth chain ID**: (1, 5, 137...)
  - `DEFAULT_ETH_CHAIN_ID` (default: 1)
- Other:
  - `WALLET_CONNECT_ID`
  - `FORTMATIC_API_KEY`

#### CI/CD env vars

Configure the `.env` file with the following variables:

-   `BRIDGE_UI_TAG` Docker tag of the image (main, stage, release)
-   `DOMAIN` Domain name to be served. Used by Traefik to fetch SSL certificates from Let's Encrypt
-   `LE_EMAIL` Email associated to the domain. Used by Traefik to fetch SSL certificates from Let's Encrypt

### Deployment

Pull the images

`docker-compose pull`

Deploy all services

`docker-compose up -d`

After a while, the bridge should be ready at https://<yourdomain>
