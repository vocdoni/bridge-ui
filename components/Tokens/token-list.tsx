import styled from "styled-components";

export const TokenList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;

  @media ${({ theme }) => theme.screens.mobileL} {
    margin-top: 10px;
  }
`;
