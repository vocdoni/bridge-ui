import styled from "styled-components";

export const TextInput = styled.input`
  flex: 4;
  height: 46px;
  padding-left: 10px;
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

export const DescriptionInput = styled.textarea`
  width: 100%;
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
    width: 100%;
  }
`;
