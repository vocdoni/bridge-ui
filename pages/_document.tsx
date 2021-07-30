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
                                !function(){
                                analytics=window.rudderanalytics=[];for(var methods=["load","page","track","identify","alias","group","ready","reset","getAnonymousId","setAnonymousId"],i=0;i<methods.length;i++){var method=methods[i];rudderanalytics[method]=function(a){return function(){rudderanalytics.push([a].concat(Array.prototype.slice.call(arguments)))}}(method)}
                                rudderanalytics.load("${process.env.ANALYTICS_KEY}","https://rudderstack.aragon.org");
                                rudderanalytics.page();
                                }();
                              `,
              }}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                    (function(h,o,t,j,a,r){
                        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                        h._hjSettings={hjid:2448004,hjsv:6};
                        a=o.getElementsByTagName('head')[0];
                        r=o.createElement('script');r.async=1;
                        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                        a.appendChild(r);
                    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
                              `,
              }}
            />
            {initialProps.styles}
            {sheet.getStyleElement()}
            <script src="https://cdn.rudderlabs.com/v1/rudder-analytics.min.js"></script>
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }
}

export default VocdiniBridge;
