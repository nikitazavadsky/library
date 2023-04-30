import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import SwiperCore, {Autoplay} from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import Image from "next/image";
import Link from "next/link";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';


interface SlideProps {
  img: string;
  name: string;

}

export default function Slider() {
  SwiperCore.use([Autoplay])
  return (
    <Swiper
      //install Swiper modules
      style={{ width: '100%', height: '720px' }}
      modules={[Navigation, Pagination, Scrollbar, A11y]}
      spaceBetween={0}
      slidesPerView={1}
      autoplay ={{
        delay:3000
      }}
      navigation
      pagination={{ clickable: true }}
      scrollbar={{ draggable: true }}
      onSwiper={(swiper) => console.log(swiper)}
      onSlideChange={() => console.log('slide change')}
      loop={true}
    >
      <SwiperSlide>< Slide img="/dog.jpg" name="Задать вопрос" /></SwiperSlide>
      <SwiperSlide>< Slide img="/friends.jpg" name="Реферальная ссылка для друзей" /></SwiperSlide>
      <SwiperSlide>< Slide img="/bal.jpg" name="Заказать рекламу" /></SwiperSlide>

    </Swiper>
  );
};

function Slide(props: SlideProps) {
  return(
    <div className="flex items-center justify-center">
      <Image
                  //className="h-12 w-auto"
                  width={1080}
                  height={720}
                  src={props.img}
                  alt={props.name}
                />

<Link
              className="absolute bottom-6 left-1.25 flex items-center justify-center max-w-xs flex-col gap-4 rounded-xl bg-lime-600/50 p-4 text-white hover:bg-white/20"
              href="/home"
            >
              <h3 className="text-2xl text-center font-bold ">{props.name}</h3>
            </Link>
                {/* <div className="absolute bottom-6 left-1.25 ">
                  <Link href="/home">
                <Image  src="/button1.png" alt="Button" width={321} height={81} />
              </Link>
                </div> */}
              
            </div>


    // <div style={{  
    //   backgroundColor: 'lightblue', 
    //   height: '300px', 
    //   display: 'flex', 
    //   justifyContent: 'center', 
    //   alignItems: 'center', 
    //   fontSize: '48px' 
    // }}>
    //   <p>Example Slide</p>
    // </div>
  );
}