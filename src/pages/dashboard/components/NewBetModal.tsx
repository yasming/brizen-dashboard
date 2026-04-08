import {createBet} from '../../../api/routes.tsx';

interface NewBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  formData: {
    data: string;
    evento: string;
    aposta: string;
    odd: string;
    fairOdd: string;
    closingOdd: string;
    clv: string;
    value: string;
    lucro: string;
    total: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSuccess: () => void;
  onRefreshBets: () => void;
  onDateChange: (date: string) => void;
}

export default function NewBetModal({ isOpen, onClose, token, formData, onInputChange, onSuccess, onRefreshBets, onDateChange }: NewBetModalProps) {
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBet(token, {
      date: formData.data,
      event: formData.evento,
      bet: formData.aposta,
      odd: formData.odd,
      fair_odd: formData.fairOdd || null,
      closing_odd: formData.closingOdd || null,
      clv: formData.clv || null,
      value: formData.value || null,
      lucro: formData.lucro || null,
      total: formData.total || null,
    });
    onDateChange(formData.data);
    onSuccess();
    onRefreshBets();
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>New Bet</h2>
        <form onSubmit={handleSubmit} style={styles.modalForm}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Data</label>
            <input
              type="text"
              name="data"
              value={formData.data}
              onChange={onInputChange}
              placeholder="dd/mm/yyyy"
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Evento</label>
            <input
              type="text"
              name="evento"
              value={formData.evento}
              onChange={onInputChange}
              placeholder="Flamengo x Fluminense"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Aposta</label>
            <input
              type="text"
              name="aposta"
              value={formData.aposta}
              onChange={onInputChange}
              placeholder="Flamengo -1.5"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Odd</label>
            <input
              type="text"
              name="odd"
              value={formData.odd}
              onChange={onInputChange}
              placeholder="1.85"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Fair Odd</label>
            <input
              type="text"
              name="fairOdd"
              value={formData.fairOdd}
              onChange={onInputChange}
              placeholder="1.75"
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Closing Odd</label>
            <input
              type="text"
              name="closingOdd"
              value={formData.closingOdd}
              onChange={onInputChange}
              placeholder="1.80"
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>CLV</label>
            <input
              type="text"
              name="clv"
              value={formData.clv}
              onChange={onInputChange}
              placeholder="+2.78%"
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Value</label>
            <input
              type="text"
              name="value"
              value={formData.value}
              onChange={onInputChange}
              placeholder="+5.71%"
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Lucro</label>
            <input
              type="text"
              name="lucro"
              value={formData.lucro}
              onChange={onInputChange}
              placeholder="0.85"
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Total</label>
            <input
              type="text"
              name="total"
              value={formData.total}
              onChange={onInputChange}
              placeholder="12.50"
              style={styles.input}
            />
          </div>
          <div style={styles.modalButtons}>
            <button type="button" style={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={styles.submitButton}>
              Save
            </button>
          </div>
        </form>
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
    marginBottom: '1.5rem',
    color: '#09090b',
  } as const,
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  } as const,
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  } as const,
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#09090b',
  } as const,
  input: {
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    border: '1px solid #e4e4e7',
    borderRadius: '0.375rem',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    color: '#09090b',
    outline: 'none',
  } as const,
  modalButtons: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1rem',
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
  submitButton: {
    flex: 1,
    padding: '0.625rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#18181b',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  } as const,
};
