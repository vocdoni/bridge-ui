export type Color = string;

export interface Colors {
    text1: Color;
    text2: Color;
    text3: Color;
    accent1: Color;
    accent2: Color;
    white: Color;
    darkFg: Color;
    darkMidFg: Color;
    darkLightFg: Color;
    lightBg: Color;
    lightBg2: Color;
    lightBorder: Color;

    lightText: Color;
    mainText: Color;
    lighterText: Color;

    inputBackground: Color;
    negative: Color;

    positive: Color;
}

export interface ColorsNewTheme {
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
    };
    blackAndWhite: {
        b1: Color;
        w1: Color;
    };
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

declare module "styled-components" {
    export interface DefaultTheme extends Colors {
        // Screens for media queries
        screens: Screens;
        margins: Margins;
    }
}
