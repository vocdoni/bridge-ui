import React, { ButtonHTMLAttributes, ThHTMLAttributes } from "react";
import styled from "styled-components";

import { StyledSpinner } from "../pages/tokens/add";
import { PrimaryButton } from "./button";
import TextInput from "./input";

const SearchRow = styled.div`
  display: flex;
  @media ${({ theme }) => theme.screens.tablet} {
    flex-direction: column;
  }
`;

const Box = styled.div`
  flex-grow: 1;
  margin-right: 9px;
  max-width: 664px;
  @media ${({ theme }) => theme.screens.tablet} {
    margin-right: 0px;
  }
`;

type SearchWidgetProps = {
  onChange: (ev: any) => void;
  onKeyDown: (ev: any) => void;
  onClick: () => void;
  loading: boolean;
};

const SearchWidget = ({ onChange, onKeyDown, onClick, loading }: SearchWidgetProps) => {
  return (
    <SearchRow>
      <Box>
        <TextInput placeholder="ERC Token address..." onKeyDown={onKeyDown} onChange={onChange} />
      </Box>
      <PrimaryButton onClick={loading ? null : onClick}>
        {loading ? <StyledSpinner /> : "Validate contract"}
      </PrimaryButton>
    </SearchRow>
  );
};

export default SearchWidget;
