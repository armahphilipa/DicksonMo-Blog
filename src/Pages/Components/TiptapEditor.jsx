// TiptapEditor.jsx
import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor } from '@tiptap/react';
import {  useEffect } from 'react';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Placeholder from '@tiptap/extension-placeholder';
import BlockquoteExtension from '@tiptap/extension-blockquote'; // Renamed to avoid conflict
import {
  BiBold,
  BiAlignRight,
  BiAlignLeft,
  BiLink,
  BiItalic,
  BiUnderline,
  BiSolidQuoteAltLeft,
} from 'react-icons/bi';
import { HiListBullet } from 'react-icons/hi2';
import { BsAlignCenter } from 'react-icons/bs';
import { GrOrderedList } from 'react-icons/gr';
import '/src/index.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import { FreeMode, Pagination } from 'swiper/modules';
import '/src/index.css'; 

const TiptapEditor = ({ setContent, initialContent, className }) => {
  // Removed unused state
  // const [editorContent, setEditorContent] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false, // Prevents links from opening when clicked
      }),
      BulletList,
      OrderedList,
      TextAlign.configure({ types: ['heading', 'paragraph'] }), // Fixed typo
      Placeholder.configure({
        placeholder: ['Write your article here...'],
      }),
      BlockquoteExtension,
    ],
    content: initialContent || 'Write your article here...',
    onUpdate({ editor }) {
      const htmlContent = editor.getHTML();
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  if (!editor) {
    return null;
  }

  // Function to add a link
  const addLink = () => {
    const url = prompt('Enter the URL:');
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .run();
    }
  };

  // Removed unused unsetLink function
  // const unsetLink = () => {
  //   editor.chain().focus().unsetLink().run();
  // };

  return (
    <>

    <div className='block md:hidden  mb-2'>

      <Swiper
            slidesPerView={7}
            spaceBetween={1}
            freeMode={true}
            modules={[FreeMode, Pagination]}
            className="mySwiper"
          >
            <SwiperSlide>
            {/* Bold Button */}
            <button
              type='button'
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              className={`p-2 ${
                editor.isActive('bold') ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Bold'
            >
              <BiBold />
            </button>
            </SwiperSlide>

            <SwiperSlide>
            {/* Italic Button */}
              <button
                type='button'
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`p-2 ${
                  editor.isActive('italic') ? 'bg-gray-200' : 'bg-white'
                } rounded-md`}
                aria-label='Italic'
              >
                <BiItalic />
              </button>
            </SwiperSlide>

            <SwiperSlide>
            {/* Underline Button */}
            <button
              type='button'
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={!editor.can().chain().focus().toggleUnderline().run()}
              className={`p-2 ${
                editor.isActive('underline') ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Underline'
            >
              <BiUnderline />
            </button>
            </SwiperSlide>

            <SwiperSlide>{/* Align Left Button */}
            <button
              type='button'
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-2 ${
                editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Align Left'
            >
              <BiAlignLeft />
            </button>
            </SwiperSlide>
            <SwiperSlide>
            {/* Align Center Button */}
            <button
              type='button'
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`p-2 ${
                editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Align Center'
            >
              <BsAlignCenter />
            </button>
            </SwiperSlide>

            <SwiperSlide>

            {/* Align Right Button */}
            <button
              type='button'
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-2 ${
                editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Align Right'
            >
              <BiAlignRight />
            </button>
            </SwiperSlide>

            <SwiperSlide>

            {/* Heading 1 Button */}
            <button
              type='button'
              onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()}
              className={`p-2 ${
                editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Heading 1'
            >
              H1
            </button>
            </SwiperSlide>

            <SwiperSlide>

            {/* Heading 2 Button */}
            <button
              type='button'
              onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
              className={`p-2 ${
                editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Heading 2'
            >
              H2
            </button>
            </SwiperSlide>

            <SwiperSlide>

            {/* Paragraph Button */}
            <button
              type='button'
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={`p-2 ${
                editor.isActive('paragraph') ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Paragraph'
            >
              P
            </button>
            </SwiperSlide>
            <SwiperSlide>

            {/* Bullet List Button */}
            <button
              type='button'
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 ${
                editor.isActive('bulletList') ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Bullet List'
            >
              <HiListBullet />
            </button>
            </SwiperSlide>

            <SwiperSlide>

            {/* Ordered List Button */}
            <button
              type='button'
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 ${
                editor.isActive('orderedList') ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Ordered List'
            >
              <GrOrderedList />
            </button>
            </SwiperSlide>

            <SwiperSlide>

            {/* Add Link Button */}
            <button
              type='button'
              onClick={addLink}
              className={`p-2 ${
                editor.isActive('link') ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Add Link'
            >
              <BiLink />
            </button>
            </SwiperSlide>
            <SwiperSlide>

            {/* Blockquote Button */}
            <button
              type='button'
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 ${
                editor.isActive('blockquote') ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Blockquote'
            >
              <BiSolidQuoteAltLeft />
            </button>
            </SwiperSlide>
          </Swiper>

      </div>
      {/* Toolbar */}
      <div className='hidden md:block mb-2'>

      <Swiper
            slidesPerView={12}
            spaceBetween={1}
            freeMode={true}
            modules={[FreeMode, Pagination]}
            className="mySwiper"
          >
            <SwiperSlide>
            {/* Bold Button */}
            <button
              type='button'
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              className={`p-2 ${
                editor.isActive('bold') ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Bold'
            >
              <BiBold />
            </button>
            </SwiperSlide>

            <SwiperSlide>
            {/* Italic Button */}
              <button
                type='button'
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`p-2 ${
                  editor.isActive('italic') ? 'bg-gray-200' : 'bg-white'
                } rounded-md`}
                aria-label='Italic'
              >
                <BiItalic />
              </button>
            </SwiperSlide>

            <SwiperSlide>
            {/* Underline Button */}
            <button
              type='button'
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={!editor.can().chain().focus().toggleUnderline().run()}
              className={`p-2 ${
                editor.isActive('underline') ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Underline'
            >
              <BiUnderline />
            </button>
            </SwiperSlide>

            <SwiperSlide>{/* Align Left Button */}
            <button
              type='button'
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-2 ${
                editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Align Left'
            >
              <BiAlignLeft />
            </button>
            </SwiperSlide>
            <SwiperSlide>
            {/* Align Center Button */}
            <button
              type='button'
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`p-2 ${
                editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Align Center'
            >
              <BsAlignCenter />
            </button>
            </SwiperSlide>

            <SwiperSlide>

            {/* Align Right Button */}
            <button
              type='button'
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-2 ${
                editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Align Right'
            >
              <BiAlignRight />
            </button>
            </SwiperSlide>

            <SwiperSlide>

            {/* Heading 1 Button */}
            <button
              type='button'
              onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()}
              className={`p-2 ${
                editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Heading 1'
            >
              H1
            </button>
            </SwiperSlide>

            <SwiperSlide>

            {/* Heading 2 Button */}
            <button
              type='button'
              onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
              className={`p-2 ${
                editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Heading 2'
            >
              H2
            </button>
            </SwiperSlide>

            <SwiperSlide>

            {/* Paragraph Button */}
            <button
              type='button'
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={`p-2 ${
                editor.isActive('paragraph') ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Paragraph'
            >
              P
            </button>
            </SwiperSlide>
            <SwiperSlide>

            {/* Bullet List Button */}
            <button
              type='button'
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 ${
                editor.isActive('bulletList') ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Bullet List'
            >
              <HiListBullet />
            </button>
            </SwiperSlide>

            <SwiperSlide>

            {/* Ordered List Button */}
            <button
              type='button'
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 ${
                editor.isActive('orderedList') ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Ordered List'
            >
              <GrOrderedList />
            </button>
            </SwiperSlide>

            <SwiperSlide>

            {/* Add Link Button */}
            <button
              type='button'
              onClick={addLink}
              className={`p-2 ${
                editor.isActive('link') ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Add Link'
            >
              <BiLink />
            </button>
            </SwiperSlide>
            <SwiperSlide>

            {/* Blockquote Button */}
            <button
              type='button'
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 ${
                editor.isActive('blockquote') ? 'bg-gray-200' : 'bg-white'
              } rounded-md`}
              aria-label='Blockquote'
            >
              <BiSolidQuoteAltLeft />
            </button>
            </SwiperSlide>
          </Swiper>

      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className={className} />
    </>
  );
};

export default TiptapEditor;


/*
// Toggle blockquote
editor.chain().focus().toggleBlockquote().run()


<div id="editor"></div>
<button onclick="editor.chain().focus().toggleBlockquote().run()">Toggle Blockquote</button>
 */