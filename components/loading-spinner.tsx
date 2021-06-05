import React from "react";
import styled from "styled-components";
import Spinner from "react-svg-spinner";

const SpinnerContainer = styled.div<{ fullPage?: boolean }>`
  position: ${({ fullPage }) => (fullPage ? "absolute" : "relative")};
  width: 88px;
  height: 82px;
  top: calc(50% - 41px);
  left: calc(50% - 44px);
  text-align: center;
`;

export const LoadingSpinner = (props: { fullPage?: boolean }) => (
  <SpinnerContainer fullPage={props.fullPage}>
    Loading...
    <br />
    <br />
    <Spinner />
  </SpinnerContainer>
);
