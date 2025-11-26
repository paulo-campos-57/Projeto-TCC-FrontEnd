export default function Footer() {
    return (
        <>
            <div className="font-pressStart w-screen h-12 bg-vibratingBlue text-textBlack flex justify-center items-center fixed bottom-0 left-0 right-0 z-50">
                <a
                    className="h-1/2 cursor-pointer"
                    href="https://github.com/paulo-campos-57"
                    target="_blank"
                    rel="noopener noreferrer">
                    <img
                        className="h-full object-contain"
                        src="logo_dev.png"
                        alt="Logo"
                    />
                </a>
            </div>
        </>
    );
}