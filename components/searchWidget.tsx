import React from "react";
import styled from "styled-components";

import { PrimaryButton } from "./button";
import TextInput from "./input";

const SearchRow = styled.div`
  display: flex;
`;

const Box = styled.div`
  display: flex;
  margin-right: 10px;
`;

type SearchWidgetProps = {
  onChange: (ev: any) => void;
  onKeyDown: (ev: any) => void;
  onClick: () => void;
};

const SearchWidget = ({ onChange, onKeyDown, onClick }: SearchWidgetProps) => {
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
        <PrimaryButton onClick={onClick}>Check token</PrimaryButton>
    </SearchRow>
  );
};

export default SearchWidget;
