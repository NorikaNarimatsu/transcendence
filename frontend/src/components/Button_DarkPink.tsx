import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
};

export default function Button({ children, ...props }: ButtonProps){
    return (
        <button
            className="inline-block border-2 border-brand-deep_blue bg-brand-dark_pink px-4 py-2 font-pixelify text-brand-deep_blue text-3xl hover:big-blue-200 transition mt-9 shadow-no-blur"
            {...props}
            >
            {children}    
            </button>
    );
}