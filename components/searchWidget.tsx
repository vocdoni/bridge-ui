import React from "react";
import styled from "styled-components";

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
      <Button onClick={onClick}>Check Token</Button>
    </SearchRow>
  );
};

export default SearchWidget;
