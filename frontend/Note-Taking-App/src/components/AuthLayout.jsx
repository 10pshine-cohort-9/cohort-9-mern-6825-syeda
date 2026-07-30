const AuthLayout = ({ eyebrow, title, highlight, subtitle, children }) => {
  return (
    <div className="min-h-screen flex bg-[#F7F7FA]">
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#10151F] overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent, transparent 39px, #F4F5F7 39px, #F4F5F7 40px)",
          }}
        />
        <div className="absolute top-0 bottom-0 left-16 w-px bg-[#E8553D]/40" />

        <div className="absolute left-4 top-0 bottom-0 flex flex-col justify-evenly py-10">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className="w-3 h-3 rounded-full bg-[#10151F] ring-2 ring-[#F4F5F7]/20"
            />
          ))}
        </div>

        <div
          className="absolute top-0 bottom-0 right-0 w-6 bg-[#F7F7FA]"
          style={{
            clipPath:
              "polygon(0% 0%, 40% 4%, 0% 8%, 45% 13%, 5% 18%, 40% 24%, 0% 29%, 42% 35%, 8% 40%, 38% 46%, 0% 51%, 44% 57%, 6% 62%, 40% 68%, 0% 73%, 42% 79%, 8% 84%, 38% 90%, 0% 95%, 40% 100%, 100% 100%, 100% 0%)",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 pl-24 text-[#F4F5F7]">
          <span className="font-['Space_Grotesk'] text-xl font-bold tracking-tight">
            Notewell
          </span>

          <div className="space-y-6 max-w-md">
            {eyebrow && (
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#FFC93C]/80">
                {eyebrow}
              </p>
            )}
            <h1 className="font-['Space_Grotesk'] text-4xl font-bold leading-[1.15]">
              {title}{" "}
              {highlight && (
                <span className="relative inline-block font-['Caveat'] text-[#FFC93C] text-5xl font-normal">
                  {highlight}
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 20" fill="none">
                    <path
                      d="M2 12C40 4 90 4 130 10C155 14 175 10 198 6"
                      stroke="#FFC93C"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              )}
            </h1>
            <p className="text-[#F4F5F7]/60 text-base leading-relaxed">{subtitle}</p>
          </div>

          <p className="text-xs text-[#F4F5F7]/40">
            © {new Date().getFullYear()} Notewell. Every idea, one place.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;