import { css } from "styled-components";

export const flex_mixin = css`
  display: flex;

  @media ${({ theme }) => theme.screens.tablet} {
    flex-direction: column;
  }
`;

export const spacer_mixin = css`
  & > :not(:last-child) {
    margin-right: 16px;
  }
  @media ${({ theme }) => theme.screens.tablet} {
    & > :not(:last-child) {
      margin-right: unset;
      margin-bottom: 8px;
    }
  }
`;
