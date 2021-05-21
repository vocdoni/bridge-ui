import styled from "styled-components";

export const GrayRectangle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.backgroundGray.bg1};
  width: 100%;
  min-height: 161px;
  border-radius: 13px;
  color: ${({ theme }) => theme.grayScale.g5};
  font-family: "Manrope", sans-serif !important;
  max-width: 1266px;
`;

export const GrayRectangleTall = styled(GrayRectangle)`
  min-height: 227px;
`;
