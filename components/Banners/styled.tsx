import styled from "styled-components";
import { LIGHTNING_ICON, WARNING_ICON } from "../../lib/constants";

export const GreyInfo = styled.p`
  max-width: 98%;
  text-align: center;
  font-size: 18px;
  @media ${({ theme }) => theme.screens.tablet} {
    font-size: 16px;
    width: 100%;
    height: 100%;
    text-align: center;
  }
`;

export const WaitingImg = styled.img`
  margin-top: 16px;
  margin-bottom: 8px;
  width: 200px;
`;

export const EndedContainer = styled.div`
  width: 100%;
  max-width: 1266px;
  border-radius: 13px;
  background: ${({ theme }) => theme.backgroundGray.bg1};
  text-align: center;
`;

export const EndedInfo = styled.p`
  margin-top: 0px;
  margin-bottom: 24px;
  font-size: 18px;
  font-weight: 400;
`;

export const LightningBolt = styled.div`
  margin: 15px auto;
  background: url(${LIGHTNING_ICON});
  background-repeat: no-repeat;
  width: 52px;
  height: 54px;
`;

export const ExclamationMark = styled.div`
  margin: 15px auto;
  background: url(${WARNING_ICON});
  background-repeat: no-repeat;
  width: 55px;
  height: 52px;
`;
