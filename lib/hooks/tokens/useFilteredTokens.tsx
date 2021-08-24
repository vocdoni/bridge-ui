import { TokenInfo, UseData } from "../../types";
import { useStoredTokens } from "../../contexts/tokens";

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

/**
 * This hook filters all the locally stored token w.r.t a given search term.
 *
 * The hook checks if the term is a substring of the NAME, SYMBOL or ADDRESS of the token.
 *
 * @param searchTerm string to search in token infos
 * @returns A list of token information containing the searchTerm
 */
export const useFilteredTokens = (searchTerm: string): UseData<TokenInfo[]> => {
  const storedTokens = useStoredTokens();

  if (storedTokens.isLoading)
    return {
      data: storedTokens.data.tokens,
      isLoading: storedTokens.isLoading,
      error: storedTokens.error,
    };

  const filteredTokens = !searchTerm
    ? storedTokens.data.tokens
    : storedTokens.data.tokens.filter((t) => doesTokenInfoContainTerm(t, searchTerm));

  return { data: filteredTokens, isLoading: false, error: storedTokens.error };
};
