// src/components/ArticleCard.jsx

import React, { useState } from 'react';
import { FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

function ArticleCard({ article, currentUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isAuthor = currentUser && currentUser.uid === article.authorId;

  const handleEdit = () => {
    navigate(`/edit-article/${article.id}`);
  };

  const handleDelete = async () => {
    confirmAlert({
      title: 'Confirm to delete',
      message: 'Are you sure you want to delete this article?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await deleteDoc(doc(db, 'articles', article.id));
              // Optionally, you can refresh the articles or handle state updates here
              window.location.reload(); // Simple way to refresh the page
            } catch (error) {
              console.error('Error deleting article:', error);
            }
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  return (
    <div 
      className="flex flex-row w-full h-[135px] md:h-[280px] p-2 md:p-4 rounded-lg shadow-sm relative cursor-pointer" 
      onClick={() => navigate(`/article/${article.id}`)}
    >
      <img
        src={article.coverImage || 'path_to_default_image'}
        alt="content"
        className="w-[115px] md:w-full h-[135px] md:h-[240px] rounded-lg object-cover"
        loading="lazy"
        onError={(e) => { e.target.src = 'path_to_default_image'; }}
      />
      <div className="text-left pl-2 md:p-10 flex flex-col justify-between w-full">
        <h1 className="text-lg md:text-3xl font-medium md:font-semibold">
          {article.title.length > 20 ? `${article.title.substring(0, 20)}...` : article.title}
        </h1>
        <p className="text-xs md:text-base font-thin">
          {article.timestamp ? new Date(article.timestamp.toDate()).toLocaleDateString() : 'Unknown Date'}
        </p>
        <p className="text-[10px] md:text-base text-[#5c6972]">
          {article.content.length > 45 ? `${article.content.substring(0, 45)}...` : article.content}
        </p>
      </div>

      {/* Three Dots Menu */}
      {isAuthor && (
        <div className="absolute top-2 right-2">
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the card's onClick
              setMenuOpen(!menuOpen);
            }}
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            <FaEllipsisV />
          </button>
          {menuOpen && (
            <div 
              className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg z-10"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the menu
            >
              <button 
                onClick={handleEdit}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <FaEdit className="mr-2" /> Edit
              </button>
              <button 
                onClick={handleDelete}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <FaTrash className="mr-2" /> Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ArticleCard;
