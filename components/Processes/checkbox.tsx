import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: inline-block;
  vertical-align: middle;
`;

const Hidden = styled.input.attrs({ type: "checkbox" })`
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 0px;
`;

const Dot = styled.div`
  border-radius: 50%;
  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  background: linear-gradient(
    ${({ theme }) => theme.gradients.primary.mg1.a},
    ${({ theme }) => theme.gradients.primary.mg1.c1},
    ${({ theme }) => theme.gradients.primary.mg1.c2}
  );
  z-index: 1;
  height: 14px;
  width: 14px;
  margin: 3px;
`;

const Styled = styled.div<{ checked: boolean }>`
  cursor: pointer;
  height: 24px;
  width: 24px;
  box-sizing: border-box;
  box-shadow: inset ${({ theme }) => theme.shadows.buttonShadow};
  background-color: ${({ theme }) => theme.blackAndWhite.w1};
  border-radius: 26px;
  border: 2px solid ${({ theme }) => theme.grayScale.g2};

  ${Hidden}:focus + & {
    box-shadow: 0 0 0 0px;
  }

  ${Dot} {
    visibility: ${(props) => (props.checked ? "visible" : "hidden")};
  }
`;

interface CheckboxProps {
  className?: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ className, checked, ...props }) => {
  return (
    <Container className={className}>
      <Hidden checked={checked} {...props} />
      <Styled checked={checked}>
        <Dot />
      </Styled>
    </Container>
  );
};

export default Checkbox;
