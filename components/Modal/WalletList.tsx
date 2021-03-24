import { useRouter } from "next/router";
import styled from "styled-components";
import { useWallet } from "use-wallet";

import { Modal } from ".";
import { WALLETS } from "../../lib/wallets";
import { ActionTypes, useModal } from "./context";

const ModalContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const ModalTitle = styled.div`
    display: flex;
    border-bottom: 1px solid lightgray;
    padding-bottom: 10px;
    box-sizing: border-box;
    margin-top: 10px;
    padding-left: 10px;
`;

const Body = styled.div`
    height: 100%;
    padding: 15px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
`;

const WalletOption = styled.div`
    background: lightgrey;
    width: 100%;
    height: 100px;
    border-radius: 8px;
    text-align: center;
    white-space: normal;
    border: 1px solid grey;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const WalletName = styled.h4`
    font-weight: bold;
    display: flex;
    margin-top: 10px;
`;

const WalletLogo = styled.img`
    width: 40px;
    height: 40px;
    display: flex;
    margin-top: 10px;
`;

const OptionContainer = styled.div`
    height: 100px;
    width: 45%;
`;

const ExternalLinkOption = styled.a`
    font-weight: bold;
    display: flex;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    color: #393939;
`;

const DontHaveAccount = styled.h5`
    display: flex;
    margin: auto;
    margin-bottom: 10px;
    color: blue;
`;

const HARDWARE_WALLETS_METAMASK_ARTICLE =
    "https://metamask.zendesk.com/hc/en-us/articles/360020394612-How-to-connect-a-Trezor-or-Ledger-Hardware-Wallet";

export const WalletList = () => {
    const { connect, error } = useWallet();
    const { push, pathname } = useRouter();
    const { state, dispatch } = useModal();

    const inLanding = pathname === "/";

    const closeModal = () => {
        dispatch({
            type: ActionTypes.CLOSE,
        });
    };

    // @TODO: Remove this when ledger and trezor are implemented in useWallet
    const isHardwareWallet = (wallet: string) =>
        wallet === "Ledger" || wallet === "Trezor";

    const handleConnection = async (wallet: string) => {
        // @TODO: Remove this when ledger and trezor are implemented in useWallet
        if (isHardwareWallet(wallet)) return;
        try {
            await connect(WALLETS[wallet].connector);
            if (!error && inLanding) push("/dashboard");
            closeModal();
        } catch (e) {
            console.log(e);
        }
    };
    return (
        <Modal open={state.walletList.open} height={530} width={430}>
            <ModalContainer>
                <ModalTitle>USE ACCOUNT FROM</ModalTitle>
                <Body>
                    {Object.keys(WALLETS).map((wallet) => {
                        const { connector, name } = WALLETS[wallet];
                        const Option = () => (
                            <WalletOption
                                onClick={() => handleConnection(name)}
                            >
                                <WalletLogo
                                    src={`/media/wallets/${connector}.svg`}
                                />
                                <WalletName>{name}</WalletName>
                            </WalletOption>
                        );
                        return (
                            <OptionContainer key={"wallet_" + wallet}>
                                {/* @TODO: Remove this when ledger and trezor are implemented in useWallet */}
                                {isHardwareWallet(name) ? (
                                    <ExternalLinkOption
                                        rel="noreferrer noopener"
                                        target="_blank"
                                        href={HARDWARE_WALLETS_METAMASK_ARTICLE}
                                    >
                                        <Option />
                                    </ExternalLinkOption>
                                ) : (
                                    <Option />
                                )}
                            </OptionContainer>
                        );
                    })}
                </Body>
                <DontHaveAccount>
                    Don't have an Ethereum account?
                </DontHaveAccount>
            </ModalContainer>
        </Modal>
    );
};
