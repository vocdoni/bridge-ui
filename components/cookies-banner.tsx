import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { COOKIES_URL } from '../lib/constants'
import { PrimaryButton, SecondaryButton } from "../components/ControlElements/button";

import { size } from '../theme/index'
import { useCookies } from '../lib/hooks/cookies'
import { If } from 'react-if'

export const CookiesBanner = () => {
  const { acceptCookies, rejectCookies, accepted, hide } = useCookies()

  const showCookiesBanner = !accepted && !hide
  return (
    <If condition={showCookiesBanner}>
      <CookiesContainer>
        <TextContainer>
          <FlexContainer>
            <SpacedContainer>
              
                <p>This website uses cookies to improve your experience while browsing the website. The cookies that are classified as necessary are stored in your browser, as they are essential for the functioning of the basic functionalities of the website.</p>
              
                <p>We also use third-party cookies that help us analyze and understand how you use this website. These cookies will be stored in your browser only with your consent. You also have the option to opt out of receiving these cookies. But opting out of some of these cookies may affect your browsing experience.{' '}
                <a href={COOKIES_URL} target="_blank">
                  More details
                </a></p>
              
            </SpacedContainer>

            <ButtonsContainer>

              <SpacedContainer>
                <PrimaryButton onClick={acceptCookies}>
                  Accept
                </PrimaryButton>
              </SpacedContainer>

              <SpacedContainer>
                <SecondaryButton onClick={rejectCookies}>
                  Decline
                </SecondaryButton>
              </SpacedContainer>

            </ButtonsContainer>
          </FlexContainer>
        </TextContainer>
      </CookiesContainer>
    </If>
  )
}

const ButtonsContainer = styled.div`
display: flex;
flex-direction: row;
`

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
`

const TextContainer = styled.div`
  max-width: ${size.laptopL * 0.8}px;
  margin: auto;

  p {
    font-size: 14px;
  }

  & > div > div {
    padding-right: 10px;
  }
`
const SpacedContainer = styled.div`
  margin-left: 14px;
  margin-top: 0;

  @media ${({ theme }) => theme.screens.laptop} {
    margin-top: 14px;
  }
`

const CookiesContainer = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 1;
  padding: 10px 0;
  background-color: white;
`
