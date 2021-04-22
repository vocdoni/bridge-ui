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
    gradients: {
        primary: {
            mg1: {
                c1: Color;
                c2: Color;
            };
            mg1_soft: {
                c1: Color;
                c2: Color;
                c3: Color;
            };
            mgi_dark: {
                c1: Color;
                c2: Color;
            };
        };
        primaryVocdoni: {
            mgv1: {
                c1: Color;
                c2: Color;
            };
            mgv1_soft: {
                c1: Color;
                c2: Color;
            };
            mgvi_dark: {
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
        }
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
