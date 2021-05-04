import styled from "styled-components";

const TextInput = styled.input<{ widthValue?: number }>`
  type: text;
  width: ${({ widthValue }) => (widthValue ? widthValue + "px" : "unset")};
  height: 46px;
  padding-left: 10px;

  border: 2px solid ${({ theme }) => theme.grayScale.g2};
  box-sizing: border-box;
  box-shadow: inset ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;
  @media ${({ theme }) => theme.screens.tablet} {
    width: 100%;
  }
`;

export const DescriptionInput = styled.textarea`
  type: text;
  width: 735px;
  min-width: 735px;
  height: 143px;
  padding-left: 10px;

  border: 2px solid ${({ theme }) => theme.grayScale.g2};
  box-sizing: border-box;
  box-shadow: inset ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;
  resize: none;

  @media ${({ theme }) => theme.screens.tablet} {
    width: 100%;
    min-width: unset;
  }
`;

export default TextInput;
