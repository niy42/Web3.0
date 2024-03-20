import { useState } from "react";
import { HiMenuAlt4 } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";

import logo from "../assets/Bfree2.png";

const Menu = ({ title, classProps }) => {
    const getClassByTitle = function (title) {
        switch (title.toLowerCase()) {
            case 'market':
                return 'market';
            case 'exchange':
                return 'exchange'; 
            case 'tutorials':
                return 'tutorials';
            case 'wallets':
                return 'wallets'; 
            default:
                return '';
        }
    };
    const additionalClassProps = getClassByTitle(title);
    return (
        <li className={`${classProps}`}>
            <a href={`#${additionalClassProps.toLowerCase()}`}>{title}</a>
        </li>
    );
}

const Navbar = () => {
    const [toggleMenu, setToggleMenu] = useState(false);
    return (
        <nav className="w-full flex md:justify-center justify-between items-center p-5" id="home">
            <div className="md:flex-[0.5] justify-center items-center">
                <img src={logo} alt="logo" className="w-32 cursor-pointer" />
            </div>
            <ul className="text-white hidden md:flex list-none flex-row justify-between items-center flex-inital">
                {["Market", "Exchange", "Tutorials", "Wallets"].map((item, index) => (
                    <Menu key={item + index} title={item} classProps='cursor-pointer mx-4' />
                ))}
                <li className="bg-[#1ab7] py-2 px-7 mx-4 text-[#eeb2b2] text-base rounded-full cursor-pointer hover:bg-[#525661] hover:text-white">
                    Login
                </li>
            </ul>
            <div className="flex relative">
                {toggleMenu
                    ? <AiOutlineClose fontSize={28} className="text-white md:hidden cursor-pointer mr-4" onClick={() => setToggleMenu(false)} />
                    : <HiMenuAlt4 fontSize={28} className="text-white md:hidden cursor-pointer mr-4" onClick={() => setToggleMenu(true)} />
                }
                {toggleMenu && (
                    <ul className="z-10 fixed top-0 -right-2 p-9 w-[70vw] h-screen shadow-2xl md:hidden list-none
                        flex flex-col justify-start items-end rounded-md blue-glassmorphism text-white animate-slide-in">
                        <li className="text-xl w-full mb-9 mt-1">
                            <AiOutlineClose onClick={() => setToggleMenu(false)} />
                        </li>
                        {["Market", "Exchange", "Tutorials", "Wallet"].map((item, index) => ( // Updated "Transactions" to "Tutorials"
                            <Menu key={item + index} title={item} classProps="my-2 text-lg" />
                        ))}
                    </ul>
                )}
            </div>
        </nav>
    );
};

export default Navbar;