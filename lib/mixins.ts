import { css } from "styled-components";

export const flex_row_large_column_small_mixin = css`
  display: flex;

  @media ${({ theme }) => theme.screens.tablet} {
    flex-direction: column;
  }
`;

/* TODO make this take variable margins. */
export const space_between_children_mixin = css`
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
