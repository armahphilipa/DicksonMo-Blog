import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import Chucky from '../assets/movie2.jpg'; // Ensure this path is correct
import { 
  collection, getDocs, query, orderBy, limit, startAfter, where, doc, getDoc, deleteDoc 
} from 'firebase/firestore';
import { db, auth } from '../firebaseConfig'; // Ensure these are correctly exported
import { FaPen, FaEllipsisV } from 'react-icons/fa';
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from 'firebase/auth';
import CategoryArticles from './CategoryArticles';
import Trending from './Trending';
import 'swiper/css';
import 'swiper/css/free-mode';
import '../index.css'; // Adjust the path as necessary
import { FreeMode, Pagination } from 'swiper/modules';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import CategoryBtn from './Components/CategoryBtn';


function Home() {
  const [articles, setArticles] = useState([]); 
  const [displayedArticles, setDisplayedArticles] = useState([]); 
  const [lastVisible, setLastVisible] = useState(null);  // Loading state for randomArticles
  const [isRecentlyFetching, setIsRecentlyFetching] = useState(true); // Loading state for displayedArticles
  const [loadingMore, setLoadingMore] = useState(false); // Loading state for "Load More"
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All'); // State for selected category
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(null); // State to track open menu

  const ARTICLES_BATCH_SIZE = 5; 

  // Track user's authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); 
      } else {
        setUser(null); 
      }
    });
    return () => unsubscribe();
  }, []);

  // Logout function
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate('/'); // Navigate to home or any other route after logging out
      })
      .catch((error) => {
        console.error("Error logging out: ", error);
      });
  };

  // Helper function to strip HTML tags
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  // Fetch author name based on authorId
  const fetchAuthorName = async (authorId) => {
    try {
      const authorRef = doc(db, 'users', authorId);
      const authorSnap = await getDoc(authorRef);

      if (authorSnap.exists()) {
        return authorSnap.data().displayName;
      }
    } catch (error) {
      console.error("Error fetching author:", error);
    }
    return "Unknown Author";
  };

    

  // Fetch articles based on selected category
  const fetchArticles = async () => {
  
    setIsRecentlyFetching(true);
    try {
      const articlesRef = collection(db, 'articles');
      let qRandom, qRecent;

      if (selectedCategory === 'All') {
        qRandom = query(articlesRef, orderBy('timestamp', 'desc'));
        qRecent = query(articlesRef, orderBy('timestamp', 'desc'), limit(ARTICLES_BATCH_SIZE));
      } else {
        qRandom = query(articlesRef, where('category', '==', selectedCategory), orderBy('timestamp', 'desc'));
        qRecent = query(articlesRef, where('category', '==', selectedCategory), orderBy('timestamp', 'desc'), limit(ARTICLES_BATCH_SIZE));
      }

      // Fetch all articles for random selection
      const allArticlesSnapshot = await getDocs(qRandom);
      const allFetchedArticles = allArticlesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setArticles(allFetchedArticles);

      // Select two unique random articles
      

      // Fetch recently added articles
      const recentArticlesSnapshot = await getDocs(qRecent);
      const recentFetchedArticles = recentArticlesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDisplayedArticles(recentFetchedArticles);

      const lastVisibleDoc = recentArticlesSnapshot.docs[recentArticlesSnapshot.docs.length - 1];
      setLastVisible(lastVisibleDoc);
      setIsRecentlyFetching(false);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setIsRecentlyFetching(false);
    }
  };

  // Initial fetch and fetch on category change
  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  // Function to load more articles
  const loadMoreArticles = async () => {
    if (!lastVisible) return;
    setLoadingMore(true);
    try {
      const articlesRef = collection(db, 'articles');
      let q;

      if (selectedCategory === 'All') {
        q = query(
          articlesRef,
          orderBy('timestamp', 'desc'),
          startAfter(lastVisible),
          limit(ARTICLES_BATCH_SIZE)
        );
      } else {
        q = query(
          articlesRef,
          where('category', '==', selectedCategory),
          orderBy('timestamp', 'desc'),
          startAfter(lastVisible),
          limit(ARTICLES_BATCH_SIZE)
        );
      }

      const articlesSnapshot = await getDocs(q);
      const fetchedArticles = articlesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDisplayedArticles(prev => [...prev, ...fetchedArticles]);

      const newLastVisible = articlesSnapshot.docs[articlesSnapshot.docs.length - 1];
      setLastVisible(newLastVisible);
    } catch (error) {
      console.error('Error loading more articles:', error);
    }
    setLoadingMore(false);
  };

  // Handler functions for menu actions
  const handleMenuToggle = (articleId) => {
    setMenuOpen((prev) => (prev === articleId ? null : articleId));
  };

  const handleEdit = (articleId) => {
    navigate(`/edit/${articleId}`); // Ensure you have an edit route set up
    setMenuOpen(null);
  };

  const handleDelete = async (articleId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this article?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'articles', articleId));
      // Remove the deleted article from all relevant states
      setArticles((prev) => prev.filter((article) => article.id !== articleId));
      setRandomArticles((prev) => prev.filter((article) => article.id !== articleId));
      setDisplayedArticles((prev) => prev.filter((article) => article.id !== articleId));
    } catch (error) {
      console.error("Error deleting article:", error);
    }

    setMenuOpen(null);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.menu-button') && !event.target.closest('.menu-dropdown')) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className='w-full min-h-screen bg-white'>
      {/* Navigation Bar */}
      <nav className='fixed w-full md:w-[95%] bg-white border-b border-b-[#f8f7ff] z-50'>
        <div className='p-4 md:mx-5 flex justify-between items-center w-full'>
          <h1 className='text-[#6e44ff] text-lg md:text-xl font-extrabold'>Dicson Mo.</h1> 

          <div className='flex flex-row justify-center items-center gap-4'>
            {/* Conditionally render Log in/Sign up or Logout based on user's state */}
            {!user ? (
              <>
                <Link to='/Login'>
                  <button className='px-4 h-8 py-1 flex flex-shrink-0 md:h-10 justify-center border md:border-[1.6px] border-[#9381ff] rounded-md text-[#6e44ff] text-sm md:text-base font-normal md:font-medium'>
                    Log in
                  </button>
                </Link>
                <Link to='/Signup'>
                  <button className='px-4 h-8 py-1 flex flex-shrink-0 md:h-10 justify-center text-white text-sm md:text-base rounded-md bg-[#6e44ff] font-normal md:font-medium'>
                    Sign up
                  </button>
                </Link>
              </>
            ) : (
              <div className='flex flex-row justify-center gap-4'>
                <Link to='/Create'>
                  <FaPen size={20} color='#6e44ff' />
                </Link>
                <button
                  type='button'
                  onClick={handleLogout}
                  className='px-2 md:px-3 py-1 flex flex-shrink-0 h-8 items-center justify-center text-white text-sm md:text-base rounded-md bg-[#6e44ff] font-normal md:font-medium'
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer for Fixed Nav */}
      <div className="h-16"></div>

      {/* Featured Random Articles */}
      <div className='flex flex-wrap justify-center p-2'>
        {/* First Recently added Article */}
        <div className='w-[370px] md:w-[530px] h-[200px] md:h-[280px] pr-5 rounded-lg relative'>
          {isRecentlyFetching ? (
            <Skeleton className='rounded-lg w-[370px] md:w-[530px] h-[200px] md:h-[280px]' />
          ) : articles[0] ? (
            <div 
              className='w-full h-full rounded-lg relative cursor-pointer'
              onClick={() => navigate(`/article/${articles[0].id}`)}
            >
              <div className='absolute w-full h-full bg-gradient-to-r from-black rounded-lg'></div>
              <img
                src={articles[0].coverImage}
                alt='content image'
                className='w-full h-full object-cover rounded-lg'
                loading="lazy"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className='absolute w-full top-4 md:top-[15%] p-4 md:p-8'>
                <div className='text-center text-white w-[250px] md:w-[400px]'>
                  <h1 className='text-lg md:text-3xl font-medium'>
                    {articles[0].title.length > 20 ? `${articles[0].title.substring(0, 20)}...` : articles[0].title}
                  </h1>
                  <p className='text-xs md:text-base font-light'>
                    {articles[0].timestamp ? new Date(articles[0].timestamp.toDate()).toLocaleDateString() : 'Unknown Date'}
                  </p>
                  <p className='text-xs md:text-base'>
                    {stripHtml(articles[0].content).length > 130 ? `${stripHtml(articles[0].content).substring(0, 130)}...` : stripHtml(articles[0].content)}
                  </p>
                </div>
                <button
                  className='my-2 px-2 p-1 md:p-2 flex justify-center border md:border-[1.6px] border-[#bbdefb] items-center rounded-md text-white text-xs md:text-base font-normal md:font-medium'
                  onClick={() => navigate(`/article/${articles[0].id}`)}
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

        {/* Second recently added Article - Only display on larger screens */}
        <div className='w-[370px] md:w-[530px] h-[200px] md:h-[280px] pr-5 rounded-lg relative hidden md:block'>
          {isRecentlyFetching ? (
            <Skeleton className='rounded-lg w-[530px] h-[280px]' />
          ) : articles[1] ? (
            <div 
              className='w-full h-full rounded-lg relative cursor-pointer'
              onClick={() => navigate(`/article/${articles[1].id}`)}
            >
              <div className='absolute w-full h-full bg-gradient-to-r from-black rounded-lg'></div>
              <img
                src={articles[1].coverImage}
                alt='content image'
                className='w-full h-full object-cover rounded-lg'
                loading="lazy"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className='absolute w-full top-4 md:top-[15%] p-4 md:p-8'>
                <div className='text-center text-white w-[250px] md:w-[400px]'>
                  <h1 className='text-lg md:text-3xl font-medium'>
                    {articles[1].title.length > 20 ? `${articles[1].title.substring(0, 20)}...` : articles[1].title}
                  </h1>
                  <p className='text-xs md:text-base font-light'>
                    {articles[1].timestamp ? new Date(articles[1].timestamp.toDate()).toLocaleDateString() : 'Unknown Date'}
                  </p>
                  <p className='text-xs md:text-base'>
                    {stripHtml(articles[1].content).length > 130 ? `${stripHtml(articles[1].content).substring(0, 130)}...` : stripHtml(articles[1].content)}
                  </p>
                </div>
                <button
                  className='my-2 px-2 p-1 md:p-2 flex justify-center border md:border-[1.6px] border-[#bbdefb] items-center rounded-md text-white text-xs md:text-base font-normal md:font-medium'
                  onClick={() => navigate(`/article/${articles[1].id}`)}
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

      {/* Category Buttons */}
      <CategoryBtn setCategory={setSelectedCategory} selectedCategory={selectedCategory} />

      {/* Trending Section */}
      <Trending />

      {/* Category Articles */}
      <CategoryArticles category={selectedCategory} />

      {/* Recently Added Section */}
      <div className="p-3 md:p-5">
        <h1 className="text-2xl md:text-4xl font-bold pb-4">Recently Added</h1>
        <div className="p-4 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-10">
          {isRecentlyFetching ? (
            // Show skeletons while fetching "Recently Added"
            Array.from({ length: ARTICLES_BATCH_SIZE }).map((_, index) => (
              <div key={index} className="flex flex-row w-full h-[135px] md:h-[280px] p-2 md:p-4 rounded-lg shadow-sm">
                <Skeleton className="w-full h-[115px] md:h-[280px] rounded-lg object-cover" />
                <div className="text-left pl-2 md:p-10 flex flex-col justify-between w-full">
                  <Skeleton height={20} width={200} />
                  <Skeleton height={16} width={100} />
                  <Skeleton height={14} width={250} />
                </div>
              </div>
            ))
          ) : displayedArticles.length > 0 ? (
            displayedArticles.map((article) => (
              <div 
                key={article.id} 
                className="flex flex-row w-full h-[135px] md:h-[280px] p-2 md:p-4 rounded-lg shadow-sm cursor-pointer relative" 
                onClick={() => navigate(`/article/${article.id}`)}
              >
                {user?.uid === article.authorId && (
                  <button 
                    className='absolute top-2 right-2 z-10 menu-button'
                    onClick={(e) => { e.stopPropagation(); handleMenuToggle(article.id); }}
                  >
                    <FaEllipsisV color='black' />
                  </button>
                )}
                {menuOpen === article.id && (
                  <div className='absolute top-10 right-2 bg-white text-black rounded shadow-md menu-dropdown'>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(article.id); }} 
                      className='block px-4 py-2 text-left w-full hover:bg-gray-200'
                    >
                      Edit
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(article.id); }} 
                      className='block px-4 py-2 text-left w-full hover:bg-gray-200'
                    >
                      Delete
                    </button>
                  </div>
                )}
                <img
                  src={article.coverImage || Chucky}
                  alt="content"
                  className="w-[115px] md:w-[240px] h-[115px] md:h-[240px] rounded-lg object-cover"
                  loading="lazy"
                  onError={(e) => { e.target.src = Chucky; }}
                />
                <div className="text-left pl-2 md:p-10 flex flex-col justify-center w-full">
                  <h1 className="text-lg md:text-3xl font-medium md:font-semibold">
                    {article.title.length > 20 ? `${article.title.substring(0, 20)}...` : article.title}
                  </h1>
                  <p className="text-xs md:text-base font-thin py-2">
                    {article.timestamp ? new Date(article.timestamp.toDate()).toLocaleDateString() : 'Unknown Date'}
                  </p>
                  <p className="text-[10px] md:text-base text-[#5c6972]">
                    {stripHtml(article.content).length > 60 ? `${stripHtml(article.content).substring(0, 60)}...` : stripHtml(article.content)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-2">No articles found in this category.</p>
          )}
        </div>
        {lastVisible && displayedArticles.length > 0 && (
          <div className="flex justify-center" >
            <button
              onClick={loadMoreArticles}
              className="my-2 px-4 py-2 bg-[#6e44ff] text-white rounded-md text-base font-medium flex items-center justify-center"
              disabled={loadingMore}
            >
              {loadingMore ? <Skeleton width={80} height={20} /> : 'Load More'}
            </button>
          </div>
        )}
      </div>  
    </div>
  );
}

export default Home;








/*

<div className='flex p-4 md:p-10'>
        <Swiper
          slidesPerView={7}
          spaceBetween={10}
          freeMode={true}
          modules={[FreeMode, Pagination]}
          className="mySwiper"
        >
          <SwiperSlide>
            <button className='my-2 p-2 flex justify-center border md:border-[1.6px] border-[#bbdefb] rounded-md w-full text-[#9391ff] font-normal md:font-medium'>
              Trending
            </button>
          </SwiperSlide>
          <SwiperSlide>
            <button className='my-2 p-2 flex justify-center border md:border-[1.6px] border-[#bbdefb] rounded-md w-full text-[#9391ff] font-normal md:font-medium'>
              Entertainment
            </button>
          </SwiperSlide>
          <SwiperSlide>
            <button className='my-2 p-2 flex justify-center border md:border-[1.6px] border-[#bbdefb] rounded-md w-full text-[#9391ff] font-normal md:font-medium'>
              Lifestyle
            </button>
          </SwiperSlide>
          <SwiperSlide>
            <button className='my-2 p-2 flex justify-center border md:border-[1.6px] border-[#bbdefb] rounded-md w-full text-[rgb(147,145,255)] font-normal md:font-medium'>
              Religion
            </button>
          </SwiperSlide>
          <SwiperSlide>
            <button className='my-2 p-2 flex justify-center border md:border-[1.6px] border-[#bbdefb] rounded-md w-full text-[#9391ff] font-normal md:font-medium'>
              Health
            </button>
          </SwiperSlide>
          <SwiperSlide>
            <button className='my-2 p-2 flex justify-center border md:border-[1.6px] border-[#bbdefb] rounded-md w-full text-[#9391ff] font-normal md:font-medium'>
              Food
            </button>
          </SwiperSlide>
          <SwiperSlide>
            <button className='my-2 p-2 flex justify-center border md:border-[1.6px] border-[#bbdefb] rounded-md w-full text-[#9391ff] font-normal md:font-medium'>
              Politics
            </button>
          </SwiperSlide>
          <SwiperSlide>
            <button className='my-2 p-2 flex justify-center border md:border-[1.6px] border-[#bbdefb] rounded-md w-full text-[#9391ff] font-normal md:font-medium'>
              Relationship
            </button>
          </SwiperSlide>
          <SwiperSlide>
            <button className='my-2 p-2 flex justify-center border md:border-[1.6px] border-[#bbdefb] rounded-md w-full text-[#9391ff] font-normal md:font-medium'>
              Technology
            </button>
          </SwiperSlide>
          <SwiperSlide>
            <button className='my-2 p-2 flex justify-center border md:border-[1.6px] border-[#bbdefb] rounded-md w-full text-[#9391ff] font-normal md:font-medium'>
              Education
            </button>
          </SwiperSlide>
          <SwiperSlide>
            <button className='my-2 p-2 flex justify-center border md:border-[1.6px] border-[#bbdefb] rounded-md w-full text-[#9391ff] font-normal md:font-medium'>
              Family
            </button>
          </SwiperSlide>
        </Swiper>
      </div>


<div className='p-4 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-10'>
          <div className='flex flex-row w-[360px] md:w-full h-[135px] md:h-[280px] p-2 md:p-4 rounded-lg shadow-sm'>
            <img src={Chucky} className='w-[115px] md:w-full h-[115px] md:h-[240px] rounded-lg object-cover' /> 
            <div className=' text-left pl-2 md:p-10'>
              <h1 className='text-lg md:text-3xl font-medium md:font-semibold'>A bear and a monkey</h1>
              <p className='text-xs md:text-base font-thin'>10 September</p>
              <p className='text-[10px] md:text-base text-[#5c6972] '>Had plenty money. They went to the shop. For carrots and honey. When the bear and the monkey said, Carrots and honey! The man in the shop cried, where is your money? How strange and funny. They really had money! And so they....</p>
            </div>
          </div>

          <div className='flex flex-row w-[360px] md:w-full h-[135px] md:h-[280px] p-2 md:p-4 rounded-lg shadow-sm'>
            <img src={Chucky} className='w-[115px] md:w-full h-[115px] md:h-[240px] rounded-lg object-cover' /> 
            <div className=' text-left pl-2 md:p-10'>
            <h1 className='text-lg md:text-3xl font-medium md:font-semibold'>A bear and a monkey</h1>
            <p className='text-xs md:text-base font-thin'>10 September</p>
            <p className='text-[10px] md:text-base text-[#5c6972] '>Had plenty money. They went to the shop. For carrots and honey. When the bear and the monkey said, Carrots and honey! The man in the shop cried, where is your money? How strange and funny. They really had money! And so they....</p>
            </div>
          </div>

          <div className='flex flex-row w-[360px] md:w-full h-[135px] md:h-[280px] p-2 md:p-4 rounded-lg shadow-sm'>
          <img src={Chucky} className='w-[115px] md:w-full h-[115px] md:h-[240px] rounded-lg object-cover' /> 
          <div className=' text-left pl-2 md:p-10'>
          <h1 className='text-lg md:text-3xl font-medium md:font-semibold'>A bear and a monkey</h1>
          <p className='text-xs md:text-base font-thin'>10 September</p>
          <p className='text-[10px] md:text-base text-[#5c6972] '>Had plenty money. They went to the shop. For carrots and honey. When the bear and the monkey said, Carrots and honey! The man in the shop cried, where is your money? How strange and funny. They really had money! And so they....</p>
          </div>
        </div>

        <div className='flex flex-row w-[360px] md:w-full h-[135px] md:h-[280px] p-2 md:p-4 rounded-lg shadow-sm'>
        <img src={Chucky} className='w-[115px] md:w-full h-[115px] md:h-[240px] rounded-lg object-cover' /> 
        <div className=' text-left pl-2 md:p-10'>
        <h1 className='text-lg md:text-3xl font-medium md:font-semibold'>A bear and a monkey</h1>
        <p className='text-xs md:text-base font-thin'>10 September</p>
        <p className='text-[10px] md:text-base text-[#5c6972] '>Had plenty money. They went to the shop. For carrots and honey. When the bear and the monkey said, Carrots and honey! The man in the shop cried, where is your money? How strange and funny. They really had money! And so they....</p>
        </div>
      </div>

      <div className='flex flex-row w-[360px] md:w-full h-[135px] md:h-[280px] p-2 md:p-4 rounded-lg shadow-sm'>
      <img src={Chucky} className='w-[115px] md:w-full h-[115px] md:h-[240px] rounded-lg object-cover' /> 
      <div className=' text-left pl-2 md:p-10'>
      <h1 className='text-lg md:text-3xl font-medium md:font-semibold'>A bear and a monkey</h1>
      <p className='text-xs md:text-base font-thin'>10 September</p>
      <p className='text-[10px] md:text-base text-[#5c6972] '>Had plenty money. They went to the shop. For carrots and honey. When the bear and the monkey said, Carrots and honey! The man in the shop cried, where is your money? How strange and funny. They really had money! And so they....</p>
      </div>
    </div>
     */