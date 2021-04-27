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
  color: ${({ theme }) => theme.blackAndWhite.b1};
`;

const SmallerTitle = styled(Title)`
  font-size: 28px;
  line-height: 38px;
`;

const Subtitle = styled.p`
  margin-top: 0;
  margin-bottom: 9;
  line-height: 27px;
  color: #7483ab;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
`;

type TitleProps = {
  smallerTitle?: boolean;
  title: string;
  subtitle: string;
};

const SectionTitle = ({ smallerTitle, title, subtitle }: TitleProps) => (
  <div>
    {smallerTitle ? <SmallerTitle>{title}</SmallerTitle> : <Title>{title}</Title>}
    <Subtitle>{subtitle}</Subtitle>
  </div>
);

export default SectionTitle;
