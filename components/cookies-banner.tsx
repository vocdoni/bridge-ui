import React from "react";
import { When } from "react-if";
import styled from "styled-components";

import { COOKIES_URL } from "../lib/constants/url";
import { useCookies } from "../lib/hooks/cookies";

import { size } from "../theme/index";
import { PrimaryButton } from "../components/ControlElements/button";

export const CookiesBanner = () => {
  const { acceptCookies, show } = useCookies();

  return (
    <When condition={show}>
      <CookiesContainer>
        <CenteredContainer>
          <FlexContainer>
            <TextContainer>
              <p>
                This website uses cookies to improve your experience while browsing the website. The
                cookies that are classified as necessary are stored in your browser, as they are
                essential for the functioning of the basic functionalities of the website.
              </p>

              <p>
                We also use third-party cookies that help us analyze and understand how you use this
                website. These cookies will be stored in your browser.
                <a href={COOKIES_URL} target="_blank" rel="noreferrer noopener">
                  More details
                </a>
              </p>
            </TextContainer>
            <PrimaryButton onClick={acceptCookies}>I understand</PrimaryButton>
          </FlexContainer>
        </CenteredContainer>
      </CookiesContainer>
    </When>
  );
};

const FlexContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  padding: 0 8px;

  @media ${({ theme }) => theme.screens.laptop} {
    flex-direction: column;
    padding: 0 14px;
  }
`;

const TextContainer = styled.div`
  margin-left: 14px;
  margin-top: 0;

  p {
    font-size: 14px;
  }

  @media ${({ theme }) => theme.screens.laptop} {
    margin-top: 14px;
  }
`;

const CenteredContainer = styled.div`
  max-width: ${size.laptopL * 0.8}px;
  margin: auto;
  padding: 10px 0;

  & > div > div {
    padding-right: 10px;
  }
`;

const CookiesContainer = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 1;
  background-color: ${({ theme }) => theme.blackAndWhite.w1};
`;
