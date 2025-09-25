import React from "react";
import { useNavigate } from 'react-router-dom';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    to?: string;
}

export default function Button({ children, to, onClick, type= "button", ...props}: ButtonProps){
    const navigate = useNavigate();

    function handleClick(event: React.MouseEvent<HTMLButtonElement>){
        if (onClick){
            onClick(event);
        }
        if (to){
            navigate(to);
        }
    }

    return (
        <button 
            type={type}
            className="w-full inline-block border-2 border-blue-deep bg-purple-purple px-4 py-1 font-pixelify text-white text-2xl shadow-no-blur-50-reverse text-right"
            onClick={handleClick}
            {...props}
            >
            {children}
        </button>
    );
}