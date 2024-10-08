// Articles.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig'; // Adjust the import path as necessary
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';


const NewArticle = () => {
    const [recentArticles, setRecentArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchRecentArticles = async () => {
        setIsLoading(true);
        try {
          const articlesRef = collection(db, 'articles'); // Adjust to your collection name
          const q = query(articlesRef, orderBy('timestamp', 'desc'), limit(2)); // Get the 2 most recent articles
          const querySnapshot = await getDocs(q);
  
          // Check if any articles were returned
          if (querySnapshot.empty) {
            console.log('No articles found');
            setRecentArticles([]);
            return;
          }
  
          // Map the documents to an array
          const fetchArticles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), }));
          console.log('Fetched articles:', articles); // Log fetched articles
          setRecentArticles(fetchArticles);
        } catch (error) {
          console.error('Error fetching articles:', error);
          setError('Failed to fetch articles. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchRecentArticles();
    }, []);
  
    if (isLoading) {
      return (
        <div className='flex flex-wrap justify-center p-2 bg-[#c8c6d7] animate-pulse  rounded-lg'>
          <Skeleton className='rounded-lg w-[370px] md:w-[530px] h-[200px] md:h-[280px]' />
          <Skeleton className='rounded-lg w-[370px] md:w-[530px] h-[200px] md:h-[280px]' />
        </div>
      );
    }
  
    if (error) {
      return <div className='text-red-500'>{error}</div>;
    }
  
    return (
      <div className='flex flex-wrap justify-center p-2'>
        {/* First Recently Added Article */}
        <div className='w-[370px] md:w-[530px] h-[200px] md:h-[280px] pr-5 rounded-lg relative'>
          {recentArticles[0] ? (
            <div
              className='w-full h-full rounded-lg relative cursor-pointer'
              onClick={() => navigate(`/article/${recentArticles[0].id}`)}
            >
              <div className='absolute w-full h-full bg-gradient-to-r from-black rounded-lg'></div>
              <img
                src={recentArticles[0].coverImage}
                alt='content image'
                className='w-full h-full object-cover rounded-lg'
                loading="lazy"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className='absolute w-full top-4 md:top-[15%] p-4 md:p-8'>
                <div className='text-center text-white w-[250px] md:w-[400px]'>
                  <h1 className='text-lg md:text-3xl font-medium'>
                    {recentArticles[0].title.length > 20 ? `${recentArticles[0].title.substring(0, 20)}...` : recentArticles[0].title}
                  </h1>
                  <p className='text-xs md:text-base font-light'>
                    {recentArticles[0].timestamp ? new Date(recentArticles[0].timestamp.toDate()).toLocaleDateString() : 'Unknown Date'}
                  </p>
                  <p className='text-xs md:text-base'>
                    {stripHtml(recentArticles[0].content).length > 130 ? `${stripHtml(recentArticles[0].content).substring(0, 130)}...` : stripHtml(recentArticles[0].content)}
                  </p>
                </div>
                <button
                  className='my-2 px-2 p-1 md:p-2 flex justify-center border md:border-[1.6px] border-[#bbdefb] items-center rounded-md text-white text-xs md:text-base font-normal md:font-medium'
                  onClick={() => navigate(`/article/${recentArticles[0].id}`)}
                >
                  Read more
                </button>
              </div>
            </div>
          ) : (
            <div className='w-full h-full rounded-lg relative flex justify-center items-center'>
              <p className='text-gray-500'>No articles available.</p>
            </div>
          )}
        </div>
  
        {/* Second Recently Added Article - Only display on larger screens */}
        <div className='w-[370px] md:w-[530px] h-[200px] md:h-[280px] pr-5 rounded-lg relative hidden md:block'>
          {recentArticles[1] ? (
            <div
              className='w-full h-full rounded-lg relative cursor-pointer'
              onClick={() => navigate(`/article/${recentArticles[1].id}`)}
            >
              <div className='absolute w-full h-full bg-gradient-to-r from-black rounded-lg'></div>
              <img
                src={recentArticles[1].coverImage}
                alt='content image'
                className='w-full h-full object-cover rounded-lg'
                loading="lazy"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className='absolute w-full top-4 md:top-[15%] p-4 md:p-8'>
                <div className='text-center text-white w-[250px] md:w-[400px]'>
                  <h1 className='text-lg md:text-3xl font-medium'>
                    {recentArticles[1].title.length > 20 ? `${recentArticles[1].title.substring(0, 20)}...` : recentArticles[1].title}
                  </h1>
                  <p className='text-xs md:text-base font-light'>
                    {recentArticles[1].timestamp ? new Date(recentArticles[1].timestamp.toDate()).toLocaleDateString() : 'Unknown Date'}
                  </p>
                  <p className='text-xs md:text-base'>
                    {stripHtml(recentArticles[1].content).length > 130 ? `${stripHtml(recentArticles[1].content).substring(0, 130)}...` : stripHtml(recentArticles[1].content)}
                  </p>
                </div>
                <button
                  className='my-2 px-2 p-1 md:p-2 flex justify-center border md:border-[1.6px] border-[#bbdefb] items-center rounded-md text-white text-xs md:text-base font-normal md:font-medium'
                  onClick={() => navigate(`/article/${recentArticles[1].id}`)}
                >
                  Read more
                </button>
              </div>
            </div>
          ) : (
            <div className='w-full h-full rounded-lg relative flex justify-center items-center'>
              <p className='text-gray-500'>No articles available.</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Helper function to strip HTML tags from content
  const stripHtml = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

export default NewArticle;