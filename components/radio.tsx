import React from "react";
import styled from "styled-components";

const Radio = styled.label`
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    padding: 5px 0;
    font-weight: 500;
    color: ${({ theme }) => theme.mainText};

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
        height: 22px;
        width: 22px;
        background-color: ${({ theme }) => theme.white};
        border-radius: 50%;
        margin-right: 1em;
        border: 1px solid ${({ theme }) => theme.accent1};
    }

    /* When the radio button is checked, add a blue background */
    input:checked ~ .checkmark {
        background-color: ${({ theme }) => theme.white};
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
        background: ${({ theme }) => theme.accent1};
        z-index: 9;
        height: 16px;
        width: 16px;
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
