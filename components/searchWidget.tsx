import React from "react";
import styled from "styled-components";

import Button, { NormalButton } from "./button";

const SearchRow = styled.div`
  display: flex;
`;

const SearchField = styled.input`
  type: text;
  width: 394px;
  height: 46px;
  padding-left: 10px;
  border: 2px solid ${({ theme }) => theme.grayScale.g2};
  box-sizing: border-box;
  box-shadow: inset ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;
`;

type SearchWidgetProps = {
  onChange: (ev: any) => void;
  onKeyDown: (ev: any) => void;
  onClick: () => void;
};

const SearchWidget = ({ onChange, onKeyDown, onClick }: SearchWidgetProps) => {
  return (
    <SearchRow>
      <SearchField placeholder="ERC Token address..." onKeyDown={onKeyDown} onChange={onChange} />
      <NormalButton onClick={onClick}>Check Token</NormalButton>
    </SearchRow>
  );
};

export default SearchWidget;
