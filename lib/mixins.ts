import { css } from "styled-components";

export const flex_mixin = css`
  display: flex;

  @media ${({ theme }) => theme.screens.tablet} {
    flex-direction: column;
  }
`;
