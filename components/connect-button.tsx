import { useMemo } from "react";
import { useRouter } from "next/router";
import {
    Button,
    IconEthereum,
    IconPower,
    AddressField,
    LoadingRing,
} from "@aragon/ui";
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
    const { pathname, push } = useRouter();
    const { status, networkName, reset, error, account } = useWallet();
    const { loading: poolLoading } = usePool();

    const openWallets = () => {
        dispatch({
            type: ActionTypes.OPEN_WALLET_LIST,
        });
    };

    const isConnected = status == "connected";
    const inLanding = pathname === "/";
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

        return isConnected ? "Show dashboard" : "Connect to Wallet";
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

        if (inLanding && isConnected) {
            push("/dashboard");
            return;
        }

        openWallets();
    };

    if (isConnected && !inLanding) {
        return (
            <div id="wallet-status" className="v-center">
                <WalletAddress account={account} reset={reset} />
            </div>
        );
    }

    return (
        <Button
            wide
            icon={loadingOrConnecting ? <LoadingRing /> : <IconEthereum />}
            mode={mode}
            onClick={handleButtonClick}
            label={label}
        />
    );
};
