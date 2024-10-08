// src/components/Edit.jsx

import React, { useState, useEffect } from 'react';
import Cover from '/src/assets/upload-cloud.svg';
import { FiEye } from 'react-icons/fi';
import TiptapEditor from './TiptapEditor';
import { handleFileUpload } from '/src/firebase/firebaseUpload'; // Ensure this function can handle updates
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '/src/firebaseConfig'; // Ensure these are correctly exported
import { onAuthStateChanged } from 'firebase/auth';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function Edit() {
  const [file, setFile] = useState(null);
  const [existingCover, setExistingCover] = useState(null); // To display existing cover image
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState(''); // State to store editor content
  const [loading, setLoading] = useState(true); // Loading state while fetching data
  const [user, setUser] = useState(null); // Current authenticated user

  const navigate = useNavigate();
  const { id } = useParams(); // Get the article ID from the route parameters

  // Track user's authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        navigate('/Login'); // Redirect to login if not authenticated
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch existing article data
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const articleRef = doc(db, 'articles', id);
        const articleSnap = await getDoc(articleRef);

        if (articleSnap.exists()) {
          const data = articleSnap.data();

          // Check if the current user is the author
          if (user && data.authorId !== user.uid) {
            alert('You are not authorized to edit this article.');
            navigate('/Home');
            return;
          }

          setTitle(data.title);
          setSubtitle(data.subtitle);
          setCategory(data.category);
          setContent(data.content);
          setExistingCover(data.coverImage); // Set existing cover image
        } else {
          alert('Article not found.');
          navigate('/Home');
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        alert('An error occurred while fetching the article.');
        navigate('/Home');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchArticle();
    }
  }, [id, user, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!title || !content || !category) {
      alert('Please fill all required fields.');
      return;
    }

    try {
      let coverImageURL = existingCover;

      // If a new file is selected, upload it and get the new URL
      if (file) {
        coverImageURL = await handleFileUpload(file, title); // Modify handleFileUpload to return the URL
      }

      // Prepare the updated data
      const updatedData = {
        title,
        subtitle,
        category,
        content,
        coverImage: coverImageURL,
        timestamp: new Date(), // Update the timestamp to the current time
      };

      // Update the article in Firestore
      const articleRef = doc(db, 'articles', id);
      await updateDoc(articleRef, updatedData);

      alert('Article updated successfully!');
      navigate(`/article/${id}`); // Navigate to the updated article's page
    } catch (error) {
      console.error('Error updating article:', error);
      alert('An error occurred while updating the article.');
    }
  };

  const handlePreview = () => {
    navigate('/Preview', {
      state: { title, subtitle, category, content, coverImage: file || existingCover }, // Pass existing cover if no new file
    });
  };

  if (loading) {
    // Display a skeleton loader while fetching data
    return (
      <div className='w-full h-screen p-5'>
        <Skeleton height={50} width={200} />
        <Skeleton height={40} width={`60%`} className='my-4' />
        <Skeleton count={10} />
      </div>
    );
  }

  return (
    <div className='w-full min-h-screen bg-white'>
      {/* Navigation Bar */}
      <nav className='w-full bg-white border-b border-b-[#f8f7ff]'>
        <div className='p-4 mx-5 flex justify-between items-center'>
          <h1 className='text-[#9391ff] text-xl font-extrabold '>Dickson Mo.</h1>

          <div className='flex flex-row'>
            <button
              className='flex flex-row justify-center items-center bg-white rounded-md border-2 border-[#b8b8ff] text-[#9391ff] md:font-medium text-sm md:text-base mr-4 px-2 md:px-4'
              type='button'
              onClick={handlePreview}
            >
              <FiEye size={20} color='#9391ff' className='pr-1' /> Preview
            </button>
            <button
              className='bg-[#9391ff] md:font-medium text-sm md:text-base rounded-md border-none ml-4 px-2 md:px-4 text-white'
              type='button'
              onClick={handleUpdate}
            >
              Update
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer for Fixed Nav */}
      <div className="h-16"></div>

      <form className='p-5 mx-2 md:mx-10'>
        <div className='flex flex-row justify-between gap-2 py-4 md:py-10'>
          <div className='md:pr-4'>
            <label id='drop-area' className='text-gray-400 cursor-pointer'>
              <input
                type='file'
                name='cover image'
                accept='image/*'
                className='hidden'
                onChange={(e) => setFile(e.target.files[0])} // Capture the selected file
              />
              <div className='flex flex-row justify-center items-center'>
                {file || existingCover ? (
                  <img
                    src={file ? URL.createObjectURL(file) : existingCover}
                    alt='Cover Preview'
                    className='w-20 h-20 object-cover rounded-md'
                  />
                ) : (
                  <>
                    <img src={Cover} alt='icon' />
                    <p className='px-4 text-xs md:text-base'>Add cover</p>
                  </>
                )}
              </div>
            </label>
          </div>
          <div>
            <input
              type='text'
              name='Subtitle'
              placeholder='Add Subtitle'
              className='placeholder-gray-400 border-none text-black focus:outline-none text-sm md:text-xl font-semibold'
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)} // Update subtitle state
            />
          </div>
          <select
            name='categories'
            value={category}
            className='text-sm md:text-base text-gray-600 focus:outline-none'
            onChange={(e) => setCategory(e.target.value)} // Update category state
          >
            <option value=''>Select Category</option>
            <option value='Education'>Education</option>
            <option value='Food'>Food</option>
            <option value='Family'>Family</option>
            <option value='Lifestyle'>Lifestyle</option>
            <option value='Politics'>Politics</option>
            <option value='Relationship'>Relationship</option>
            <option value='Religion'>Religion</option>
            <option value='Technology'>Technology</option>
          </select>
        </div>
        <input
          type='text'
          name='title'
          placeholder='Article Title'
          className='text-4xl font-bold placeholder-gray-400 text-black focus:outline-none py-4'
          value={title}
          onChange={(e) => setTitle(e.target.value)} // Update title state
        />

        {/* Pass setContent as a prop to TiptapEditor */}
        <TiptapEditor setContent={setContent} initialContent={content} className='w-full h-full border-none focus:outline-none' />
      </form>
    </div>
  );
}

export default Edit;