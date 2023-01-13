import React from "react";
import Document, {
  DocumentContext,
  Head,
  Main,
  NextScript,
} from "next/document";
import { ServerStyleSheet } from "styled-components";
import { createStylesServer, ServerStyles } from "@mantine/next";

const stylesServer = createStylesServer();

class VoiceDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    // Styled components style SSR extraction
    const sheet = new ServerStyleSheet();

    try {
      const originalRenderPage = ctx.renderPage;
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) =>
            (props) => sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <html>
        <Head>
          <link rel="icon" type="image/x-icon" href="/media/favicon.ico" />
          <link rel="apple-touch-icon" href="/media/apple-touch-icon.png" />
          <link
            rel="mask-icon"
            href="/media/safari-pinned-tab.svg"
            color="black"
          />
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
          <meta
            name="msapplication-config"
            content="/media/browserconfig.xml"
          />
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
          {/* Next and Styled components SSR styles */}
          {this.props.styles}
          {/* Mantine SSR styles */}
          <ServerStyles html={this.props.html} server={stylesServer} />

          <script src="https://cdn.rudderlabs.com/v1/rudder-analytics.min.js" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}

export default VoiceDocument;
