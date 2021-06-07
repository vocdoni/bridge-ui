import React, { useEffect, useRef } from "react";

import { ActionTypes, useModal } from "./context";
import { ModalContainer } from "./styled";

enum ModalType {
  WALLET,
  PROPOSAL,
}

function useOutsideHandler(ref, type: ModalType) {
  const { dispatch } = useModal();
  useEffect(() => {
    function handleClickOutsideProposal(event) {
      const isOutside = !ref.current.contains(event.target);
      if (ref.current && isOutside) {
        dispatch({
          type: ActionTypes.CLOSE_PROPOSAL_LIST,
        });
      }
    }
    function handleClickOutsideWallet(event) {
      const isOutside = !ref.current.contains(event.target);
      if (ref.current && isOutside) {
        dispatch({
          type: ActionTypes.CLOSE_WALLET_LIST,
        });
      }
    }

    switch (type) {
      case ModalType.PROPOSAL:
        document.addEventListener("mousedown", handleClickOutsideProposal);
        break;
      case ModalType.WALLET:
        document.addEventListener("mousedown", handleClickOutsideWallet);
        break;
      default:
        break;
    }

    // Bind the event listener
    return () => {
      // Unbind the event listener on clean up
      switch (type) {
        case ModalType.PROPOSAL:
          document.removeEventListener("mousedown", handleClickOutsideProposal);
          break;
        case ModalType.WALLET:
          document.removeEventListener("mousedown", handleClickOutsideWallet);
          break;
        default:
          break;
      }
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
  useOutsideHandler(modalRefWallet, ModalType.WALLET);

  return (
    <ModalContainer ref={modalRefWallet} width={width} isOpen={isOpen}>
      {children}
    </ModalContainer>
  );
};

export const ProposalModal = ({ children, width, isOpen }: ModalProps) => {
  const modalRefProposal = useRef(null);
  useOutsideHandler(modalRefProposal, ModalType.PROPOSAL);

  return (
    <ModalContainer ref={modalRefProposal} width={width} isOpen={isOpen}>
      {children}
    </ModalContainer>
  );
};
