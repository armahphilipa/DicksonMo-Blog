// ArticleContent.jsx

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  doc, getDoc, collection, query, where, getDocs, limit, addDoc, deleteDoc, setDoc, updateDoc, increment, onSnapshot 
} from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { FiUser } from 'react-icons/fi';
import { BiComment, BiHeart, BiSolidHeart } from 'react-icons/bi';
import { HiOutlineMenuAlt3 } from 'react-icons/hi';
import { IoClose } from "react-icons/io5";
import { BiHome, BiLogOut } from 'react-icons/bi';
import { PiPenLight } from 'react-icons/pi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';


function ArticleContent() {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [nav, setNav] = useState(false);
  const [user, setUser] = useState(null); // Track authenticated user
  const navigate = useNavigate();

  // Toggle navigation menu
  const handleNav = () => {
    setNav(!nav);
  };

  const closeNav = () => {
    setNav(false);
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

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch article and related articles
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        if (!articleId) {
          console.error("No article ID provided.");
          return;
        }

        const articleRef = doc(db, 'articles', articleId);
        const articleSnap = await getDoc(articleRef);

        if (articleSnap.exists()) {
          const articleData = articleSnap.data();
          const authorName = await fetchAuthorName(articleData.authorId);
          setArticle({ id: articleSnap.id, ...articleData, authorName });

          // Fetch related articles
          const articlesQuery = query(
            collection(db, 'articles'),
            where('category', '==', articleData.category),
            orderBy('timestamp', 'desc'),
            limit(5) // Limit to 5 related articles
          );
          const querySnapshot = await getDocs(articlesQuery);

          const articles = [];
          querySnapshot.forEach((relatedDoc) => {
            if (relatedDoc.id !== articleId) {
              articles.push({ id: relatedDoc.id, ...relatedDoc.data() });
            }
          });
          setRelatedArticles(articles);
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching article:', error);
      }
    };

    fetchArticle();
  }, [articleId]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!articleId) return;
      try {
        const commentsRef = collection(db, 'articles', articleId, 'comments');
        const commentsQuery = query(commentsRef, orderBy('createdAt', 'asc'));
        const commentsSnapshot = await getDocs(commentsQuery);
        const fetchedComments = await Promise.all(commentsSnapshot.docs.map(async (commentDoc) => {
          const commentData = commentDoc.data();
          let displayName = 'Anonymous';
          if (commentData.userId) {
            const userRef = doc(db, 'users', commentData.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              displayName = userSnap.data().displayName;
            }
          }
          return {
            id: commentDoc.id,
            ...commentData,
            displayName,
          };
        }));
        setComments(fetchedComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [articleId]);

  // Fetch like status and count
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!articleId || !user) return;
      try {
        const likeRef = doc(db, 'articles', articleId, 'likes', user.uid);
        const likeSnap = await getDoc(likeRef);
        setLiked(likeSnap.exists());
      } catch (error) {
        console.error('Error fetching like status:', error);
      }
    };

    const fetchLikeCount = async () => {
      if (!articleId) return;
      try {
        const articleDocRef = doc(db, 'articles', articleId);
        const articleSnap = await getDoc(articleDocRef);
        if (articleSnap.exists()) {
          setLikeCount(articleSnap.data().likeCount || 0);
        }
      } catch (error) {
        console.error('Error fetching like count:', error);
      }
    };

    fetchLikeStatus();
    fetchLikeCount();
  }, [articleId, user]);

  // Handle like/unlike functionality
  const handleLike = async () => {
    if (!user) {
      alert('Please sign in to like the article.');
      return;
    }

    try {
      const likeRef = doc(db, 'articles', articleId, 'likes', user.uid);
      const articleDocRef = doc(db, 'articles', articleId);

      if (liked) {
        await deleteDoc(likeRef);
        await updateDoc(articleDocRef, {
          likeCount: increment(-1),
        });
        setLikeCount(prev => prev - 1);
        setLiked(false);
      } else {
        await setDoc(likeRef, {
          userId: user.uid,
          likedAt: new Date(),
        });
        await updateDoc(articleDocRef, {
          likeCount: increment(1),
        });
        setLikeCount(prev => prev + 1);
        setLiked(true);
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to comment.');
      return;
    }
    if (!newComment.trim()) return;

    try {
      const commentRef = collection(db, 'articles', articleId, 'comments');
      await addDoc(commentRef, {
        userId: user.uid,
        comment: newComment,
        createdAt: new Date(),
      });

      setNewComment('');

      // Refresh comments
      const commentsSnapshot = await getDocs(collection(db, 'articles', articleId, 'comments'));
      const fetchedComments = await Promise.all(commentsSnapshot.docs.map(async (commentDoc) => {
        const commentData = commentDoc.data();
        let displayName = 'Anonymous';
        if (commentData.userId) {
          const userRef = doc(db, 'users', commentData.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            displayName = userSnap.data().displayName;
          }
        }
        return {
          id: commentDoc.id,
          ...commentData,
          displayName,
        };
      }));
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/'); // Redirect to home after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Render skeleton loader while article is loading
  if (!article) {
    return (
      <div className="w-full min-h-screen p-4">
        {/* Navigation Bar Skeleton */}
        <div className="flex justify-between items-center mb-4">
          <Skeleton height={40} width={200} />
          <Skeleton height={40} width={150} />
        </div>

        {/* Article Title Skeleton */}
        <Skeleton height={40} width={`80%`} className="mb-2" />
        <Skeleton height={30} width={`60%`} className="mb-4" />

        {/* Cover Image Skeleton */}
        <Skeleton height={400} width={`100%`} className="mb-4" />

        {/* Article Content Skeleton */}
        <Skeleton count={3} />
        <Skeleton width={'90%'} height={16} className="ml-2" />
        <Skeleton width={'80%'} height={16} className="ml-auto" />
        <Skeleton count={3} />
        <Skeleton width={'80%'} height={16} className="ml-auto" />
        <Skeleton width={'60%'} height={16} className="ml-auto" />
        <Skeleton width={'90%'} height={16} className="ml-2" />
        <Skeleton width={'100%'} height={16} className="ml-auto" />
        <Skeleton width={'100%'} height={16} className="ml-auto" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      {/* Navigation Bar */}
      <nav className="w-full bg-[#f8f7ff] border-b border-b-[#f8f7ff] fixed top-0 left-0 z-50">
        <div className="p-4 mx-5 flex justify-between items-center">
          <h1 className="text-[#6e44ff] text-xl font-extrabold">Dicson Mo.</h1>

          {/* Hamburger Menu Icon */}
          <div onClick={handleNav} className="md:hidden cursor-pointer">
            <HiOutlineMenuAlt3 size={24} />
          </div>

          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-6">
            <li>
              <Link to="/" className="flex items-center text-[#6e44ff] hover:text-[#6d8d97]">
                <BiHome className="mr-1" /> Home
              </Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link to="/create" className="flex items-center text-[#6e44ff] hover:text-[#6d8d97]">
                    <PiPenLight className="mr-1" /> Write Article
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-[#6e44ff] hover:text-[#6d8d97] focus:outline-none"
                  >
                    <BiLogOut className="mr-1" /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="flex items-center text-[#6e44ff] hover:text-[#6d8d97]">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="flex items-center text-[#6e44ff] hover:text-[#6d8d97]">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Mobile Menu */}
        <div className={`fixed top-0 right-0 w-[60%] h-full rounded rounded-tl-2xl bg-[#f8f7ff] flex flex-col items-center justify-start p-4 transform transition-transform duration-500 ${nav ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Close Icon */}
          <div className="self-end">
            <IoClose size={24} onClick={closeNav} className="cursor-pointer" />
          </div>

          {/* Mobile Menu Items */}
          <ul className="mt-8 space-y-6 text-center">
            <li className="text-xl">
              <Link to="/" onClick={closeNav} className="flex items-center text-[#6e44ff] hover:text-[#6d8d97]">
                <BiHome className="mr-2" /> Home
              </Link>
            </li>
            {user ? (
              <>
                <li className="text-xl">
                  <Link to="/create" onClick={closeNav} className="flex items-center text-[#6e44ff] hover:text-[#6d8d97]">
                    <PiPenLight className="mr-2" /> Write Article
                  </Link>
                </li>
                <li className="text-xl">
                  <button
                    onClick={() => {
                      handleLogout();
                      closeNav();
                      navigate('/'); // Redirect after logout
                    }}
                    className="flex items-center text-[#6e44ff] hover:text-[#6d8d97] focus:outline-none"
                  >
                    <BiLogOut className="mr-2" /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="text-xl">
                  <Link to="/login" onClick={closeNav} className="flex items-center text-[#6e44ff] hover:text-[#6d8d97]">
                    Login
                  </Link>
                </li>
                <li className="text-xl">
                  <Link to="/signup" onClick={closeNav} className="flex items-center text-[#6e44ff] hover:text-[#6d8d97]">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      {/* Spacer for Fixed Nav */}
      <div className="h-16"></div>

      {/* Article Content */}
      <div className="m-4 p-5">
        <div className="flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl font-bold p-4">{article.title || 'Untitled Article'}</h1>
          <h2 className="text-2xl font-bold text-gray-700 p-4">{article.subtitle || 'No Subtitle Provided'}</h2>
          <div className="flex flex-row justify-center items-center p-5">
            <div className="flex justify-center items-center border border-white shadow-md rounded-full w-[35px] h-[35px]">
              <FiUser size={24} color="#9391ff" />
            </div>
            <p className="px-2 md:px-5 py-2 text-sm md:text-base font-medium text-[#6d8d97]">{article.authorName || 'Unknown Author'}</p>
            <p className="px-2 md:px-5 py-2 text-sm md:text-base font-medium text-[#6d8d97]">
              {article.timestamp ? new Date(article.timestamp.toDate()).toLocaleDateString() : 'Unknown Date'}
            </p>
          </div>
        </div>

        {/* Cover Image */}
        {article.coverImage && article.coverImage.trim() !== '' ? (
          <img 
            src={article.coverImage} 
            alt="article cover" 
            className="w-full h-[400px] object-cover mb-4" 
            onError={(e) => { e.target.style.display = 'none'; }} // Hides the image on error
            loading="lazy"
          />
        ) : null}

        {/* Article Content */}
        <div className="mt-4 text-justify" dangerouslySetInnerHTML={{ __html: article.content || '<p>No content available.</p>' }}></div>
      </div>

      {/* Like and Comment Buttons */}
      <div className='w-full py-5 px-4 flex justify-center'>
        <div className='w-[60%] h-[50px] flex flex-row justify-center items-center rounded-3xl border border-[#9381ff]'>
          {/* Comment Button */}
          <button className='px-4' onClick={() => setShowComments(true)}>
            <BiComment size={24} color='#6e44ff' />
          </button>

          {/* Like Button */}
          <div className='px-4 flex items-center'>
            <button onClick={handleLike}>
              {liked ? <BiSolidHeart size={24} color='#9391ff' /> : <BiHeart size={24} color='#6e44ff' />}
            </button>
            <p className='ml-2'>{likeCount}</p>
          </div>
        </div>
      </div>

      {/* Comment Section */}
      {showComments && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
          <div className='bg-white rounded-lg w-11/12 md:w-1/2 lg:w-1/3 p-6 relative overflow-y-auto max-h-screen'>
            <button
              className='absolute top-2 right-2 text-gray-500 text-2xl'
              onClick={() => setShowComments(false)}
            >
              &times;
            </button>
            <h2 className='text-xl font-bold mb-4'>Comments</h2>
            <div className='max-h-60 overflow-y-auto mb-4'>
              {comments.length > 0 ? (
                comments.map(comment => (
                  <div key={comment.id} className='flex items-start mb-4 border-b border-b-[#e2ddff] p-2 rounded'>
                    {/* First letter of the user's display name */}
                    <div className='flex-shrink-0 w-8 h-8 bg-[#c8bfff] text-white rounded-full flex items-center justify-center mr-3'>
                      {comment.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className='text-sm font-semibold'>{comment.displayName}</p>
                      <p className='text-sm'>{comment.comment}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className='text-sm text-gray-500'>No comments yet.</p>
              )}
            </div>
            <form onSubmit={handleCommentSubmit} className='flex flex-col'>
              <textarea
                className='border border-gray-300 p-2 rounded mb-2'
                placeholder='Write a comment...'
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              />
              <button
                type='submit'
                className='bg-[#6e44ff] text-white p-2 rounded'
              >
                Post Comment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MORE ARTICLES */}
      <div className='w-full bg-white'>
        <h1 className="text-lg text-gray-500 font-medium py-3 px-4">MORE ARTICLES</h1>
        <div className="p-4 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-10">
          {relatedArticles.length > 0 ? (
            relatedArticles.map((relatedArticle) => (
              <div
                key={relatedArticle.id}
                className="flex flex-row w-[360px] md:w-full h-[135px] md:h-[280px] p-2 md:p-4 rounded-lg shadow-sm cursor-pointer"
                onClick={() => navigate(`/article/${relatedArticle.id}`)}
              >
                <img
                  src={relatedArticle.coverImage || 'https://unsplash.com/photos/top-view-of-opened-magazine-near-up-of-coffee-VFs2fZEVkXo'}
                  className="w-[115px] md:w-full h-[115px] md:h-[240px] rounded-lg object-cover"
                  alt={relatedArticle.title}
                  loading="lazy"
                />
                <div className="text-left pl-2 md:p-10 flex flex-col justify-between w-full">
                  <h1 className="text-lg md:text-3xl font-medium md:font-semibold">
                    {relatedArticle.title.length > 20 ? `${relatedArticle.title.substring(0, 20)}...` : relatedArticle.title}
                  </h1>
                  <p className="text-xs md:text-base font-thin">
                    {relatedArticle.timestamp ? new Date(relatedArticle.timestamp.toDate()).toLocaleDateString() : 'Unknown Date'}
                  </p>
                  <p className="text-[10px] md:text-base text-[#5c6972]">
                    {stripHtml(relatedArticle.content).length > 190 ? `${stripHtml(relatedArticle.content).substring(0, 190)}...` : stripHtml(relatedArticle.content)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-2">No related articles found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArticleContent;



/*{article.coverImage && article.coverImage.trim() !== '' ? (
          <img 
            src={article.coverImage} 
            alt="article cover" 
            className="w-full h-[400px] object-cover mb-4" 
            onError={(e) => { e.target.style.display = 'none'; }} // Hides the image on error
            loading="lazy"
          />
        ) : null} */