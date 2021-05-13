import styled from "styled-components";
import BaseSpinner from "react-svg-spinner";

export const Spinner = styled(BaseSpinner)`
  color: ${({ theme }) => theme.accent2};
`;
