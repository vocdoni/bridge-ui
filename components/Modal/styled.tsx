import styled from "styled-components";

export const ModalContainer = styled.div<{
  width: number;
  isOpen: boolean;
}>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 100%;
  max-width: 100%;
  width: ${({ width }) => width}px;
  display: ${({ isOpen: isOpen }) => (isOpen ? "flex" : "none")};
  background: white;
  border-radius: 6px;
  filter: drop-shadow(0px 7px 16px rgba(0, 0, 0, 0.25));
  z-index: 2;
`;

export const ModalLayout = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #dfe3e8;
`;

export const ModalTitle = styled.div`
  flex-direction: column;
  padding-bottom: 10px;
  box-sizing: border-box;
  margin-top: 8px;
  padding-left: 16px;
  font-family: "Manrope", sans-serif !important;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  color: #637381;
`;

export const CloseIcon = styled.div`
  flex-direction: column;
  margin-top: 10px;
  padding-right: 16px;
  cursor: pointer;
`;
