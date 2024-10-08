import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { FiUser } from 'react-icons/fi';

function Preview() {
  const { articleId } = useParams(); // Get article ID from the URL
  const [article, setArticle] = useState(null);

  // Helper function to strip HTML tags
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

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

  useEffect(() => {
    const fetchArticle = async () => {
      const articleRef = doc(db, 'articles', articleId);
      const articleSnap = await getDoc(articleRef);

      if (articleSnap.exists()) {
        const articleData = articleSnap.data();
        const authorName = await fetchAuthorName(articleData.authorId);
        setArticle({ ...articleData, authorName });

        // Fetch related articles
        const articlesQuery = query(
          collection(db, 'articles'),
          where('category', '==', articleData.category),
          limit(5) // Limit to 5 articles
        );
        const querySnapshot = await getDocs(articlesQuery);

        const articles = [];
        querySnapshot.forEach((doc) => {
          if (doc.id !== articleId) {
            articles.push({ id: doc.id, ...doc.data() });
          }
        });
        setRelatedArticles(articles);
      }
    };

    fetchArticle();
  }, [articleId]);

  if (!article) return <div>Loading...</div>;

  return (
    <div className="w-full h-screen">
      <nav className="w-full h-50 bg-white border border-b-[#f8f7ff]">
        <div className="p-4 mx-5 flex justify-between">
          <h1 className="text-[#9391ff] text-xl font-extrabold ">Dickson Mo.</h1>
        </div>

        <Link to='/Create'>
              <button className='w-full px-4 py-1 flex flex-shrink-0 h-10 justify-center text-white text-sm md:text-base rounded-md bg-[#9391ff] font-normal md:font-medium'>Go back</button>
            </Link>
      </nav>

      <div className="m-4 p-5">
        <div className="flex flex-col justify-center align-middle text-center">
          <h1 className="text-4xl font-bold p-4">{article.title}</h1>
          <h2 className="text-2xl font-bold text-gray-700 p-4">{article.subtitle}</h2>
          <div className="flex flex-row justify-center p-5">
            <div className="flex justify-center items-center border border-white shadow-md rounded-[50%] w-[35px] h-[35px]">
              <FiUser size={24} color="#9391ff" />
            </div>
            <p className="px-5 py-2 font-medium text-[#6d8d97]">{article.authorName}</p>
            <p className="px-5 py-2 font-medium text-[#6d8d97]">
              {new Date(article.timestamp.toDate()).toLocaleDateString()}
            </p>
          </div>
        </div>

        {article.coverImage && (
          <img src={article.coverImage} alt="article cover" className="w-full h-[400px] object-cover" />
        )}

        <div dangerouslySetInnerHTML={{ __html: article.content }}></div>
      </div>
    </div>
  );
}

export default Preview;