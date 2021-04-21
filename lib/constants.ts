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
