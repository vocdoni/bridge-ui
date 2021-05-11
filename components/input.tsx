import styled from "styled-components";

const TextInput = styled.input`
  type: text;
  height: 46px;
  padding-left: 10px;
  width: 100%;
  border: 2px solid ${({ theme }) => theme.grayScale.g2};
  box-sizing: border-box;
  box-shadow: inset ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;
  ::placeholder {
    color: ${({ theme }) => theme.placeholderInputText.c1};
  }

  @media ${({ theme }) => theme.screens.tablet} {
    display: flex;
    width: 100%;
    margin-bottom: 9px;
  }
`;

export const DescriptionInput = styled.textarea<{ widthValue?: number }>`
  type: text;
  max-width: 735px;
  width: ${({ widthValue }) => (widthValue ? widthValue - 60 + "px" : "100%")};
  // min-width: ${({ widthValue }) => (widthValue ? widthValue - 265 + "px" : "100%")};
  min-width: 680px;
  height: 143px;
  padding-left: 10px;

  border: 2px solid ${({ theme }) => theme.grayScale.g2};
  box-sizing: border-box;
  box-shadow: inset ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;
  resize: none;
  ::placeholder {
    color: ${({ theme }) => theme.placeholderInputText.c1};
  }

  @media ${({ theme }) => theme.screens.tablet} {
    margin-left: 0;
    margin-top: 10px;
    display: flex;
    width: 100%;
    min-width: 100%;
  }
`;

export default TextInput;
