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

export interface Colors2 {
    s_1: Color;
    s_2: Color;
    s_3: Color;
    s_4: Color;
    s_5: Color;
    s_6: Color;
    s_7: Color;
    s_8: Color;

    sv_1: Color;
    sv_2: Color;

    g_1: Color;
    g_2: Color;
    g_3: Color;
    g_4: Color;
    g_5: Color;

    b_3: Color;
    b_4: Color;
    b_5: Color;

    b_1: Color;
    w_1: Color;
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
