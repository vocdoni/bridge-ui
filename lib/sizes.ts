const size = {
  mobileS: 320,
  mobileM: 375,
  mobileL: 425,
  tablet: 768,
  laptop: 1024,
  laptopL: 1440,
  desktop: 1920
}

export const device = {
  mobileS: `(min-width: ${size.mobileS}px)`,
  mobileM: `(min-width: ${size.mobileM}px)`,
  mobileL: `(min-width: ${size.mobileL}px)`,
  tablet: `(min-width: ${size.tablet}px)`,
  laptop: `(min-width: ${size.laptop}px)`,
  laptopL: `(min-width: ${size.laptopL}px)`,
  desktop: `(min-width: ${size.desktop}px)`,
  desktopL: `(min-width: ${size.desktop}px)`
}

export const deviceMax = {
  mobileS: `(max-width: ${size.mobileS - 1}px)`,
  mobileM: `(max-width: ${size.mobileM - 1}px)`,
  mobileL: `(max-width: ${size.mobileL - 1}px)`,
  tablet: `(max-width: ${size.tablet - 1}px)`,
  laptop: `(max-width: ${size.laptop - 1}px)`,
  laptopL: `(max-width: ${size.laptopL - 1}px)`,
  desktop: `(max-width: ${size.desktop - 1}px)`,
  desktopL: `(max-width: ${size.desktop - 1}px)`
}
