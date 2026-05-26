export default function Footer() {
  return (
    <div className="border-t-1 fixed bottom-0 left-0 right-0 z-50 flex h-12 w-full items-center justify-center border-black bg-vibratingBlue font-pressStart shadow-[0px_-4px_0px_rgba(0,0,0,1)]">
      <a
        className="flex h-3/4 cursor-pointer items-center drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 active:translate-y-0"
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
