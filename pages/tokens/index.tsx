import styled from "styled-components";

import TokenCard from "../../components/token-card";
// import Select from 'react-select'
import { WalletStatus } from "../../components/wallet-status";
// import { usePool } from '../../lib/hooks/pool'
import { useTokens } from "../../lib/hooks/tokens";
import { useRegisteredTokens } from "../../lib/hooks/registered-tokens";
import { FALLBACK_TOKEN_ICON } from "../../lib/constants";
import { ExternalLink } from "../../components/external-link";
import { TopSection } from "../../components/top-section";

const Container = styled.div`
    max-width: 992px;
    margin-left: auto;
    margin-right: auto;
    padding: ${({ theme }) => "0 " + theme.margins.horizontal};
`;

const Head = styled.div`
    display: flex;
`;

const NotListedMessage = styled.h6`
    color: ${({ theme }) => theme.accent1};
    text-align: right;
`;

const LeftSection = styled.div`
    width: 70%;
`;

const RightSection = styled.div`
    width: 30%;
    margin-left: 2em;
    margin-top: 3em;
`;

const Description = styled.h4`
    color: ${({ theme }) => theme.accent1};
    margin-top: 5px;
    font-size: 20px;
`;

const ActiveTokensDescription = styled.p`
    color: ${({ theme }) => theme.lightText};
`;

const TokenList = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin: 0 -1em;
`;

const Title = styled.h1`
    margin-bottom: 5px;
`;

// MAIN COMPONENT
const TokensPage = () => {
    const {
        registeredTokens: tokenAddrs,
        error: tokenListError,
    } = useRegisteredTokens();
    // const [tokenAddrs, setTokenAddrs] = useState(registeredTokens)  // TODO: Allow filtering => setTokenAddrs( [myTokenAddr] )
    const tokenInfos = useTokens(tokenAddrs);

    return (
        <Container>
            <TopSection
                title={"All Tokens"}
                description={"Click at the tokens you own and cast your votes"}
                Action={() => (
                    <ExternalLink link="/tokens/add">
                        <NotListedMessage>
                            My token is not listed
                        </NotListedMessage>
                    </ExternalLink>
                )}
            />

            <h2>Active tokens</h2>
            <ActiveTokensDescription>
                Below are the processes belonging to tokens that you currently
                hold.
            </ActiveTokensDescription>

            <TokenList>
                {tokenAddrs
                    .map((addr) => tokenInfos.get(addr))
                    .map((token, idx) => (
                        <TokenCard
                            name={token?.symbol}
                            icon={token?.icon || FALLBACK_TOKEN_ICON}
                            rightText={""}
                            href={
                                token?.address
                                    ? "/tokens/info#/" + token?.address
                                    : ""
                            }
                            key={idx}
                        >
                            <p>
                                {token?.name || "(loading)"}
                                <br />
                                {token?.totalSupply && (
                                    <small>
                                        Total supply: {token?.totalSupply}
                                    </small>
                                )}
                            </p>
                        </TokenCard>
                    ))}
            </TokenList>
        </Container>
    );
};

export default TokensPage;
