import React from "react";
import { When } from "react-if";
import styled from "styled-components";

const TitleContainer = styled.div`
  padding-top: 48px;
  padding-bottom: 16px;
`;

const Title = styled.h4<{ hasSubtitle: boolean; isSmaller: boolean }>`
  margin-top: 0px;
  ${({ hasSubtitle }) => (hasSubtitle ? "margin-bottom: 8px;" : "margin-bottom: 0px;")}
  font-style: normal;
  font-weight: 500;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.blackAndWhite.b1};
  ${({ isSmaller }) => (isSmaller ? "font-size: 32px;" : "font-size: 38px;")}
  ${({ isSmaller }) => (isSmaller ? "line-height: 35.52px;" : "line-height: 51.91px;")}
  

  @media ${({ theme }) => theme.screens.tablet} {
    font-size: 32px;
    margin-top: 30px;
  }
`;

const Subtitle = styled.p`
  line-height: 27px;
  color: ${({ theme }) => theme.grayScale.g5};
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  margin-top: 0;
  margin-bottom: 8px;
`;

type TitleProps = {
  title: string;
  subtitle?: string;
  smallerTitle?: boolean;
};

const SectionTitle = ({ title, subtitle, smallerTitle }: TitleProps) => {
  const hasSubtitle = !!subtitle;
  return (
    <TitleContainer>
      <Title hasSubtitle={hasSubtitle} isSmaller={smallerTitle}>
        {title}
      </Title>
      <When condition={hasSubtitle}>
        <Subtitle>{subtitle}</Subtitle>
      </When>
    </TitleContainer>
  );
};

export default SectionTitle;
