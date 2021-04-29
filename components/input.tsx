import styled from "styled-components";

const TextInput = styled.input`
  type: text;
  width: 638px;
  height: 46px;
  padding-left: 10px;
  text-family: "Manrope";
  border: 2px solid ${({ theme }) => theme.grayScale.g2};
  box-sizing: border-box;
  box-shadow: inset ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;
`;

export const DescriptionInput = styled.textarea`
  type: text;
  width: 638px;
  height: 100px;
  padding-left: 10px;
  text-family: "Manrope";
  border: 2px solid ${({ theme }) => theme.grayScale.g2};
  box-sizing: border-box;
  box-shadow: inset ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;
`;

export default TextInput;
