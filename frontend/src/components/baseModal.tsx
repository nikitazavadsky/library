interface BaseModalProps {
  visible: boolean;
  closeModal: () => void;
  modalId: string;
  title: string;
  titleClassname: string;
  children: React.ReactNode;
  modalAction: React.ReactNode;
}

const BaseModal: React.FC<BaseModalProps> = ({
  visible,
  closeModal,
  modalId,
  title,
  titleClassname,
  children,
  modalAction,
}) => {
  return (
    <>
      <input
        type="checkbox"
        id={modalId}
        className="modal-toggle"
        checked={visible}
        onChange={closeModal}
      />
      <label htmlFor={modalId} className="modal cursor-pointer">
        <label className="modal-box relative" htmlFor="">
          <h2 className={`font-extrabold ${titleClassname}`}>{title}</h2>
          {children}
          <div className="modal-action">{modalAction}</div>
        </label>
      </label>
    </>
  );
};

export default BaseModal;
