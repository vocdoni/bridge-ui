import styled from "styled-components";

/**
 * Adds vertical space between two elements.
 *
 * The component has a height of 16 or 8 on mobile, and can be repeated any number of time
 * using the repeats variable.
 */
export const VerticalSpace = styled.div<{ repeats?: number }>`
  height: ${({ repeats }) => (repeats > 0 ? repeats * 16 : "16")}px;

  @media ${({ theme }) => theme.screens.tablet} {
    height: ${({ repeats }) => (repeats > 0 ? repeats * 8 : "8")}px;
  }
`;
