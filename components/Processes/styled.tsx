import styled from "styled-components";

export const ProcessTitle = styled.h5`
  font-size: 32px;
  font-weight: 500;
  color: ${({ theme }) => theme.blackAndWhite.b1};
  margin-bottom: -5px;
  margin-top: 0px;
  word-break: break-word;
`;

export const ProcessDescription = styled.p`
  font-size: 18px;
  font-weight: 400;
  color: ${({ theme }) => theme.grayScale.g5};
  word-break: break-word;
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
  max-width: 1266px;
  margin-bottom: 60px;

  @media ${({ theme }) => theme.screens.tablet} {
    flex-direction: column;
  }
`;

export const ProcessData = styled.div`
  width: 363px;
  min-height: 183px;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 13px;
  box-sizing: border-box;
  padding: 25px 26px;

  @media ${({ theme }) => theme.screens.tablet} {
    width: 100%;
  }
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
  max-width: 1266px;
  min-height: 328px;

  background: #ffffff;
  border: 1px solid #eff1f7;
  box-sizing: border-box;
  box-shadow: 0px 6px 6px rgba(180, 193, 228, 0.35);
  border-radius: 13px;
  display: flex;
  margin-bottom: 50px;
  padding: 0 65px;

  @media ${({ theme }) => theme.screens.tablet} {
    flex-direction: column;
    padding: 0 26px;
  }
`;

export const QuestionInformation = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 52px 70px 52px 0;
  width: 100%;
  @media ${({ theme }) => theme.screens.tablet} {
    padding: 0;
  }
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
  word-break: break-word;
`;
export const QuestionDescription = styled.div`
  display: flex;
  font-size: 18px;
  font-weight: 400;
  line-height: 150%;
  color: ${({ theme }) => theme.grayScale.g5};
  margin-bottom: 30px;
  word-break: break-word;
`;

export const QuestionOptions = styled.div`
  display: flex;
  width: 40%;
  flex-direction: column;
  justify-content: center;

  @media ${({ theme }) => theme.screens.tablet} {
    width: 100%;
  }
`;

export const OptionLabel = styled.label`
  display: flex;
  margin-bottom: 15px;
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
  margin-left: 18px;
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

export const ChoiceInfo = styled.div`
  width: 58px;
  height: 58px;
  border-radius: 50px;
  align-items: center;
  display: flex;
  justify-content: center;
  background: ${({ theme }) =>
    `linear-gradient(142.6deg, ${theme.gradients.primary.mg1_soft.c3}33, ${theme.gradients.primary.mg1.c3}D4)`};
`;

export const Percentage = styled.h5`
  color: ${({ theme }) => theme.blackAndWhite.w1};
  font-size: 14px;
  font-weight: bold;
`;

export const EndedContainer = styled.div`
  width: 100%;
  height: 249px;

  background: #eef4fb;
  text-align: center;
  border-radius: 13px;
`;

export const EndedInfo = styled.p`
  font-size: 18px;
  font-weight: 400;
  color: ${({ theme }) => theme.grayScale.g5};
  margin: 0;
  margin-top: -15px;
`;
