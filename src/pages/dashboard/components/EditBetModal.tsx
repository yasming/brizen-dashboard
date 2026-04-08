import {type ChangeEvent, type FormEvent, useEffect, useState} from 'react';
import {updateBet} from '../../../api/routes.tsx';

interface Bet {
  ID?: number;
  id?: number | string | null;
  Date?: string;
  date?: string;
  Event?: string;
  Bet?: string;
  Odd?: string | number;
  FairOdd?: string | number | null;
  ClosingOdd?: string | number | null;
  CLV?: string | null;
  Value?: string | null;
  Lucro?: string | null;
  Total?: string | null;
  Result?: number;
}

interface EditBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  bet: Bet | null;
  onRefreshBets: () => void;
}

export default function EditBetModal({ isOpen, onClose, token, bet, onRefreshBets }: EditBetModalProps) {
  const [formData, setFormData] = useState({
    data: '',
    evento: '',
    aposta: '',
    odd: '',
    fairOdd: '',
    closingOdd: '',
    clv: '',
    value: '',
    lucro: '',
    total: '',
  });

  useEffect(() => {
    if (!bet || !isOpen) return;
    const rawDate = bet.Date ?? bet.date ?? '';
    const dateObj = new Date(rawDate.replace('Z', ''));
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const odd = bet.Odd;
    const fairOdd = bet.FairOdd;
    const closingOdd = bet.ClosingOdd;

    setFormData({
      data: formattedDate,
      evento: bet.Event ?? '',
      aposta: bet.Bet ?? '',
      odd: odd != null ? String(odd) : '',
      fairOdd: fairOdd != null ? String(fairOdd) : '',
      closingOdd: closingOdd != null ? String(closingOdd) : '',
      clv: bet.CLV ?? '',
      value: bet.Value ?? '',
      lucro: bet.Lucro ?? '',
      total: bet.Total ?? '',
    });
  }, [bet, isOpen]);

  if (!isOpen || !bet) return null;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'data') {
      const digits = value.replace(/\D/g, '').slice(0, 8);
      let formatted = digits;
      if (digits.length > 2 && digits.length <= 4) {
        formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      } else if (digits.length > 4) {
        formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
      }
      setFormData(prev => ({ ...prev, data: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const betId = Number(bet.ID ?? bet.id);
    if (Number.isNaN(betId)) return;

    await updateBet(token, betId, {
      date: formData.data,
      event: formData.evento,
      bet: formData.aposta,
      odd: formData.odd.trim() || null,
      fair_odd: formData.fairOdd.trim() || null,
      closing_odd: formData.closingOdd.trim() || null,
      clv: formData.clv || null,
      value: formData.value || null,
      lucro: formData.lucro || null,
      total: formData.total || null,
    });
    onClose();
    onRefreshBets();
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>Edit Bet</h2>
        <form onSubmit={handleSubmit} style={styles.modalForm}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Data</label>
            <input
              type="text"
              name="data"
              value={formData.data}
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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
