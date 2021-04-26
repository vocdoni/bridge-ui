import React from "react";
import styled from "styled-components";

const Title = styled.h4`
  margin-top: 0;
  margin-bottom: 9px;
  font-size: 38px;
  font-style: normal;
  font-weight: 500;
  line-height: 52px;
  letter-spacing: -0.03em;
  color:  ${({ theme }) => theme.blackAndWhite.b1};
`;

const Subtitle = styled.p`
  margin-top: 0;
  margin-bottom: 9;
  line-height: 27px;
  color: #7483AB;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
`;

type TitleProps = {
  title: string;
  subtitle: string;
};

const SectionTitle = ({ title, subtitle}: TitleProps) => (
  <>
    <Title>{title}</Title>
    <Subtitle>{subtitle}</Subtitle>
  </>
);

export default SectionTitle;