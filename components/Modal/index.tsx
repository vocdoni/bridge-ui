import React from "react";
import styled from "styled-components";

const ModalContainer = styled.div<{
    height: number;
    width: number;
    open: boolean;
}>`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-height: 100%;
    max-width: 100%;
    height: ${({ height }) => height}px;
    width: ${({ width }) => width}px;
    display: ${({ open }) => (open ? "flex" : "none")};
    background: white;
`;

export const Modal = ({ children, height = 400, width = 600, open }) => {
    return (
        <ModalContainer height={height} width={width} open={open}>
            {children}
        </ModalContainer>
    );
};
