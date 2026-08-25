/**
 * ConfirmDialog — reusable confirmation modal.
 * Props: title, message, confirmLabel, danger (bool), onConfirm, onCancel
 */
const ConfirmDialog = ({ title, message, confirmLabel = "Confirm", danger = false, onConfirm, onCancel }) => (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={onCancel}
  >
    <div
      className="bg-white rounded-2xl shadow-xl w-full max-w-sm animate-fade-in-up"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-6 py-5">
        <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#10151F] mb-1.5">
          {title}
        </h3>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-500 rounded-lg hover:bg-gray-100 transition-colors duration-150"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-opacity duration-150 hover:opacity-90 ${
            danger ? "bg-red-600 text-white" : "bg-[#10151F] text-[#FFC93C]"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;