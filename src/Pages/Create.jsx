// Create.jsx
import React, { useState } from 'react';
import Cover from '../assets/upload-cloud.svg';
import { FiEye } from 'react-icons/fi';
import TiptapEditor from './Components/TiptapEditor';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db, auth, storage } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import storage functions


function Create() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');

  const navigate = useNavigate();

  const handlePreview = async () => {
    await handlePublish('preview');
  };

  const handlePublish = async (action) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('You must be logged in to publish an article.');
        return;
      }

      let coverImageUrl = '';
      if (file) {
        const storageRef = ref(storage, `covers/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        coverImageUrl = await getDownloadURL(storageRef);
      }

      const articleRef = doc(collection(db, 'articles'));

      // Set the article data, including category and coverImageUrl
      await setDoc(articleRef, {
        title,
        subtitle,
        content,
        category,
        coverImage: coverImageUrl, // Store the download URL
        authorId: user.uid,
        timestamp: new Date(),
        likeCount: 0, // Initialize likeCount
      });

      if (action === 'publish') {
        alert('Article published successfully!');
        navigate(`/article/${articleRef.id}`);
      } else if (action === 'preview') {
        // Implement preview functionality if needed
        navigate(`/article/${articleRef.id}/preview`);
      }
    } catch (error) {
      console.error('Error publishing article:', error);
      alert('Failed to publish the article. Please try again.');
    }
  };

  return (
    <div className='w-full min-h-screen bg-white'>
      <nav className='w-full bg-white border-b border-b-[#f8f7ff] fixed top-0 left-0'>
        <div className='p-4 mx-2 md:mx-5 flex justify-between'>
          <h1 className='text-[#6e44ff] text-xl font-extrabold'>Dicson Mo.</h1>

          <div className='flex flex-row'>
            <button
              className='flex flex-row justify-center items-center bg-white rounded-md border-2 border-[#9581ff] text-[#6e44ff] md:font-medium text-sm md:text-base mr-4 px-2 md:px-4'
              type='button'
              onClick={handlePreview}
            >
              <FiEye size={20} color='#7d53ff' className='pr-1' /> Preview
            </button>
            <button
              className='bg-[#6d53ff] md:font-medium text-sm md:text-base rounded-md border-none ml-4 px-2 md:px-4 text-white'
              type='button'
              onClick={() => handlePublish('publish')}
            >
              Publish
            </button>
          </div>
        </div>
      </nav>
      <form className='p-5 mx-2 md:mx-10'>
        <div className='flex flex-row justify-center gap-2 py-4 md:py-10'>
        <div className='flex flex-col-reverse items-start align-middle gap-2 md:flex-row justify-center'>
        <div className='md:pr-4'>
        <label id='drop-area' className='text-gray-400'>
          <input
            type='file'
            name='cover image'
            accept='image/*'
            className='hidden'
            onChange={(e) => setFile(e.target.files[0])}
          />
          <div className='flex flex-row justify-center items-center'>
            <img src={Cover} alt='icon' />
            <p className='px-2 md:px-4 text-sm md:text-base'>Add cover</p>
          </div>
        </label>
      </div>
      <div>
        <input
          type='text'
          name='Subtitle'
          placeholder='Add Subtitle'
          className='placeholder-gray-400 border-none text-black focus:outline-none text-sm md:text-xl font-semibold'
          onChange={(e) => setSubtitle(e.target.value)}
        />
      </div>
        </div>
          
          <select
            name='categories'
            defaultValue='Select Category'
            className='text-sm md:text-base text-gray-600 focus:outline-none'
            onChange={(e) => setCategory(e.target.value)}
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
          className='text-4xl font-bold placeholder-gray-400 text-black focus:outline-none py-4 w-[360px] h-auto'
          onChange={(e) => setTitle(e.target.value)}
        />

        <TiptapEditor setContent={setContent} />
      </form>
    </div>
  );
}

export default Create;


