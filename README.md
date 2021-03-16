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

Configure the `.env` file with the following variables:

-   `BRIDGE_UI_TAG` Docker tag of the image (main, stage, release)
-   `VOCDONI_ENVIRONMENT` Enviromnent type (dev, stage, prod)
-   `BOOTNODES_URL` URL to fetch the JSON containing nodes information (gateways, etc.)
-   `ETH_NETWORK_ID` Ethereum nework ID (xdai, goerli...)
-   `DOMAIN` Domain name to be served. Used by Traefik to fetch SSL certificates from Let's Encrypt
-   `LE_EMAIL` Email associated to the domain. Used by Traefik to fetch SSL certificates from Let's Encrypt

TBD: Add all remaining variables.

### Deployment

Pull the images

`docker-compose pull`

Deploy all services

`docker-compose up -d`

After a while, the bridge should be ready at https://<yourdomain>
