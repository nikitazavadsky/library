import Head from "next/head";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "../styles/globals.css";
import Header from "@/components/header";
import axios from "axios";
import { env } from "@/env.mjs";
import { useEffect } from "react";
import { type AppType } from "next/app";

const queryClient = new QueryClient();
axios.defaults.baseURL = env.NEXT_PUBLIC_BASE_URL;
axios.defaults.headers.post["Content-Type"] = "application/json; charset=utf-8";
axios.defaults.headers.put["Content-Type"] = "application/json; charset=utf-8";
axios.defaults.withCredentials = true;

const isDev = env.NEXT_PUBLIC_CLIENT_MODE === "development";

const MyApp: AppType = ({ Component, pageProps }) => {
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    }
  }, []);

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
