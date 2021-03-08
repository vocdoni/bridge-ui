import styled from "styled-components";
import { useMessageAlert } from "../lib/hooks/message-alert";

export const MessageAlert = () => {
    const { message } = useMessageAlert();

    return (
        <AlertContainer visible={message?.length > 0}>
            <div>{message || ""}</div>
        </AlertContainer>
    );
};

const AlertContainer = styled.div<{ visible: boolean }>`
    position: fixed;
    z-index: 320;
    top: 10px;
    left: 10px;
    right: 10px;
    font-size: 90%;
    text-align: center;
    user-select: none;
    font-size: 16px;

    display: flex;
    justify-content: center;
    align-items: center;

    background-color: ${({ theme }) => theme.white};
    border: 1px solid ${({ theme }) => theme.lightBorder};
    border-radius: 4px;

    transform: ${({ visible }) => `translate(0px, ${visible ? 0 : 90} px)`};
    opacity: ${({ visible }) => (visible ? "1" : "0")};

    transition: transform 0.1s ease-out, opacity 0.1s ease-out;

    @media ${({ theme }) => theme.screens.tablet} {
        left: 15vw;
        right: 15vw;
    }

    @media ${({ theme }) => theme.screens.tablet} {
        justify-content: flex-end;
        text-align: right;
        top: 1, 0px;
        left: unset;
        max-width: 330px;
        right: 10px;
        transform: ${({ visible }) => `translate(${visible ? 0 : 360}px  0px)`};
    }
`;
