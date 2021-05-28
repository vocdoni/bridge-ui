import React from "react";
import styled from "styled-components";
import { useRouter } from "next/router";

import { ProposalModal } from ".";
import { ActionTypes, useModal } from "./context";

const Layout = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #dfe3e8;
`;

const ModalTitle = styled.div`
  flex-direction: column;
  padding-bottom: 10px;
  box-sizing: border-box;
  margin-top: 10px;
  padding-left: 16px;
  font-family: "Manrope", sans-serif !important;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  color: #637381;
`;

const Body = styled.div`
  height: 100%;
  padding: 24px 24px 15px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;

  & > :last-child {
    margin-top: 10px;
  }

  @media ${({ theme }) => theme.screens.mobileL} {
    overflow-y: auto;
    justify-content: center;
    & > div:last-child {
      padding-bottom: 20px;
    }
  }
`;

const OptionContainer = styled.div`
  width: 100%;
  margin-bottom: 12px;
  padding: 24px 30px 18px 30px;
  items-align: left;
  box-sizing: border-box;
  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  border: 2px solid ${({ theme }) => theme.grayScale.g2};
  border-radius: 16px;
  white-space: normal;
  cursor: pointer;

  @media ${({ theme }) => theme.screens.tablet} {
    margin-top: 10px;
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

const CloseIcon = styled.div`
  flex-direction: column;
  margin-top: 10px;
  padding-right: 16px;
  cursor: pointer;
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
    push({ pathname: "/processes/new/", query: { address: address, type: proposalType } });
    closeModal();
  }

  return (
    <ProposalModal open={state.proposalList.open} height={368} width={468}>
      <Layout>
        <Header>
          <ModalTitle>New Proposal</ModalTitle>
          <CloseIcon onClick={closeModal}>
            <img src="/media/close.svg" />
          </CloseIcon>
        </Header>
        <Body>
          <OptionContainer onClick={() => onChoice("signaling")}>
            <OptionTitle>{PROPOSAL_TYPES[1].title}</OptionTitle>
            <OptionDescription>{PROPOSAL_TYPES[1].description}</OptionDescription>
          </OptionContainer>
          <OptionContainer onClick={() => onChoice("binding")}>
            <OptionTitle>{PROPOSAL_TYPES[0].title}</OptionTitle>
            <OptionDescription>{PROPOSAL_TYPES[0].description}</OptionDescription>
          </OptionContainer>
        </Body>
      </Layout>
    </ProposalModal>
  );
};

const PROPOSAL_TYPES = [
  {
    title: "On-chain proposal",
    description: "Metadata is stored on Ethereum, increasing decentralization and verifiability",
  },
  {
    title: "Signaling proposal",
    description: "Gasless proposal creation using Vochain layer 2 solution",
  },
];
