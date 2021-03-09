import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Button, IconEthereum, IconPower, AddressField } from "@aragon/ui";
import { usePool } from "@vocdoni/react-hooks";
import {
    ChainUnsupportedError,
    ConnectionRejectedError,
    useWallet,
} from "use-wallet";

import { useModal, ActionTypes } from "./Modal/context";

const WalletAddress = ({ reset, account }) => {
    const icon = <Button icon={<IconPower />} size="mini" onClick={reset} />;
    return <AddressField address={account} icon={icon} />;
};

export const ConnectButton = () => {
    const { dispatch } = useModal();
    const { pathname } = useRouter();
    const { status, networkName, reset, error, account } = useWallet();
    const { loading: poolLoading } = usePool();

    const openWallets = () => {
        dispatch({
            type: ActionTypes.OPEN_WALLET_LIST,
        });
    };

    const isConnected = status == "connected";
    const notInLanding = pathname === "/";
    const loadingOrConnecting = poolLoading || status === "connecting";

    const label = useMemo(() => {
        if (poolLoading) return "Connecting to Vocdoni";
        if (status === "connecting") return "Connecting to " + networkName;

        if (error instanceof ChainUnsupportedError) {
            return networkName + " is not enabled";
        }

        if (error instanceof ConnectionRejectedError) {
            return "Wallet connection rejected";
        }

        return isConnected ? "Show dashboard" : "Connect to wallet";
    }, [poolLoading, status, error]);

    const mode = useMemo(() => {
        if (error) return "negative";
        if (loadingOrConnecting) return "normal";

        return "strong";
    }, [error, loadingOrConnecting]);

    const handleButtonClick = async () => {
        if (loadingOrConnecting) {
            reset();
            return;
        }
        openWallets();
    };

    if (isConnected && notInLanding) {
        return (
            <div id="wallet-status" className="v-center">
                <WalletAddress account={account} reset={reset} />
            </div>
        );
    }

    return <Button mode={mode} onClick={handleButtonClick} label={label} />;
};
