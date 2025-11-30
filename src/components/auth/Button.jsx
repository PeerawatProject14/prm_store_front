export default function Button({ text, full, ...props }) {
  return (
    <button
      className={`bg-[#0095F6] hover:bg-[#1877F2] active:bg-[#008ae6] text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ease-in-out ${
        full ? "w-full" : ""
      }`}
      {...props}
    >
      {text}
    </button>
  );
}