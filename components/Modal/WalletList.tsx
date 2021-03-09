import styled from "styled-components";
import { useWallet } from "use-wallet";

import { Modal } from ".";
import { WALLETS } from "../../lib/wallets";
import { ActionTypes, useModal } from "./context";

const ModalContainer = styled.div`
    padding: 50px 20px;
    display: flex;
    flex-wrap: wrap;
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
    padding: 2%;
`;

export const WalletList = () => {
    const { connect } = useWallet();

    const {
        state: {
            walletList: { open },
        },
        dispatch,
    } = useModal();

    const handleConnection = (wallet: string) => {
        connect(WALLETS[wallet].connector);
        dispatch({
            type: ActionTypes.CLOSE,
            payload: {
                modal: "walletList",
            },
        });
    };

    return (
        <Modal open={open} height={500} width={400}>
            <ModalContainer>
                {Object.keys(WALLETS).map((wallet) => {
                    const { connector, name } = WALLETS[wallet];
                    return (
                        <OptionContainer key={"wallet_" + wallet}>
                            <WalletOption
                                onClick={() => handleConnection(wallet)}
                            >
                                <WalletLogo
                                    src={`/media/wallets/${connector}.svg`}
                                />
                                <WalletName>{name}</WalletName>
                            </WalletOption>
                        </OptionContainer>
                    );
                })}
            </ModalContainer>
        </Modal>
    );
};
