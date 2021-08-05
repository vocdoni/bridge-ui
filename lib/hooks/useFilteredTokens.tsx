import { TokenInfo, UseData } from "../types";
import { useStoredTokens } from "./context/tokens";

function doesTokenInfoContainTerm(token: TokenInfo, term: string) {
  const lowercaseTerm = term.toLocaleLowerCase();
  const lowercaseSymbol = token.symbol.toLocaleLowerCase();
  const lowercaseAddress = token.address.toLocaleLowerCase();
  const lowercaseName = token.name.toLocaleLowerCase();
  return (
    lowercaseSymbol.indexOf(lowercaseTerm) >= 0 ||
    lowercaseName.indexOf(lowercaseTerm) >= 0 ||
    lowercaseAddress.indexOf(lowercaseTerm) >= 0
  );
}

export const useFilteredTokens = (searchTerm: string): UseData<TokenInfo[]> => {
  const storedTokens = useStoredTokens();

  if (storedTokens.isLoading) return storedTokens;

  const filteredTokens = !searchTerm
    ? storedTokens.data
    : storedTokens.data.filter((t) => doesTokenInfoContainTerm(t, searchTerm));

  return { data: filteredTokens, isLoading: false, error: storedTokens.error };
};
