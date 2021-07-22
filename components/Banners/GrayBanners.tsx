import Link from "next/link";
import React from "react";
import { ISLAND_FLAG_IMG, MEDITATING_LADY_IMG, PEOPLE_IMG } from "../../lib/constants/url";
import { ConnectWalletLink } from "../ControlElements/connect-button";
import {
  LightningBolt,
  GreyInfo,
  ExclamationMark,
  GrayInfoMargined,
  SizedImg,
  GrayRectangle,
  GrayRectangleTall,
  GrayRectangleLoading,
} from "./styled";

export const Loading = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <GrayRectangleLoading>
      <GreyInfo>{message}</GreyInfo>
    </GrayRectangleLoading>
  );
};

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

export const NoTokensAtCreation = ({ stillNoTokens = false, tokenSymbol }) => {
  const token = !tokenSymbol ? "tokens" : tokenSymbol;
  const message = stillNoTokens
    ? `You can't vote because you don't hold any ${token}`
    : `You can't vote because you didn't hold ${token} when the proposal was created`;
  return (
    <GrayRectangleTall>
      <ExclamationMark />
      <GreyInfo>{message}</GreyInfo>
    </GrayRectangleTall>
  );
};

export const NotStartedBanner = () => {
  return (
    <GrayRectangle>
      <SizedImg src={MEDITATING_LADY_IMG} />
      <GrayInfoMargined>The process has not yet started</GrayInfoMargined>
    </GrayRectangle>
  );
};

export const HasFinishedBanner = () => {
  return (
    <GrayRectangle>
      <img src={ISLAND_FLAG_IMG} />
      <GrayInfoMargined>The process has finished</GrayInfoMargined>
    </GrayRectangle>
  );
};

export const AlreadyVotedBanner = () => {
  return (
    <GrayRectangle>
      <SizedImg src={PEOPLE_IMG} />
      <GrayInfoMargined>You have already voted</GrayInfoMargined>
    </GrayRectangle>
  );
};
