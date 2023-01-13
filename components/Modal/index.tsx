import React, { useEffect, useRef } from "react";

import { ActionTypes, useModal } from "../../lib/contexts/modal";
import { ModalContainer } from "./styled";

enum ModalType {
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

    switch (type) {
      case ModalType.PROPOSAL:
        document.addEventListener("mousedown", handleClickOutsideProposal);
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

export const ProposalModal = ({ children, width, isOpen }: ModalProps) => {
  const modalRefProposal = useRef(null);
  useOutsideHandler(modalRefProposal, ModalType.PROPOSAL);

  return (
    <ModalContainer ref={modalRefProposal} width={width} isOpen={isOpen}>
      {children}
    </ModalContainer>
  );
};
