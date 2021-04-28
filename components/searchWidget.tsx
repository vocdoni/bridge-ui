import React from "react";
import styled from "styled-components";

import Button from "./button";

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

const SearchButton = styled(Button)`
  width: 140px;
  height: 46px;
  padding: 12px 20px;
  margin-left: 10px;
  background: linear-gradient(
    ${({ theme }) => theme.gradients.primary.mg1.a},
    ${({ theme }) => theme.gradients.primary.mg1.c1},
    ${({ theme }) => theme.gradients.primary.mg1.c2}
  );
  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;
  color: ${({ theme }) => theme.blackAndWhite.w1};
  font-size: 16px;
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
      <SearchButton onClick={onClick}>Check Token</SearchButton>
    </SearchRow>
  );
};

export default SearchWidget;
