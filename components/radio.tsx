import React from "react";
import styled from "styled-components";

const Radio = styled.label`
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  padding: 5px 0;
  font-size: 16px;
  font-weight: 400;
  color: ${({ theme }) => theme.blackAndWhite.b1};

  display: flex;
  flex-direction: row;
  align-items: center;

  /* Hide the browser's default radio button */
  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
  }

  /* Create a custom radio button */
  .checkmark {
    height: 24px;
    width: 24px;
    box-sizing: border-box;
    box-shadow: inset ${({ theme }) => theme.shadows.buttonShadow};
    background-color: ${({ theme }) => theme.blackAndWhite.w1};
    border-radius: 26px;
    margin-right: 1em;
    border: 2px solid ${({ theme }) => theme.grayScale.g2};
  }

  /* When the radio button is checked, add a blue background */
  input:checked ~ .checkmark {
    background-color: ${({ theme }) => theme.blackAndWhite.w1};
  }

  /* Create the indicator (the dot/circle - hidden when not checked) */
  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }

  /* Show the indicator (dot/circle) when checked */
  input:checked ~ .checkmark:after {
    display: block;
  }

  /* Style the indicator (dot/circle) */
  .checkmark:after {
    border-radius: 50%;
    box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
    background: linear-gradient(
      ${({ theme }) => theme.gradients.primary.mg1.a},
      ${({ theme }) => theme.gradients.primary.mg1.c1},
      ${({ theme }) => theme.gradients.primary.mg1.c2}
    );
    z-index: 9;
    height: 14px;
    width: 14px;
    margin: 3px;
  }
`;

const RadioChoice = ({
  onClick,
  children,
}: {
  onClick: (args: unknown) => void;
  children: React.ReactNode;
}) => <Radio onClick={onClick}>{children}</Radio>;

RadioChoice.Style = Radio;
export default RadioChoice;
