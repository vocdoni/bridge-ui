export const FALLBACK_TOKEN_ICON = "/media/coin.svg";

export const ERC20_ABI = [
  // Read-Only Functions
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function decimals() public view returns (uint8)",
  "function balanceOf(address _owner) public view returns (uint256 balance)",
  "function totalSupply() public view returns (uint256)",
];

// from aragon/use-wallet
export const TRUST_WALLET_BASE_URL =
  "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum";

export const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";

// for ethers-multicall
export const ERC20JsonAbi = [
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

export const GOERLI_MULTICALL = "0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e";

export const GOERLI_CHAINID = 5;
export const LANDING_PAGE_CTA = "media/landingpage_header_backgroung.svg";
export const HEADER_LOGO = "media/logo01.svg";
export const FOOTER_LOGO = "media/footer_logo.svg";
export const PLUS_ICON = "media/plus_icon.svg";
export const MINUS_ICON = "media/minus_icon.svg";