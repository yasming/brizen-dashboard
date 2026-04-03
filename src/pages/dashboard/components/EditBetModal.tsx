import {useEffect, useState} from 'react';
import {updateBet, getSports} from '../../../api/routes.tsx';

interface Sport {
  id: number;
  name: string;
}

interface Bet {
  ID: number;
  Date: string;
  Time: string | null;
  League: string;
  Match: string;
  Bet: string;
  Link: string | null;
  Result: number;
  SportName: string;
}

interface EditBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  bet: Bet | null;
  onRefreshBets: () => void;
}

export default function EditBetModal({ isOpen, onClose, token, bet, onRefreshBets }: EditBetModalProps) {
  const [sports, setSports] = useState<Sport[]>([]);
  const [formData, setFormData] = useState({
    data: '',
    tempo: '',
    liga: '',
    partida: '',
    aposta: '',
    link: '',
    esporte: '1',
  });

  useEffect(() => {
    if (!isOpen || !token) return;
    const fetchSports = async () => {
      const data = await getSports(token);
      setSports(data);
    };
    fetchSports();
  }, [isOpen, token]);

  useEffect(() => {
    if (!bet || !isOpen) return;
    const dateObj = new Date(bet.Date.replace('Z', ''));
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const sport = sports.find(s => s.name === bet.SportName);

    setFormData({
      data: formattedDate,
      tempo: bet.Time ? bet.Time.slice(0, 5) : '',
      liga: bet.League,
      partida: bet.Match,
      aposta: bet.Bet,
      link: bet.Link || '',
      esporte: sport ? String(sport.id) : '1',
    });
  }, [bet, isOpen, sports]);

  if (!isOpen || !bet) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    } else if (name === 'tempo') {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      let formatted = digits;
      if (digits.length > 2) {
        formatted = `${digits.slice(0, 2)}:${digits.slice(2)}`;
      }
      setFormData(prev => ({ ...prev, tempo: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBet(token, bet.ID, {
      date: formData.data,
      time: formData.tempo || null,
      league: formData.liga,
      match: formData.partida,
      bet: formData.aposta,
      link: formData.link || null,
      sport_id: Number(formData.esporte),
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
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Hora</label>
            <input
              type="text"
              name="tempo"
              value={formData.tempo}
              onChange={handleInputChange}
              placeholder="HH:MM"
              inputMode="numeric"
              maxLength={5}
              pattern="^([01][0-9]|2[0-3]):[0-5][0-9]$"
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Esporte</label>
            <div style={styles.selectWrapper}>
              <select
                name="esporte"
                value={formData.esporte}
                onChange={handleInputChange}
                style={styles.select}
                required
              >
                {sports.map((sport) => (
                  <option key={sport.id} value={sport.id}>
                    {sport.name}
                  </option>
                ))}
              </select>
              <span style={styles.selectArrow}>▾</span>
            </div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>League</label>
            <input
              type="text"
              name="liga"
              value={formData.liga}
              onChange={handleInputChange}
              placeholder="Brasileirão"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Match</label>
            <input
              type="text"
              name="partida"
              value={formData.partida}
              onChange={handleInputChange}
              placeholder="Flamengo x Fluminense"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Bet</label>
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
            <label style={styles.label}>Link</label>
            <input
              type="text"
              name="link"
              value={formData.link}
              onChange={handleInputChange}
              placeholder="https://..."
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
  selectWrapper: {
    position: 'relative' as const,
  } as const,
  select: {
    width: '100%',
    padding: '0.5rem 2.5rem 0.5rem 0.875rem',
    fontSize: '0.875rem',
    border: '1px solid #e4e4e7',
    borderRadius: '0.375rem',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    color: '#09090b',
    outline: 'none',
    cursor: 'pointer',
    height: '2.375rem',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
  } as const,
  selectArrow: {
    position: 'absolute' as const,
    right: '0.875rem',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none' as const,
    color: '#09090b',
    fontSize: '1.1rem',
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
