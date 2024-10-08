import React, { useEffect, useState } from 'react';
import { FiUser } from 'react-icons/fi';
import { BiComment } from 'react-icons/bi';
import { collection, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import Chucky from '../assets/movie2.jpg'; // Fallback image
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const CategoryArticles = ({ category }) => {
  const [articles, setArticles] = useState([]); // Stores articles based on category
  const [loading, setLoading] = useState(true); // Loading state
  const [user, setUser] = useState(null); // Current authenticated user
  const [commentData, setCommentData] = useState({}); // Holds comment inputs per article
  const [showCommentBox, setShowCommentBox] = useState({}); // Toggles comment box visibility per article
  const navigate = useNavigate();

  // Track user's authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser ? currentUser : null);
    });

    return () => unsubscribe();
  }, []);

  // Fetch articles based on selected category
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const articlesRef = collection(db, 'articles');
        let articlesQuery;

        if (category && category !== 'All') {
          // Filter by selected category
          articlesQuery = query(articlesRef, where('category', '==', category));
        } else {
          // Fetch all articles if "All" is selected or no category is selected
          articlesQuery = query(articlesRef);
        }

        const articlesSnapshot = await getDocs(articlesQuery);
        const fetchedArticles = articlesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setArticles(fetchedArticles);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [category]);

  // Handle comment input change
  const handleCommentChange = (articleId, value) => {
    setCommentData(prev => ({
      ...prev,
      [articleId]: value,
    }));
  };

  // Handle comment submission
  const handleCommentSubmit = async (articleId) => {
    if (!user) {
      alert('Please sign up or log in to write a comment.');
      return;
    }

    const commentText = commentData[articleId];
    if (!commentText || commentText.trim() === '') {
      alert('Comment cannot be empty.');
      return;
    }

    try {
      const commentsRef = collection(db, 'articles', articleId, 'comments');
      await addDoc(commentsRef, {
        userId: user.uid,
        displayName: user.displayName || 'Anonymous',
        comment: commentText.trim(),
        createdAt: serverTimestamp(),
      });
      alert('Comment posted successfully!');
      setCommentData(prev => ({
        ...prev,
        [articleId]: '',
      }));
      // Optionally, you can fetch and display the updated comments here
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    }
  };

  // Toggle comment box visibility
  const toggleCommentBox = (articleId) => {
    setShowCommentBox(prev => ({
      ...prev,
      [articleId]: !prev[articleId],
    }));
  };

  // Navigate to article detail page
  const navigateToArticle = (articleId) => {
    navigate(`/article/${articleId}`);
  };

  // Strip HTML tags from article content
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  return (
    <div className="w-full bg-white p-4 md:p-10">
      <h1 className="text-2xl md:text-4xl font-bold pb-4">
        {category && category !== 'All' ? `${category} Articles` : 'Featured Articles'}
      </h1>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(5).fill().map((_, index) => (
            <div key={index} className="border-b-2 md:border-2 border-[#c8c6d7] rounded-lg overflow-hidden shadow-sm">
              {/* Article Header Skeleton */}
              <div className="flex items-center p-4">
                <div className="rounded-full w-9 h-9 bg-[#c8c6d7] animate-pulse"></div>
                <div className="ml-3">
                  <Skeleton width={100} height={16} />
                  <Skeleton width={80} height={14} />
                </div>
              </div>

               {/* Article Content Skeleton */}
              <div className="px-4">
                <Skeleton width={60} height={20} />
                <Skeleton height={40} className="mt-2" />
              </div>

              <div className="flex items-center p-4">
                <Skeleton circle={true} height={24} width={24} />
                <Skeleton width={50} height={16} className="ml-2" />
                <Skeleton width={80} height={16} className="ml-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <p className="text-center text-gray-500">No articles available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <div
              key={article.id}
              className="border-b-2 md:border-2 border-[#c8bfff] rounded-lg overflow-hidden"
              onClick={() => navigate(`/article/${article.id}`)}
            >
              <div className="flex items-center p-4">
                <div className="flex justify-center items-center border border-white shadow-md rounded-full w-9 h-9">
                  <FiUser size={24} color="#9391ff" />
                </div>
                <div className="ml-3">
                  <p className="font-medium">{article.author || 'Unknown Author'}</p>
                  <p className="font-thin text-sm">
                    {article.timestamp ? new Date(article.timestamp.toDate()).toLocaleDateString() : 'Unknown Date'}
                  </p>
                </div>
              </div>
              <div className="px-4">
                <h2 className="text-lg md:text-xl font-medium py-2">
                  {article.title.length > 24 ? `${article.title.substring(0, 24)}...` : article.title}
                </h2>
                <img
                  src={article.coverImage || Chucky}
                  alt={article.title}
                  className="w-full h-40 md:h-52 object-cover rounded-lg"
                  loading="lazy"
                />
              </div>

                {/* Article Actions */}
                <div className="flex items-center p-4">
                  <BiComment
                    size={24}
                    color="#9391ff"
                    className="cursor-pointer"
                    onClick={() => toggleCommentBox(article.id)}
                  />
                  <p className="ml-2">Discuss</p>
                  <p className="ml-auto">
                    <span className="font-medium">{article.likeCount || 0}</span> Likes
                  </p>
                </div>

                {/* Comment Section */}
                {showCommentBox[article.id] && (
                  <div className="px-4 pb-4">
                    {user ? (
                      <div>
                        <textarea
                          value={commentData[article.id] || ''}
                          onChange={(e) => handleCommentChange(article.id, e.target.value)}
                          placeholder="Write a comment..."
                          className="w-full border rounded-md p-2"
                        />
                        <button
                          className="mt-2 bg-[#6e44ff] text-white px-4 py-2 rounded-md"
                          onClick={() => handleCommentSubmit(article.id)}
                        >
                          Submit
                        </button>
                      </div>
                    ) : (
                      <p className="text-red-500">Please sign up or log in to write a comment.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
 } )
    </div>
  );
};

export default CategoryArticles;