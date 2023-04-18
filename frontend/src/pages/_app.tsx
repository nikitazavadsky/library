import Head from "next/head";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "../styles/globals.css";
import Header from "@/components/header";
import axios from "axios";
import { env } from "@/env.mjs";
import { useMediaQuery } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { AppType } from "next/app";

const queryClient = new QueryClient();
axios.defaults.baseURL = env.NEXT_PUBLIC_BASE_URL;
axios.defaults.headers.post["Content-Type"] = "application/json; charset=utf-8";
axios.defaults.headers.put["Content-Type"] = "application/json; charset=utf-8";
axios.defaults.withCredentials = true;

const isDev = env.NEXT_PUBLIC_CLIENT_MODE === "development";

const MyApp: AppType = ({ Component, pageProps }) => {
  // It a workaround for MantineProvider to work with Next.js themes
  // https://github.com/mantinedev/mantine/discussions/1048#discussioncomment-2395054
  // const [dark, setDark] = useState(false);

  // const preferredColorScheme = useMediaQuery("(prefers-color-scheme: dark)");

  // useEffect(() => {
  //   setDark(preferredColorScheme);
  // }, [preferredColorScheme]);

  return (
    <>
      <Head>
        <title>Please, add page title</title>
      </Head>
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={{ colorScheme: "light" }}>
          <Header />
          <Component {...pageProps} />
          {isDev && <ReactQueryDevtools initialIsOpen={false} />}
        </MantineProvider>
      </QueryClientProvider>
    </>
  );
};

export default MyApp;
