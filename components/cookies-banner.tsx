import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { COOKIES_URL } from '../lib/constants'


import Button from './ControlElements/button'
import {
  FlexAlignItem,
  FlexContainer,
  FlexJustifyContent,
} from '@components/flex'

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
          <FlexContainer
            alignItem={FlexAlignItem.Center}
            justify={FlexJustifyContent.SpaceAround}
          >
            <SpacedContainer>
              <p><small>
                This website uses cookies to improve your experience while browsing the website. The cookies that are classified as necessary are stored in your browser, as they are essential for the functioning of the basic functionalities of the website.
              </small></p>

              <p><small>
                We also use third-party cookies that help us analyze and understand how you use this website. These cookies will be stored in your browser only with your consent. You also have the option to opt out of receiving these cookies. But opting out of some of these cookies may affect your browsing experience.{' '}
                <Link href={COOKIES_URL}>
                  More details
                </Link>
              </small></p>
            </SpacedContainer>

            <SpacedContainer>
              <Button positive onClick={acceptCookies}>
                Accept
              </Button>
            </SpacedContainer>

            <SpacedContainer>
              <Button border onClick={rejectCookies}>
                Decline
              </Button>
            </SpacedContainer>
          </FlexContainer>
        </TextContainer>
      </CookiesContainer>
    </If>
  )
}

const TextContainer = styled.div`
  max-width: ${size.laptopL * 0.8}px;
  margin: auto;

  & > div > div {
    padding-right: 10px;
  }
`
const SpacedContainer = styled.div`
  margin-left: 14px;
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
