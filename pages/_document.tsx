import React from "react";
import Document from "next/document";
import { ServerStyleSheet } from "styled-components";

class VocdiniBridge extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            <link rel="icon" type="image/x-icon" href="/media/favicon.ico" />
            <link rel="apple-touch-icon" href="/media/apple-touch-icon.png" />
            <link rel="mask-icon" href="/media/safari-pinned-tab.svg" color="black" />
            <link
              rel="icon"
              type="image/png"
              href="/media/android-chrome-192x192.png"
              sizes="192x192"
            />
            <link
              rel="icon"
              type="image/png"
              href="/media/android-chrome-512x512.png"
              sizes="512x512"
            />
            <meta name="msapplication-config" content="/media/browserconfig.xml" />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                                !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics._writeKey="4ohZSOqAi2Wy0pDuzFPB7fDN5XirRjsq";analytics.SNIPPET_VERSION="4.13.2";
                                analytics.load("4ohZSOqAi2Wy0pDuzFPB7fDN5XirRjsq");
                                analytics.page();
                                }}();
                              `,
              }}
            />
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }
}

export default VocdiniBridge;
