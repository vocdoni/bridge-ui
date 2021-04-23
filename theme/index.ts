import { createGlobalStyle, DefaultTheme } from "styled-components";
import { Colors, Margins, Screens, ColorsNewTheme } from "./types";

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

// New Theme Colors
export const newTheme_colors: ColorsNewTheme = {
  primary: {
    p1: "#00C2FF",
    p2: "#01E8F7",
  },
  secondary: {
    s3: "#635BFF",
    s4: "#FF8286",
    s5: "#FFC260",
    s6: "#8991FF",
    s7: "#69FFDD",
    s8: "#FF96FA",
  },
  primaryVocdoni: {
    pv1: "#A3EC93",
    pv2: "#46C4C2",
  },
  grayScale: {
    g1: "#F6F9FC",
    g2: "#EFF1F7",
    g3: "#D2D9EE",
    g4: "#B4C1E4",
    g5: "#7483AB",
  },
  functionality: {
    f3: "#FF6A60",
    f4: "#4BDD7C",
    f5: "#FFB53A",
  },
  blackAndWhite: {
    b1: "#20232C",
    w1: "#FFFFFF",
  },
  gradients: {
    primary: {
      mg1: {
        a: "107.79deg",
        c1: "#00C2FF",
        c2: "#01E8F7",
      },
      mg1_soft: {
        a: "107.79deg",
        c1: "#66DAFF",
        c2: "#80F7FF",
        c3: "#01E8F7",
      },
      mgi_dark: {
        a: "107.79deg",
        c1: "#00ACE2",
        c2: "#02DFED",
      },
    },
    primaryVocdoni: {
      mgv1: {
        a: "110.89deg",
        c1: "#A3EC93",
        c2: "#46C4C2",
      },
      mgv1_soft: {
        a: "110.89deg",
        c1: "#F0FFDE",
        c2: "#E0FFFF",
      },
      mgvi_dark: {
        a: "110.89deg",
        c1: "#8DD67D",
        c2: "#35AFAD",
      },
    },
    secondary: {
      mg2: {
        c1: "#A379FF",
        c2: "#FF717D",
      },
      mg3: {
        c1: "#FFB847",
        c2: "#FFEB94",
      },
      mg4: {
        c1: "#94FFD2",
        c2: "#C2FFFA",
      },
      mg5: {
        c1: "#7BFFDA",
        c2: "#9D9BFF",
      },
      mg6: {
        c1: "#FF7984",
        c2: "#FFEB94",
      },
      mg7: {
        c1: "#54E3FF",
        c2: "#FFA4F0",
      },
    },
    soft: {
      sg1: {
        c1: "#E4F8FF",
        c2: "#F1F1FF",
      },
      sg2: {
        c1: "#EDE4FF",
        c2: "#FFF1F2",
      },
      sg3: {
        c1: "#FFFAE4",
        c2: "#FFF3F1",
      },
      sg4: {
        c1: "#E4FFF4",
        c2: "#F1FFFE",
      },
      sg5: {
        c1: "#E4FFF7",
        c2: "#E0DFFF",
      },
      sg6: {
        c1: "#FFF9E5",
        c2: "#FFE3E3",
      },
      sg7: {
        c1: "#E4FBFF",
        c2: "#FDE7E7",
      },
      sg8: {
        c1: "#FFDBDB",
        c2: "#F9FFF1",
      },
    },
  },
};

export const size = {
  mobileS: 320,
  mobileM: 375,
  mobileL: 440,
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
  ...newTheme_colors,
  ...colors,
  screens,
  margins,
};

// New Theme Style | TODO: Modify screens sizes
export const FixedGlobalStyle = createGlobalStyle`

body {
    padding: 0;
    margin: 0;
    font-size: 20px;
    font-family: 'Manrope', sans-serif !important;
    background-color: ${({ theme }) => theme.blackAndWhite.w1} !important;
    color: ${({ theme }) => theme.blackAndWhite.b1};
}
h1, h2, h3, h4, h5, h6 {
    letter-spacing: 0.01em;
}
h1 { 
    font-size: 74px; 
    font-weight: 700; 
    @media ${({ theme }) => theme.screens.tablet} {
        font-size: 24px; 
        font-weight: 800; 
    }
}
h2 { 
    font-size: 64px; 
    font-weight: 700; 
    @media ${({ theme }) => theme.screens.tablet} {
        font-size: 20px; 
        font-weight: 700; 
    }
}
h3 { 
    font-size: 54px; 
    font-weight: 600; 
    @media ${({ theme }) => theme.screens.tablet} {
        font-size: 18px; 
        font-weight: 700; 
    }
}
h4 { 
    font-size: 44px; 
    font-weight: 500; 
    @media ${({ theme }) => theme.screens.tablet} {
        font-size: 15px; 
    }
}
h5 { 
    font-size: 34px; 
    font-weight: 500; 
}
h6 { 
    font-size: 24px; 
    font-weight: 500; 
}
p { 
    font-size: 18px;
    font-weight: 300; 
    @media ${({ theme }) => theme.screens.tablet} {
        font-size: 12px; 
    }
    
}
a {
    @media ${({ theme }) => theme.screens.tablet} {
        font-size: 12px; 
    }
}
textarea {
    min-height: 72px;
}


`;
