import React, { useEffect, useRef } from "react";

import { ActionTypes, useModal } from "./context";
import { ModalContainer } from "./styled";

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

type ModalProps = {
  children: any;
  width: number;
  isOpen: boolean;
};

export const WalletModal = ({ children, width, isOpen }: ModalProps) => {
  const modalRefWallet = useRef(null);
  useOutsideAlerter(modalRefWallet);

  return (
    <ModalContainer ref={modalRefWallet} width={width} isOpen={isOpen}>
      {children}
    </ModalContainer>
  );
};

export const ProposalModal = ({ children, width, isOpen }: ModalProps) => {
  const modalRefProposal = useRef(null);
  useOutsideAlerterProposal(modalRefProposal);

  return (
    <ModalContainer ref={modalRefProposal} width={width} isOpen={isOpen}>
      {children}
    </ModalContainer>
  );
};
