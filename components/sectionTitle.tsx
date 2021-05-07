import React from "react";
import styled from "styled-components";

const Title = styled.h4`
  margin-bottom: 5px;
  font-size: 38px;
  font-style: normal;
  font-weight: 500;
  line-height: 51.91px;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.blackAndWhite.b1};
  margin-top: 45px;

  @media ${({ theme }) => theme.screens.tablet} {
    font-size: 32px;
    margin-top: 30px;
  }
`;

const SmallerTitle = styled(Title)`
  font-size: 26px;
  line-height: 35.52px;
`;

const Subtitle = styled.p`
  line-height: 27px;
  color: ${({ theme }) => theme.grayScale.g5};
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  margin-top: 0;
`;

type TitleProps = {
  smallerTitle?: boolean;
  title: string;
  subtitle?: string;
};

const SectionTitle = ({ smallerTitle, title, subtitle }: TitleProps) => (
  <div>
    {smallerTitle ? <SmallerTitle>{title}</SmallerTitle> : <Title>{title}</Title>}
    {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
  </div>
);

export default SectionTitle;
