import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { ActionTypes, useModal } from "./context";

const WalletModalContainer = styled.div<{
  height: number;
  width: number;
  open: boolean;
}>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 100%;
  max-width: 100%;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
  display: ${({ open }) => (open ? "flex" : "none")};
  background: white;
  border-radius: 6px;
  filter: drop-shadow(0px 7px 16px rgba(0, 0, 0, 0.25));
  z-index: 2;
`;

const ProposalModalContainer = styled.div<{
  height: number;
  width: number;
  open: boolean;
}>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 100%;
  max-width: 100%;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
  display: ${({ open }) => (open ? "flex" : "none")};
  background: white;
  border-radius: 6px;
  filter: drop-shadow(0px 7px 16px rgba(0, 0, 0, 0.25));
  z-index: 2;
`;

function useOutsideAlerter(ref) {
  const { dispatch } = useModal();
  useEffect(() => {
    function handleClickOutside(event) {
      const isOutside = !ref.current.contains(event.target);
      if (ref.current && isOutside) {
        dispatch({
          type: ActionTypes.CLOSE_WALLET_LIST,
        });
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

function useOutsideAlerterProposal(ref) {
  const { dispatch } = useModal();
  useEffect(() => {
    function handleClickOutside(event) {
      const isOutside = !ref.current.contains(event.target);
      if (ref.current && isOutside) {
        dispatch({
          type: ActionTypes.CLOSE_PROPOSAL_LIST,
        });
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

export const WalletModal = ({ children, height = 400, width = 600, open }) => {
  const modalRefWallet = useRef(null);
  useOutsideAlerter(modalRefWallet);

  return (
    <WalletModalContainer ref={modalRefWallet} height={height} width={width} open={open}>
      {children}
    </WalletModalContainer>
  );
};

export const ProposalModal = ({ children, height = 400, width = 600, open }) => {
  const modalRefProposal = useRef(null);
  useOutsideAlerterProposal(modalRefProposal);

  return (
    <ProposalModalContainer ref={modalRefProposal} height={height} width={width} open={open}>
      {children}
    </ProposalModalContainer>
  );
};
