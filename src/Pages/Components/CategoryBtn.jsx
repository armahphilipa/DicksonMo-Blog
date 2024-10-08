import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import { FreeMode, Pagination } from 'swiper/modules';
import '/src/index.css'; 

function CategoryBtn({ setCategory, selectedCategory }) {
  const categories = [
    'All',
    'Entertainment',
    'Lifestyle',
    'Religion',
    'Health',
    'Food',
    'Politics',
    'Relationship',
    'Technology',
    'Education',
    'Family'
  ];

  return (
    <div>
      {/* Mobile View */}
      <div className='block md:hidden'>
        <div className='flex p-4 md:p-10'>
          <Swiper
            slidesPerView={3.3}
            spaceBetween={10}
            freeMode={true}
            modules={[FreeMode, Pagination]}
            className="mySwiper"
          >
            {categories.map((category) => (
              <SwiperSlide key={category}>
                <button 
                onClick={() => {
                  console.log('Selected Category:', category);
                  setCategory(category);
                }}
                className={`my-2 p-2  flex justify-center border md:border-[1.6px] border-[#c8bfff] rounded-md w-full font-normal md:font-medium ${
                  selectedCategory === category ? 'bg-[#7e44ff] text-[#f8f7ff]' : 'text-[#6e44ff]'
                }`}

                >
                  {category}
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Desktop View */}
      <div className='hidden md:block'>
        <div className='flex p-4 md:p-10'>
          <Swiper
            slidesPerView={7}
            spaceBetween={10}
            freeMode={true}
            modules={[FreeMode, Pagination]}
            className="mySwiper"
          >
            {categories.map((category) => (
              <SwiperSlide key={category}>
                <button 
                  onClick={() => setCategory(category)}
                  className={`my-2 p-2 flex justify-center border md:border-[1.6px] border-[#c8bfff] rounded-md w-full font-normal md:font-medium ${
                    selectedCategory === category ? 'bg-[#9391ff] text-[#f8f7ff]' : 'text-[#9391ff]'
                  }`}
                >
                  {category}
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}

export default CategoryBtn;