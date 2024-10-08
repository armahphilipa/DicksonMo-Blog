import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { db, storage } from '../firebaseConfig';

// Function to handle file upload and save to Firestore
export const handleFileUpload = (file, title, subtitle, category, content) => {
  if (!file) {
    alert('Please select a file to upload.');
    return;
  }

  // Create a reference to Firebase Storage
  const storageRef = ref(storage, `images/${file.name}`);

  // Upload the file
  const uploadTask = uploadBytesResumable(storageRef, file);

  // Monitor the upload progress
  uploadTask.on(
    'state_changed',
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log(`Upload is ${progress}% done`);
    },
    (error) => {
      // Handle upload errors
      console.error('Error during image upload:', error);
      alert(`Error uploading image: ${error.message}`); // Show more specific error message
    },
    () => {
      // When the upload is complete, get the file's download URL
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        console.log('File available at', downloadURL);

        // Save article data and image URL to Firestore
        saveArticleToFirestore(title, subtitle, category, content, downloadURL);
      });
    }
  );
};

// Function to save the article data to Firestore
const saveArticleToFirestore = async (title, subtitle, category, content, imageUrl) => {
  try {
    await addDoc(collection(db, 'articles'), {
      title,
      subtitle,
      category,
      content,
      imageUrl, // Store the image URL
      timestamp: new Date(), // Timestamp
    });
    alert('Article published successfully!');
  } catch (error) {
    console.error('Error publishing article:', error);
    alert('Failed to publish article');
  }
};

