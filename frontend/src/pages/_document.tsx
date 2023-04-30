import { createGetInitialProps } from "@mantine/next";
import Document, { Head, Html, Main, NextScript } from "next/document";

const getInitialProps = createGetInitialProps();

export default class _Document extends Document {
  static getInitialProps = getInitialProps;

  render() {
    return (
      <Html>
        <Head>
          <link 
            href="https://fonts.googleapis.com/css2?family=Raleway:wght@400&display=swap" 
            rel="stylesheet"
            type="text/css"
          />
        </Head>
        <Main />
        <NextScript />
      </Html>
    );
  }
}
