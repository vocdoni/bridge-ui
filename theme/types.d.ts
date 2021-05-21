export type Color = string;
export type Degree = string;

export interface Colors extends Partial<Colors> {
  primary: {
    p1: Color;
    p2: Color;
  };
  secondary: {
    s3: Color;
    s4: Color;
    s5: Color;
    s6: Color;
    s7: Color;
    s8: Color;
  };
  primaryVocdoni: {
    pv1: Color;
    pv2: Color;
  };
  grayScale: {
    g1: Color;
    g2: Color;
    g3: Color;
    g4: Color;
    g5: Color;
  };
  functionality: {
    f3: Color;
    f4: Color;
    f5: Color;
    f6: Color;
  };
  blackAndWhite: {
    b1: Color;
    w1: Color;
  };
  alerts: {
    a1: Color;
    a2: Color;
    a3: Color;
    a4: Color;
  };
  backgroundGray: {
    bg1: Color;
  };
  placeholderInputText: {
    c1: Color;
  };
  headerAdviceText: {
    c1: Color;
  };
  gradients: {
    primary: {
      mg1: {
        a: Degree;
        c1: Color;
        c2: Color;
        c3: Color;
      };
      mg1_soft: {
        a: Degree;
        c1: Color;
        c2: Color;
        c3: Color;
      };
      mgi_dark: {
        a: Degree;
        c1: Color;
        c2: Color;
      };
    };
    primaryVocdoni: {
      mgv1: {
        a: Degree;
        c1: Color;
        c2: Color;
      };
      mgv1_soft: {
        a: Degree;
        c1: Color;
        c2: Color;
      };
      mgvi_dark: {
        a: Degree;
        c1: Color;
        c2: Color;
      };
    };
    secondary: {
      mg2: {
        c1: Color;
        c2: Color;
      };
      mg3: {
        c1: Color;
        c2: Color;
      };
      mg4: {
        c1: Color;
        c2: Color;
      };
      mg5: {
        c1: Color;
        c2: Color;
      };
      mg6: {
        c1: Color;
        c2: Color;
      };
      mg7: {
        c1: Color;
        c2: Color;
      };
    };
    soft: {
      sg1: {
        c1: Color;
        c2: Color;
      };
      sg2: {
        c1: Color;
        c2: Color;
      };
      sg3: {
        c1: Color;
        c2: Color;
      };
      sg4: {
        c1: Color;
        c2: Color;
      };
      sg5: {
        c1: Color;
        c2: Color;
      };
      sg6: {
        c1: Color;
        c2: Color;
      };
      sg7: {
        c1: Color;
        c2: Color;
      };
      sg8: {
        c1: Color;
        c2: Color;
      };
    };
    cardGradient: {
      a: Color;
      c1: Color;
      c2: Color;
    };
    optionResults: {
      a: Color;
      c1: Color;
      c2: Color;
    };
  };
}

export interface Size {
  mobileS: int;
  mobileM: int;
  mobileL: int;
  tablet: int;
  tabletL: int;
  laptop: int;
  laptopL: int;
  desktop: int;
}

export interface Screens {
  mobileS: string;
  mobileM: string;
  mobileL: string;
  tablet: string;
  tabletL: string;
  laptop: string;
  laptopL: string;
  desktop: string;
}

export interface Margins {
  mobile: {
    horizontal: string;
    vertical: string;
  };
  desktop: {
    horizontal: string;
    vertical: string;
  };
}

export interface Shadows {
  cardShadow: string;
  buttonShadow: string;
}

declare module "styled-components" {
  export interface DefaultTheme extends Colors {
    // Screens for media queries
    screens: Screens;
    margins: Margins;
    shadows: Shadows;
  }
}
