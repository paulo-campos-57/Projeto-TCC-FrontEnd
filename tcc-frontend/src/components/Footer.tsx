export default function Footer() {
    return (
        <div className="font-pressStart w-full h-12 bg-vibratingBlue flex justify-center items-center fixed bottom-0 left-0 right-0 z-50 border-t-1 border-black shadow-[0px_-4px_0px_rgba(0,0,0,1)]">
            <a
                className="h-3/4 cursor-pointer hover:-translate-y-1 active:translate-y-0 transition-transform drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center"
                href="https://github.com/paulo-campos-57"
                target="_blank"
                rel="noopener noreferrer"
            >
                <img
                    className="h-full object-contain"
                    src="logo_dev.png"
                    alt="Logo do Desenvolvedor"
                />
            </a>
        </div>
    );
}