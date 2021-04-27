import React from "react";
import styled from "styled-components";

const SearchRow = styled.div`
  display: flex;  
`;

const SearchField = styled.input`
  type: text;
  border: 2px solid ${({ theme }) => theme.grayScale.g2};
  box-sizing: border-box;
  box-shadow: inset ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;
  width: 394px;
  height: 46px;
  padding-left: 10px;
`;

const SearchButton = styled.button`
  background: linear-gradient(
    ${({ theme }) => theme.gradients.primary.mg1.a}, 
    ${({ theme }) => theme.gradients.primary.mg1.c1}, 
    ${({ theme }) => theme.gradients.primary.mg1.c2});
  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;
  color: ${({ theme }) => theme.blackAndWhite.w1};
  width: 140px;
  height: 46px;
  padding: 12px 20px;
  margin-left: 10px;
  font-size: 16px;
`;

const SearchWidget = () => {
  //TODO implement state & logic

  return (<SearchRow>
    <SearchField placeholder="ERC Token address..."/>
    <SearchButton disabled={false}>Find Token</SearchButton>
  </SearchRow>);
}

export default SearchWidget;
