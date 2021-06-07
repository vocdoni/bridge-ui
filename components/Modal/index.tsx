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

export const WalletModal = ({ children, width = 600, open }) => {
  const modalRefWallet = useRef(null);
  useOutsideAlerter(modalRefWallet);

  return (
    <ModalContainer ref={modalRefWallet} width={width} open={open}>
      {children}
    </ModalContainer>
  );
};

export const ProposalModal = ({ children, width = 600, open }) => {
  const modalRefProposal = useRef(null);
  useOutsideAlerterProposal(modalRefProposal);

  return (
    <ModalContainer ref={modalRefProposal} width={width} open={open}>
      {children}
    </ModalContainer>
  );
};
