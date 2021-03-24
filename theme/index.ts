import { createGlobalStyle, DefaultTheme } from "styled-components";
import { Colors, Margins, Screens } from "./types";

export const colors: Colors = {
    text1: "#F9694F",
    text2: "#ED57E9",
    text3: "#212B36",
    accent1: "#F9694F",
    accent2: "#ED57E9",
    white: "white",
    darkFg: "#333",
    darkMidFg: "#555",
    darkLightFg: "#888",
    lightBg: "#F4F4F4",
    lightBg2: "#E8E8E8",
    lightBorder: "#DDE4E9",

    // bridge/styles/constants
    lightText: "#777777",
    mainText: "#393939",
    lighterText: "#999",

    inputBackground: "#EAEAEA",
    negative: "#FF6969",
    positive: "#08BEE5",
};

export const size = {
    mobileS: 320,
    mobileM: 375,
    mobileL: 425,
    tablet: 768,
    tabletL: 900,
    laptop: 1024,
    laptopL: 1440,
    desktop: 3000,
};

export const screens: Screens = {
    mobileS: `(max-width: ${size.mobileS}px)`,
    mobileM: `(max-width: ${size.mobileM}px)`,
    mobileL: `(max-width: ${size.mobileL}px)`,
    tablet: `(max-width: ${size.tablet}px)`,
    tabletL: `(max-width: ${size.tabletL}px)`,
    laptop: `(max-width: ${size.laptop}px)`,
    laptopL: `(max-width: ${size.laptopL}px)`,
    desktop: `(max-width: ${size.desktop}px)`,
};

export const margins: Margins = {
    desktop: {
        horizontal: "40px",
        vertical: "",
    },
    mobile: {
        horizontal: "15px",
        vertical: "",
    },
};

export const theme: DefaultTheme = {
    ...colors,
    screens,
    margins,
};

export const FixedGlobalStyle = createGlobalStyle`

body {
    padding: 0;
    margin: 0;
    font-size: 14px;
    font-family: "Roboto", Arial, Helvetica, sans-serif !important;
    background-color: ${({ theme }) => theme.white} !important;
    color: ${({ theme }) => theme.mainText};
}

h1, h2, h3, h4, h5, h6 {
    letter-spacing: 0.01em;
}

h1 { 
    font-size: 45px; 
    font-weight: 900; 
    @media ${({ theme }) => theme.screens.tablet} {
        font-size: 24px; 
        font-weight: 800; 
    }
}

h2 { 
    font-size: 30px; 
    font-weight: 900; 
    @media ${({ theme }) => theme.screens.tablet} {
        font-size: 20px; 
        font-weight: 700; 
    }
}

h3 { 
    font-size: 20px; 
    font-weight: 900; 
    @media ${({ theme }) => theme.screens.tablet} {
        font-size: 18px; 
        font-weight: 700; 
    }
}

h4 { 
    font-size: 16px; 
    font-weight: 500; 
    @media ${({ theme }) => theme.screens.tablet} {
        font-size: 15px; 
    }
}

h5 { 
    font-size: 14px; 
    font-weight: 500; 
}

h6 { 
    font-size: 13px; 
    font-weight: 500; 
}

p { 
    font-size: 14px;
    @media ${({ theme }) => theme.screens.tablet} {
        font-size: 12px; 
    }
    
}

a {
    font-size: 12px; 
}


textarea {
    min-height: 72px;
}


@font-face {
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: local('Roboto'), local('Roboto-Regular'), url(/fonts/roboto-regular.woff2) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 500;
    font-display: swap;
    src: local('Roboto Medium'), local('Roboto-Medium'), url(/fonts/roboto-medium.woff2) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 900;
    font-display: swap;
    src: local('Roboto Black'), local('Roboto-Black'), url(/fonts/roboto-black.woff2) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
`;
