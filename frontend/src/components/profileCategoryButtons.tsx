interface CategoryButton {
    name: string;
    icon?: string;
    onClick: () => void;
    className?: string;
}

interface CategoryButtons {
    buttons: CategoryButton[];
}

export function CategoryButtons({ buttons }: CategoryButtons) {
    return (
        <div className="flex flex-col justify-between flex-grow mx-[25px] py-4">
            {buttons.map((btn) => (
                <button
                    key={btn.name}
                    className={btn.className || "button-pp-blue shadow-no-blur flex items-center justify-between"}
                    onClick={btn.onClick}
                >
                    {btn.name}
                    {btn.icon && <img src={btn.icon} alt="Arrow" className="h-5 m-4" />}
                </button>
            ))}
        </div>
    );
}