import React from "react";
import { useNavigate } from "react-router-dom";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    to?: string; //Optional Route
};

export default function Button({ children, to, onClick, ...props }: ButtonProps){
    const navigate = useNavigate();

    function handleClick(event: React.MouseEvent<HTMLButtonElement>){
        if (onClick){
            onClick(event); //Runs the function passed by the parent. Like an alert or a stdout print.
        }
        
        if (to){
            navigate(to);
        }
    }

    return (
        <button
            className="inline-block border-2 border-blue-deep bg-pink-dark px-4 py-2 font-pixelify text-blue-deep text-3xl hover:big-blue-200 transition mt-9 shadow-no-blur"
            onClick={handleClick}
            {...props}
            >
            {children}    
        </button>
    );
}