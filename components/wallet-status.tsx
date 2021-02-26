import {
    ChainUnsupportedError,
    ConnectionRejectedError,
    useWallet,
} from "use-wallet";
import {
    LoadingRing,
    IconPower,
    IconEthereum,
    Button,
    AddressField,
} from "@aragon/ui";
import styled from "styled-components";

const WalletContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    font-weight: 500;
    margin-bottom: 0.7em;

    input[type="text"] {
        border: 1px solid #dde4e9;
        background-color: inherit;
        padding: inherit;
        margin-top: inherit;
        border-radius: 0.0001px 4px 4px 0.0001px;

        padding: 0 38px 0 12px;
    }
`;

const Wallet = () => {
    const wallet = useWallet();
    const activate = () =>
        wallet.connect("injected").catch((err) => console.error(err));
    // Error?
    // @TODO: Maybe improve this if
    if (wallet.error?.name) {
        const networkNotSupported =
            wallet.error instanceof ChainUnsupportedError;
        const userRejectedConnection =
            wallet.error instanceof ConnectionRejectedError;

        const label = networkNotSupported
            ? `${wallet.networkName} is not enabled`
            : userRejectedConnection
            ? "Wallet connection rejected"
            : "Web3 is unavailable";

        return (
            <Button mode="negative" wide label={label} onClick={wallet.reset} />
        );
    } else if (wallet.status === "connecting") {
        return (
            <Button
                label={"Connecting to " + wallet.networkName}
                icon={<LoadingRing />}
                wide
                onClick={wallet.reset}
            />
        );
    } else if (wallet.status === "connected") {
        const icon = (
            <Button icon={<IconPower />} size="mini" onClick={wallet.reset} />
        );

        return <AddressField address={wallet.account} icon={icon} />;
    }

    return (
        <Button
            label="Connect with MetaMask"
            icon={<IconEthereum />}
            wide
            onClick={activate}
        />
    );
};

export const WalletStatus = () => (
    <WalletContainer>
        <Wallet />
    </WalletContainer>
);
