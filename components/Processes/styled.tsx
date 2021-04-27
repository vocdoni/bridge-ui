import styled from "styled-components";
import RadioChoice from "../radio";

export const LightText = styled.p`
  color: ${({ theme }) => theme.blackAndWhite.b1};
`;

export const Question = styled.div`
  display: flex;
  @media ${({ theme }) => theme.screens.tablet} {
    flex-direction: column;
    text-align: center;
  }
`;

export const QuestionLeftSection = styled.div`
  flex: 6;
  h3 {
    margin-top: 10px;
  }
  @media ${({ theme }) => theme.screens.tablet} {
    flex: 12;
  }
`;

export const QuestionRightSection = styled.div`
  flex: 4;
  text-align: left;
  margin-left: 10%;

  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding-top: 50px;

  @media ${({ theme }) => theme.screens.tablet} {
    padding-top: 20px;
    width: 100%;
    flex: 0;
    margin-left: 0;
  }
`;

export const ChoiceResult = styled.div`
  display: flex;
  flex-direction: row;
`;

export const ChoicePercent = styled.div`
  flex: 1;
  margin-bottom: 1em;
`;

export const Box = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  color: ${({ theme }) => theme.blackAndWhite.w1};
  background-color: ${({ theme }) => theme.blackAndWhite.b1};
  width: 55px;
  height: 55px;
  border-radius: 50%;
`;

export const ChoiceText = styled.div`
  flex: 4;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
`;

export const VotesAmount = styled.span`
  margin-top: 0.4em;
`;

export const ChoiceDescription = styled.div`
  width: calc(100% - 2.5em);
`;

export const ProcessTitle = styled.h5`
  font-size: 32px;
  font-weight: 500;
  color: ${({ theme }) => theme.blackAndWhite.b1};
  margin-bottom: -5px;
  margin-top: 0px;
`;

export const ProcessDescription = styled.p`
  font-size: 18px;
  font-weight: 400;
  color: ${({ theme }) => theme.grayScale.g5};
`;

export const ProcessInformation = styled.div`
  display: flex;
  flex-direction: column;
  width: 70%;
  margin-right: 15px;
`;

export const ProcessContainer = styled.div`
  display: flex;
  margin-top: 50px;
  width: 1266px;
  margin-bottom: 60px;
`;

export const ProcessData = styled.div`
  width: 363px;
  height: 183px;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 13px;
  box-sizing: border-box;
  padding: 25px 26px;
  left: 0;
`;

export const ProcessDataInfo = styled.div`
  display: flex;
`;

export const ProcessDataContainer = styled.div`
  align-items: center;
  flex-direction: row;
  margin: 0;
  justify-content: space-between;
  width: 100%;
  padding-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  box-sizing: border-box;
`;

export const ProcessDataDescription = styled.p`
  font-size: 18px;
  font-weight: 400;
  color: ${({ theme }) => theme.grayScale.g5};
  margin: 0;
`;

export const ProcessDataValue = styled.p`
  font-size: 18px;
  font-weight: 400;
  color: ${({ theme }) => theme.blackAndWhite.b1};
  margin: 0;
`;

export const QuestionContainer = styled.div`
  width: 1266px;
  height: 328px;

  background: #ffffff;
  border: 1px solid #eff1f7;
  box-sizing: border-box;
  box-shadow: 0px 6px 6px rgba(180, 193, 228, 0.35);
  border-radius: 13px;
  display: flex;
  margin-bottom: 50px;
`;

export const QuestionInformation = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 52px 65px;
  max-width: 60%;
`;
export const QuestionNumber = styled.p`
  margin: 0;
  display: flex;
  font-size: 18px;
  font-weight: 400;
  color: ${({ theme }) => theme.primary.p1};
`;
export const QuestionTitle = styled.p`
  margin: 0;
  font-size: 32px;
  font-weight: 500;
  display: flex;
  color: ${({ theme }) => theme.blackAndWhite.b1};
  padding-bottom: 10px;
  padding-top: 5px;
`;
export const QuestionDescription = styled.div`
  display: flex;
  font-size: 18px;
  font-weight: 400;
  color: ${({ theme }) => theme.grayScale.g5};
`;

export const QuestionOptions = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
`;

export const OptionLabel = styled.label`
  display: flex;
  margin-bottom: 10px;
  align-items: center;
`;

export const Radio = styled.input`
  flex-direction: column;
  display: flex;

  background: #ffffff;

  border: 2px solid #eff1f7;
  box-sizing: border-box;
  box-shadow: inset 0px 2px 3px rgba(180, 193, 228, 0.25);
  border-radius: 26px;
`;

export const OptionTitleContainer = styled.div`
  margin-left: 10px;
  flex-direction: column;
  display: flex;
`;

export const OptionTitle = styled.p`
  margin: 0;
  font-size: 20px;
  font-weight: 500;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;
