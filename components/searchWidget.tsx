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
  
  const Button = styled(PrimaryButton)`
  @media ${({ theme }) => theme.screens.tablet} {
    margin-left: 0;
    margin-top: 10px;
  }
`;

const Box = styled.div`
  display: flex;
  margin-right: 10px;
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
        <TextInput
          placeholder="ERC Token address..."
          onKeyDown={onKeyDown}
          onChange={onChange}
          widthValue={664}
        />
      </Box>
      <PrimaryButton onClick={loading ? null : onClick}>
        {loading ? <StyledSpinner /> : "Check token"}
      </PrimaryButton>
    </SearchRow>
  );
};

export default SearchWidget;
