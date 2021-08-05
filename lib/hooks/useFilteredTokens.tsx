import { TokenInfo } from "../types";
import { useStoredTokens } from "./context/tokens";

type FilteredTokens = {
  storedTokens: TokenInfo[];
  error?: string;
  loading: boolean;
};

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

export const useFilteredTokens = (searchTerm: string): FilteredTokens => {
  const { storedTokens, error, loading } = useStoredTokens();

  if (loading) return { storedTokens, error, loading };

  const filteredTokens = !searchTerm
    ? storedTokens
    : storedTokens.filter((t) => doesTokenInfoContainTerm(t, searchTerm));

  return { storedTokens: filteredTokens, error, loading };
};
