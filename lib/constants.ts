export const ETH_BLOCK_HEIGHT_PADDING = 10;

export const ERC20_ABI = [
  // Read-Only Functions
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function decimals() public view returns (uint8)",
  "function balanceOf(address _owner) public view returns (uint256 balance)",
  "function totalSupply() public view returns (uint256)",
];

export const ERC20_ABI_MAKER = [
  "function name() public view returns (bytes32)",
  "function symbol() public view returns (bytes32)",
  "function decimals() public view returns (uint8)",
  "function balanceOf(address _owner) public view returns (uint256 balance)",
  "function totalSupply() public view returns (uint256)",
];

// from aragon/use-wallet
export const TRUST_WALLET_BASE_URL =
  "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum";

export const HARDWARE_WALLETS_METAMASK_ARTICLE =
  "https://metamask.zendesk.com/hc/en-us/articles/360020394612-How-to-connect-a-Trezor-or-Ledger-Hardware-Wallet";

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

//LOGOS
export const FALLBACK_TOKEN_ICON = "/media/eth-logo.png";
export const HEADER_LOGO = "/media/logo_voice.svg";
export const FOOTER_LOGO = "/media/footer_logo.svg";

//ICONS
export const PLUS_ICON = "/media/plus_icon.svg";
export const MINUS_ICON = "/media/minus_icon.svg";
export const LIGHTNING_ICON = "/media/lightning_bolt.svg";
export const WARNING_ICON = "/media/exclamation_icon.png";
export const BLUE_TICK_ICON = "/media/blue-tick.svg";
export const RED_CROSS_ICON = "/media/red-cross.svg";

//IMAGES
export const LANDING_PAGE_CTA = "/media/landing-background.svg";
export const WALLET_IDENTICON = "/media/connected_wallet_icon.svg";
export const MEDITATING_LADY_IMG = "/media/meditating_lady_img.svg";
export const ISLAND_FLAG_IMG = "/media/island_flag_img.svg";
export const PEOPLE_IMG = "/media/people_img_transparent.png";

// URI's
export const COOKIES_URL = "https://aragon.org/cookies";
export const ETHERSCAN_RINKEBY = "https://rinkeby.etherscan.io/address/";
