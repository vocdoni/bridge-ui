import Link from "next/link";
import React from "react";

import { ISLAND_FLAG_IMG, MEDITATING_LADY_IMG } from "../../lib/constants";
import { ConnectWalletLink } from "../connect-button";
import { GrayRectangle, GrayRectangleTall } from "../gray-rectangle";
import { LightningBolt, GreyInfo, ExclamationMark, EndedInfo, WaitingImg } from "./styled";

export const NotConnected = ({ connectMessage = "" }: { connectMessage?: string }) => {
  return (
    <GrayRectangleTall>
      <LightningBolt />
      <GreyInfo>{connectMessage}</GreyInfo>
      <Link href="/tokens/add">
        <ConnectWalletLink />
      </Link>
    </GrayRectangleTall>
  );
};

export const NoTokens = () => {
  return (
    <GrayRectangleTall>
      <ExclamationMark />
      <GreyInfo>You are not a token holder</GreyInfo>
      {/* TODO add a link that motivates user to buy tokens [VR 21-05-2021] */}
      {/* <Link href="/tokens/add">
        <ConnectWalletLink />
      </Link> */}
    </GrayRectangleTall>
  );
};

export const NotStartedBanner = () => {
  return (
    <GrayRectangle>
      <WaitingImg src={MEDITATING_LADY_IMG} />
      <EndedInfo>The process has not yet started</EndedInfo>
    </GrayRectangle>
  );
};

export const HasFinishedBanner = () => {
  return (
    <GrayRectangle>
      <img src={ISLAND_FLAG_IMG} />
      <EndedInfo>The process has not yet started</EndedInfo>
    </GrayRectangle>
  );
};
