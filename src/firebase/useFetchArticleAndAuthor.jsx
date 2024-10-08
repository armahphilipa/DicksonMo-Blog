import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Import Firestore config

const useFetchArticleAndAuthor = (articleId) => {
  const [article, setArticle] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticleAndAuthor = async () => {
      try {
        // Fetch the article data
        const articleRef = doc(db, 'articles', articleId);
        const articleSnap = await getDoc(articleRef);

        if (articleSnap.exists()) {
          const articleData = articleSnap.data();
          setArticle(articleData);

          // Fetch the author's name using authorId from the article data
          const authorRef = doc(db, 'users', articleData.authorId);
          const authorSnap = await getDoc(authorRef);

          if (authorSnap.exists()) {
            setAuthor(authorSnap.data().displayName); // Assuming 'displayName' is stored in the users collection
          } else {
            console.error('No author document found!');
          }
        } else {
          console.error('No article document found!');
        }
      } catch (err) {
        console.error('Error fetching article/author:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleAndAuthor();
  }, [articleId]);

  return { article, author, loading, error };
};

export default useFetchArticleAndAuthor;