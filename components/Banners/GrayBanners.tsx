import Link from "next/link";
import React from "react";
import { ISLAND_FLAG_IMG, MEDITATING_LADY_IMG, PEOPLE_IMG } from "../../lib/constants";
import { ConnectWalletLink } from "../connect-button";
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

export const Loading = () => {
  return (
    <GrayRectangleLoading>
      <GreyInfo>Loading...</GreyInfo>
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
