import React from "react";
import styled from "styled-components";

import { Spinner } from "../components/spinner";
import { flex_row_large_column_small_mixin } from "../lib/mixins";
import { PrimaryButton } from "./ControlElements/button";
import { TextInput } from "./ControlElements/input";

const SearchRow = styled.div`
  ${flex_row_large_column_small_mixin};
`;

const Box = styled.div`
  width: 100%;
  display: flex;
  margin-right: 10px;
  @media ${({ theme }) => theme.screens.tablet} {
    margin-bottom: 8px;
  }
`;

type SearchBarProps = {
  placeholder?: string;
  onChange: (ev: any) => void;
  onKeyDown?: (ev: any) => void;
};

export const SearchBar = ({ placeholder, onChange, onKeyDown }: SearchBarProps) => {
  return (
    <Box>
      <TextInput placeholder={placeholder} onKeyDown={onKeyDown} onChange={onChange} />
    </Box>
  );
};

type SearchWidgetProps = SearchBarProps & {
  onClick: () => void;
  loading: boolean;
};

const SearchWidget = ({
  placeholder = "ERC Token address...",
  onChange,
  onKeyDown,
  onClick,
  loading,
}: SearchWidgetProps) => {
  return (
    <SearchRow>
      <SearchBar placeholder={placeholder} onKeyDown={onKeyDown} onChange={onChange} />
      <PrimaryButton onClick={loading ? null : onClick}>
        {loading ? <Spinner /> : "Validate contract"}
      </PrimaryButton>
    </SearchRow>
  );
};

export default SearchWidget;
