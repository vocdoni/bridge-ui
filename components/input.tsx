import styled from "styled-components";

const TextInput = styled.input<{ widthValue: number }>`
  type: text;
  width: ${({ widthValue }) => widthValue}px;
  height: 46px;
  padding-left: 10px;

  border: 2px solid ${({ theme }) => theme.grayScale.g2};
  box-sizing: border-box;
  box-shadow: inset ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;

  @media ${({ theme }) => theme.screens.tablet} {
    display: flex;
    width: 100%;
  }
`;

export const DescriptionInput = styled.textarea`
  @media ${({ theme }) => theme.screens.tablet} {
    display: flex;
    width: 100%;
    margin-left: 0;
    margin-top: 10px;
  }
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
`;

export default TextInput;
