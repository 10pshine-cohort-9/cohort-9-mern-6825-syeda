/**
 * WelcomeBanner — the dark gradient hero strip at the top of the dashboard.
 */
const WelcomeBanner = ({ userName, isTrashView }) => (
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#10151F] to-[#1c2433] px-6 py-5 mb-6 animate-fade-in-up">
    <div
      className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20"
      style={{ background: "#FFC93C" }}
    />
    <div
      className="absolute -bottom-8 right-16 w-20 h-20 rounded-full opacity-10"
      style={{ background: "#E8553D" }}
    />

    <div className="relative">
      <h1 className="font-['Space_Grotesk'] text-xl font-bold text-white mb-1">
        Welcome back, {userName}
        <span className="font-['Caveat'] text-2xl text-[#FFC93C] ml-2">wonderful</span>
      </h1>
      <p className="text-white/60 text-sm">
        {isTrashView
          ? "Notes here are kept for 30 days before permanent deletion."
          : "You have a few notes in your Library."}
      </p>
    </div>
  </div>
);

export default WelcomeBanner;