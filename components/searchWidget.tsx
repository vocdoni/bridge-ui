import React from "react";
import styled from "styled-components";

import { NormalButton } from "./button";
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
      <TextInput placeholder="ERC Token address..." onKeyDown={onKeyDown} onChange={onChange} />
      <NormalButton onClick={onClick}>Check Token</NormalButton>
    </SearchRow>
  );
};

export default SearchWidget;
