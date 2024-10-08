import React, { useEffect, useState } from 'react';
import { FiUser } from 'react-icons/fi';
import { BiComment } from 'react-icons/bi';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Chucky from '../assets/movie2.jpg'; // Fallback image
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import '../index.css';
import { FreeMode, Pagination } from 'swiper/modules';

const TrendingArticles = () => {
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch top 5 trending articles based on likeCount
  useEffect(() => {
    const fetchTrendingArticles = async () => {
      try {
        const articlesRef = collection(db, 'articles');
        const q = query(
          articlesRef,
          orderBy('likeCount', 'desc'), // Order by likeCount descending
          limit(5) // Limit to top 5
        );
        const querySnapshot = await getDocs(q);
        const fetchedArticles = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTrendingArticles(fetchedArticles);
      } catch (error) {
        console.error('Error fetching trending articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingArticles();
  }, []);

  // Function to navigate to article detail page
  const navigateToArticle = (articleId) => {
    navigate(`/article/${articleId}`);
  };

  // Function to truncate text to a specified length
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Function to format timestamp to readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown Date';
    return new Date(timestamp.toDate()).toLocaleDateString();
  };

  if (loading) {
    return (
    <div className='flex flex-row gap-4 justify-center'>
          {Array(5).fill().map((_, index) => (
            <div key={index} className='w-[200px] md:w-[260px] h-full border-2 border-[#c2b7ff] rounded-lg overflow-hidden shadow-sm'>
              <div className='w-full h-[120px] md:h-[150px] bg-gray-300 animate-pulse'></div>
              <div className='text-left p-2'>
                <Skeleton width={`80%`} height={20} />
                <Skeleton width={`60%`} height={14} className='mt-1' />
                <Skeleton width={`90%`} height={16} className='mt-2' />
              </div>
            </div>
      ))}
    </div>
  );
  }

  return (
    <div className="w-full bg-white p-4 md:p-10">
      <h1 className="text-2xl md:text-4xl font-bold pb-4">Trending</h1>
      {trendingArticles.length === 0 ? (
        <p className="text-center text-gray-500">No trending articles available.</p>
      ) : (
        <div>
          <div className='hidden md:block'>
          <Swiper
            slidesPerView={4}
            spaceBetween={10}
            freeMode={true}
            modules={[FreeMode, Pagination]}
            className="mySwiper"
          >
          <div className="flex flex-wrap gap-4 justify-center">
            {trendingArticles.map(article => (
              <SwiperSlide>
              <div
                key={article.id}
                className="w-[200px] md:w-[260px] h-full border-2 border-[#c2b7ff] rounded-lg overflow-hidden shadow-sm"
                onClick={() => navigateToArticle(article.id)}
              >
                {/* Article Cover Image */}
                <img
                  src={article.coverImage || Chucky}
                  alt={article.title}
                  className="w-full h-[120px] md:h-[150px] object-cover rounded-t-lg"
                />

                {/* Article Content */}
                <div className="text-left p-2">
                  <h2 className="text-lg md:text-xl font-medium">
                    {truncateText(article.title, 50)}...
                  </h2>
                  <p className="font-thin md:py-2">{formatDate(article.timestamp)}</p>
                  <p className="text-xs md:text-base text-[#5c6972]">
                    {article.category}
                  </p>
                </div>

                {/* Article Actions */}
                <div className="flex items-center p-2">
                  <BiComment size={20} color="#9391ff" className="cursor-pointer" />
                  <p className="ml-1">Discuss</p>
                  <p className="ml-auto">
                    <span className="font-medium">{article.likeCount || 0}</span> Likes
                  </p>
                </div>
                
              </div>
              </SwiperSlide>
            ))}
          </div>
          </Swiper>
        </div>

          <div className='block md:hidden'>
            <Swiper
              slidesPerView={2}
              spaceBetween={40}
              freeMode={true}
              modules={[FreeMode, Pagination]}
              className="mySwiper"
            >
            <div className="flex flex-wrap gap-4 justify-center">
              {trendingArticles.map(article => (
                <SwiperSlide>
                <div
                  key={article.id}
                  className="w-[200px] md:w-[260px] h-full border-2 border-[#bbdefb] rounded-lg overflow-hidden shadow-sm"
                  onClick={() => navigateToArticle(article.id)}
                >
                  {/* Article Cover Image */}
                  <img
                    src={article.coverImage || Chucky}
                    alt={article.title}
                    className="w-full h-[120px] md:h-[150px] object-cover rounded-t-lg"
                  />

                  {/* Article Content */}
                  <div className="text-left p-2">
                    <h2 className="text-lg md:text-xl font-medium">
                      {truncateText(article.title, 30)}
                    </h2>
                    <p className="font-thin md:py-2">{formatDate(article.timestamp)}</p>
                    <p className="text-xs md:text-base text-[#5c6972]">
                      {truncateText(stripHtml(article.content), 27)}...
                    </p>
                  </div>

                  {/* Article Actions */}
                  <div className="flex items-center p-2">
                    <BiComment size={20} color="#9391ff" className="cursor-pointer" />
                    <p className="ml-1">Discuss</p>
                    <p className="ml-auto">
                      <span className="font-medium">{article.likeCount || 0}</span> Likes
                    </p>
                  </div>

                </div>
                </SwiperSlide>
              ))}
            </div>
            </Swiper>
          </div>
        </div>
      )}
    </div>
    
  );
};

// Helper function to strip HTML tags from content
const stripHtml = (html) => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

export default TrendingArticles;