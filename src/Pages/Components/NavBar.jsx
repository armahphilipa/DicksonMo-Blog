import React, {useState} from 'react';
import {HiOutlineMenuAlt3} from 'react-icons/hi';
import { IoClose } from "react-icons/io5";
import { BiHome } from 'react-icons/bi';
import { BiLogOut } from 'react-icons/bi';
import { PiPenLight } from 'react-icons/pi';

export const NavBar = () => {
    const [nav, setNav] = useState(false);

    const handleNav = () =>{
        setNav(!nav);
    };

    const closeNav = () => {
        setNav(false);
    };

  return (
    <div className='sticky top-0 w-full bg-transparent h-15 md:h-20 flex justify-between items-center text-[#4a4063] z-50' >
        <h1 className="text-[#9391ff] text-xl font-extrabold">Dickson Mo.</h1>
       
        <div onClick={handleNav} className=''>
            {nav ? <IoClose size={20} /> : <HiOutlineMenuAlt3 size={20} />}
        </div>
        <div className={`fixed top-10 w-[65%] flex flex-col justify-center items-center bg-[#f8f7ff] ease-in-out duration-500 ${nav ? 'left-100' : 'left-[-100%]'}`}>
            <ul className='p-4'>
                <li className='p-4' onClick={closeNav}><Link to='/' ><BiHome className='px-2'/> Home</Link></li>
                <li className='p-4' onClick={closeNav}><Link to='/' ><BiLogOut className='px-2'/> LogOut</Link></li>
                <li className='p-4' onClick={closeNav}><Link to='/' ><PiPenLight className='px-2'/> Write Article</Link></li>
            </ul>
        </div>
    </div>
  )
}