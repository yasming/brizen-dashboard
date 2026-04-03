interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  betMatch: string;
}

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, betMatch }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>Confirme</h2>
        <p style={styles.modalText}>Tem certeza que quer deletar "{betMatch}"?</p>
        <div style={styles.modalButtons}>
          <button style={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button style={styles.deleteButton} onClick={onConfirm}>
            Deletar
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  } as const,
  modalContent: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '0.5rem',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  } as const,
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#09090b',
  } as const,
  modalText: {
    fontSize: '0.875rem',
    color: '#52525b',
    marginBottom: '1.5rem',
  } as const,
  modalButtons: {
    display: 'flex',
    gap: '0.75rem',
  } as const,
  cancelButton: {
    flex: 1,
    padding: '0.625rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#09090b',
    backgroundColor: '#f4f4f5',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  } as const,
  deleteButton: {
    flex: 1,
    padding: '0.625rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#dc2626',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  } as const,
};
