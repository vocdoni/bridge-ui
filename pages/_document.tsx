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
            <link rel='mask-icon' href='/media/safari-pinned-tab.svg' color='black' />
            <link rel='icon' type='image/png' href='/media/android-chrome-192x192.png' sizes='192x192' />
            <link rel='icon' type='image/png' href='/media/android-chrome-512x512.png' sizes='512x512' />
            <meta name='msapplication-config' content='/media/browserconfig.xml' />

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
