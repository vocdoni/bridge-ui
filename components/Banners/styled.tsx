import styled from "styled-components";
import { LIGHTNING_ICON, WARNING_ICON } from "../../lib/constants";

export const GrayRectangle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.backgroundGray.bg1};
  width: 100%;
  min-height: 161px;
  border-radius: 13px;
  color: ${({ theme }) => theme.grayScale.g5};
  font-family: "Manrope", sans-serif !important;
  max-width: 1266px;
`;

export const GrayRectangleTall = styled(GrayRectangle)`
  min-height: 227px;
`;

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

export const SizedImg = styled.img`
  margin-top: 16px;
  margin-bottom: 8px;
  width: 200px;
`;

export const GrayInfoMargined = styled(GreyInfo)`
  margin-top: 0px;
  margin-bottom: 24px;
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
