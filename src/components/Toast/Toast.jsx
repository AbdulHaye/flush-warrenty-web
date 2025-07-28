// Toast component
const Toast = ({ message, type = "success", onClose }) => {
  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-4 py-2 rounded-md shadow-lg flex items-center justify-between min-w-[250px] z-[1500] transition-all duration-300 ease-in-out`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white font-bold">
        ×
      </button>
    </div>
  );
};
export default Toast;
