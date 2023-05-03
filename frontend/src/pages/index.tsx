import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Swipe from "react-easy-swipe";
import Slider from "@/components/swiper";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
const slides = [
  {
    id: '1',
    title: 'Slide 1',
    image: 'https://via.placeholder.com/500x250',
    link: '/page1',
  },
  {
    id: '2',
    title: 'Slide 2',
    image: 'https://via.placeholder.com/500x250',
    link: '/page2',
  },
  {
    id: '3',
    title: 'Slide 3',
    image: 'https://via.placeholder.com/500x250',
    link: '/page3',
  },
];

const Home: NextPage = () => {
  
      
  return (
    <>
      <Head>
        <title>Course Work</title>
        <meta name="description" content="Landing page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-bl from-[#ecfccb] to-[#84cc16]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          FAN PAGE  <span className="text-[hsl(280,100%,70%)]">Олечки Lebed_blog</span>
          </h1>
          <span className="font-xl gap-2 text-center text-white md:text-2xl">
          Страничка посвящена любимке Ольге и ее большой семье: мужу голубку и сыночку Гучику.
          </span>
        <Slider />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              href="https://create.t3.gg/en/usage/first-steps"
              target="_blank"
            >
              <h3 className="text-2xl font-bold ">Олечка можно личный вопрос →</h3>
              <div className="text-lg">
                Как бы вы отнеслись к безразличию врача?
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              href="https://create.t3.gg/en/introduction"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">Ничего не подумайте очень Вас люблю →</h3>
              <div className="text-lg">
                Почему муж гомосек?
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              href="/home"
            >
              <h3 className="text-2xl font-bold">Ну у Вас реально глаз косит →</h3>
              <div className="text-lg">Не делайте вид что никогда не замечали</div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              href="/home"
            >
              <h3 className="text-2xl font-bold">Олька за мужа сорьки →</h3>
              <div className="text-lg">Просто реально так показалось</div>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
