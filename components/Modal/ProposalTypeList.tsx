import React from "react";
import styled from "styled-components";
import { useRouter } from "next/router";

import { EventType, trackEvent } from "../../lib/analytics";

import { ProposalModal } from ".";
import { ActionTypes, useModal } from "./context";
import { ModalLayout, ModalHeader, ModalTitle, CloseIcon } from "./styled";

const Body = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media ${({ theme }) => theme.screens.mobileL} {
    overflow-y: auto;
    justify-content: center;
  }
`;

const OptionContainer = styled.div`
  width: 100%;
  margin-bottom: 16px;
  padding: 24px 30px 18px 30px;
  items-align: left;
  box-sizing: border-box;
  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  border: 2px solid ${({ theme }) => theme.grayScale.g2};
  border-radius: 16px;
  white-space: normal;
  cursor: pointer;

  & :last-of-type {
    margin-bottom: 0px;
  }
`;

const OptionTitle = styled.h4`
  margin: 0px;
  display: flex;
  font-size: 18px;
  font-style: normal;
  line-height: 150%;
`;

const OptionDescription = styled.p`
  margin: 0px;
  display: flex;
  color: ${({ theme }) => theme.grayScale.g5};
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 150%;
`;

export const ProposalTypeList = () => {
  const { push, asPath } = useRouter();
  const { state, dispatch } = useModal();
  const address = asPath.split("/").pop();

  const closeModal = () => {
    dispatch({
      type: ActionTypes.CLOSE_PROPOSAL_LIST,
    });
  };

  function onChoice(proposalType) {
    trackEvent(EventType.PROPOSAL_TYPE_CHOSEN, { binding_type: proposalType });
    push({ pathname: "/processes/new/", query: { address: address, type: proposalType } });
    closeModal();
  }

  return (
    <ProposalModal isOpen={state.proposalList.open} width={468}>
      <ModalLayout>
        <ModalHeader>
          <ModalTitle>New proposal</ModalTitle>
          <CloseIcon onClick={closeModal}>
            <img src="/media/close.svg" />
          </CloseIcon>
        </ModalHeader>
        <Body>
          {PROPOSAL_TYPES_INFO.map((pt) => (
            <OptionContainer
              key={`${pt.title}_${pt.description}`}
              onClick={() => onChoice(pt.type)}
            >
              <OptionTitle>{pt.title}</OptionTitle>
              <OptionDescription>{pt.description}</OptionDescription>
            </OptionContainer>
          ))}
        </Body>
      </ModalLayout>
    </ProposalModal>
  );
};

const PROPOSAL_TYPES_INFO = [
  {
    type: "signaling",
    title: "Signaling proposal",
    description: "Gasless proposal creation using Vochain layer 2 solution",
  },
  {
    type: "binding",
    title: "On-chain proposal",
    description: "Metadata is stored on Ethereum, increasing decentralization and verifiability",
  },
];
