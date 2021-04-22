export const FALLBACK_TOKEN_ICON = "/media/coin.svg"

export const GOERLI_MULTICALL = "0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e"

export const GOERLI_CHAINID = 5

export const tokenAbi = [
  {
      "constant": true,
      "inputs": [
          {
              "internalType": "address",
              "name": "account",
              "type": "address"
          }
      ],
      "name": "balanceOf",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
  }
]
