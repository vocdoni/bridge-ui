import React from "react";
import styled from "styled-components";

import { PrimaryButton } from "./button";
import TextInput from "./input";

const SearchRow = styled.div`
  display: flex;
`;

type SearchWidgetProps = {
  onChange: (ev: any) => void;
  onKeyDown: (ev: any) => void;
  onClick: () => void;
};

const SearchWidget = ({ onChange, onKeyDown, onClick }: SearchWidgetProps) => {
  return (
    <SearchRow>
      <TextInput
        placeholder="ERC Token address..."
        onKeyDown={onKeyDown}
        onChange={onChange}
        widthValue={664}
      />
      <PrimaryButton onClick={onClick}>Check Token</PrimaryButton>
    </SearchRow>
  );
};

export default SearchWidget;
