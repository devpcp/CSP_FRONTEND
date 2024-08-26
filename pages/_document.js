import Document, { Html, Head, Main, NextScript } from 'next/document';
export default class MyDocument extends Document {

  render() {
    return (
      <Html>
        <Head>
          <link rel="shortcut icon" href="/assets/images/csp/csp_logo.svg" />
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css" />
          <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;600&display=swap" rel="stylesheet" />
        </Head>
        <body>
          <Main />
          <div id="app"></div>
          <NextScript />
        </body>
      </Html>
    );
  }
}
