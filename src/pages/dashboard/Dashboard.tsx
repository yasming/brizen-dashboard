import {useEffect, useState, useMemo, useRef} from 'react';
import {getBets, updateBetResult, deleteBet} from '../../api/routes.tsx';
import {useAuth} from '../../context/useAuth.ts';
import NovaApostaModal from './components/NewBetModal.tsx';
import DeleteConfirmModal from './components/DeleteConfirmModal.tsx';
import EditBetModal from './components/EditBetModal.tsx';
import BestCharts from './components/BestCharts.tsx';

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
  UserName: string | null;
}

function getClosestDateIndex(dates: string[]) {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Fortaleza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  let closest = 0;
  let minDiff = Infinity;

  dates.forEach((date, idx) => {
    if (date <= today) {
      const diff = new Date(today).getTime() - new Date(date).getTime();
      if (diff < minDiff) {
        minDiff = diff;
        closest = idx;
      }
    }
  });

  return closest;
}

export default function Dashboard() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [betToEdit, setBetToEdit] = useState<Bet | null>(null);
  const [betToDelete, setBetToDelete] = useState<{ id: number; match: string } | null>(null);
  const getTodayFormatted = () => {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Fortaleza',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).formatToParts(now);
    const day = parts.find(p => p.type === 'day')!.value;
    const month = parts.find(p => p.type === 'month')!.value;
    const year = parts.find(p => p.type === 'year')!.value;
    return `${day}/${month}/${year}`;
  };

  const [formData, setFormData] = useState({
    data: getTodayFormatted(),
    tempo: '',
    liga: '',
    partida: '',
    aposta: '',
    link: '',
    esporte: '1',
  });
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 640px)').matches);
  const calendarRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);
  const { token } = useAuth();

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const formatBetTime = (time: string | null) => {
    if (!time) return '-';
    return time.slice(0, 5);
  };

  useEffect(() => {
    if (!token) return;
    const fetchBets = async () => {
      const data = await getBets(token);
      setBets(data);
      if (!hasInitialized.current) {
        const dates = [...new Set(data.map((bet: Bet) => bet.Date.split('T')[0]))] as string[];
        dates.sort();
        setCurrentDateIndex(getClosestDateIndex(dates));
        hasInitialized.current = true;
      }
    };
    fetchBets();
  }, [token]);

  const uniqueDates = useMemo(() => {
    const dates = bets.map(bet => bet.Date.split('T')[0]);
    return [...new Set(dates)].sort();
  }, [bets]);

  const currentDate = uniqueDates[currentDateIndex] || '';

  const handleCalendarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    const idx = uniqueDates.indexOf(date);
    if (idx !== -1) {
      setCurrentDateIndex(idx);
    }
  };
  const paginatedBets = useMemo(() => {
    if (!currentDate) return bets;
    return bets.filter(bet => bet.Date.startsWith(currentDate));
  }, [bets, currentDate]);
  
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
      setFormData({ ...formData, data: formatted });
    } else if (name === 'tempo') {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      let formatted = digits;
      if (digits.length > 2) {
        formatted = `${digits.slice(0, 2)}:${digits.slice(2)}`;
      }
      setFormData({ ...formData, tempo: formatted });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setFormData({ data: getTodayFormatted(), tempo: '', liga: '', partida: '', aposta: '', link: '', esporte: '1' });
  };

  const handleDateChangeFromModal = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const isoDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      const allDates = [...new Set([...bets.map(bet => bet.Date.split('T')[0]), isoDate])].sort();
      const idx = allDates.indexOf(isoDate);
      setCurrentDateIndex(idx);
    }
  };

  const handleResultChange = async (betId: number, result: number) => {
    if (!token) return;
    await updateBetResult(token, betId, result);
    setBets(bets.map(bet => 
      bet.ID === betId ? { ...bet, Result: result } : bet
    ));
  };

  const handleEditClick = (bet: Bet) => {
    setBetToEdit(bet);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (betId: number, betMatch: string) => {
    setBetToDelete({ id: betId, match: betMatch });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!token || !betToDelete) return;
    await deleteBet(token, betToDelete.id);
    const newBets = bets.filter(bet => bet.ID !== betToDelete.id);
    setBets(newBets);
    const newDates = [...new Set(newBets.map(bet => bet.Date.split('T')[0]))].sort();
    const currentDateStillHasBets = newBets.some(bet => bet.Date.startsWith(currentDate));
    if (!currentDateStillHasBets && newDates.length > 0) {
      const newIndex = newDates.indexOf(currentDate);
      if (newIndex === -1 || newIndex >= newDates.length) {
        setCurrentDateIndex(newDates.length - 1);
      } else {
        setCurrentDateIndex(newIndex);
      }
    }
    setIsDeleteModalOpen(false);
    setBetToDelete(null);
  };

  return (
    <div style={styles.container}>
      <div style={isMobile ? styles.headerRowMobile : styles.headerRow}>
        {isMobile ? (
          <>
            <div style={styles.headerButtonsRow}>
              <h1 style={styles.title}>Dashboard</h1>
            </div>
            <button style={{...styles.addButton, alignSelf: 'flex-start'}} onClick={() => setIsModalOpen(true)}>Adicionar</button>
          </>
        ) : (
          <>
            <div style={styles.headerTitleGroup}>
              <h1 style={styles.title}>Dashboard</h1>
            </div>
            <button style={styles.addButton} onClick={() => setIsModalOpen(true)}>Adicionar</button>
          </>
        )}
      </div>
      {uniqueDates.length > 0 && (
        <div style={styles.pagination}>
          <button
            style={styles.pageButton}
            onClick={() => setCurrentDateIndex(i => Math.max(0, i - 1))}
            disabled={currentDateIndex === 0}
          >
            Anterior
          </button>
          <div style={styles.datePickerWrapper}>
            <span style={styles.pageInfo}>
              {new Date(currentDate + 'T12:00:00').toLocaleDateString('pt-BR')} ({paginatedBets.length} jogos)
            </span>
            <input
              type="date"
              ref={calendarRef}
              style={styles.hiddenInput}
              value={currentDate}
              onChange={handleCalendarChange}
            />
            <button
              style={styles.iconButton}
              onClick={() => calendarRef.current?.showPicker?.()}
              title="Selecionar data"
            >
              📅
            </button>
          </div>
          <button
            style={styles.pageButton}
            onClick={() => setCurrentDateIndex(i => Math.min(uniqueDates.length - 1, i + 1))}
            disabled={currentDateIndex === uniqueDates.length - 1}
          >
            Próxima
          </button>
        </div>
      )}
      <BestCharts allBets={bets} dayBets={paginatedBets} currentDate={currentDate} />
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.header}>Data</th>
              <th style={styles.header}>Hora</th>
              <th style={styles.header}>Liga</th>
              <th style={styles.header}>Esporte</th>
              <th style={styles.header}>Partida</th>
              <th style={styles.header}>Aposta</th>
              <th style={styles.header}>Link</th>
              <th style={styles.header}>Resultado</th>
              <th style={styles.header}>Usuario</th>
              <th style={styles.header}>Editar</th>
              <th style={styles.header}>Deletar</th>
            </tr>
	          </thead>
	          <tbody>
	            {paginatedBets.length > 0 ? (
	              paginatedBets.map((bet, index) => (
	                <tr key={bet.ID} style={index % 2 === 0 ? styles.row : { ...styles.row, backgroundColor: '#fafafa' }}>
	                  <td style={styles.cell}>{new Date(bet.Date.replace('Z', '')).toLocaleDateString('pt-BR')}</td>
	                  <td style={styles.cell}>{formatBetTime(bet.Time)}</td>
	                  <td style={styles.cell}>{bet.League}</td>
	                  <td style={styles.cell}>{bet.SportName}</td>
	                  <td style={styles.cell}>{bet.Match}</td>
	                  <td style={styles.cell}>{bet.Bet}</td>
	                  <td style={styles.cell}>
	                    {bet.Link ? (
	                      <a href={bet.Link} target="_blank" rel="noopener noreferrer" style={styles.link}>Link</a>
	                    ) : '—'}
	                  </td>
		                  <td style={styles.cell}>
		                    <div style={styles.resultButtons}>
	                      <button
	                        onClick={() => handleResultChange(bet.ID, 1)}
	                        style={{
	                          ...styles.resultButton,
	                          ...(bet.Result === 1 ? styles.resultButtonActive : {}),
	                        }}
	                        title="Win"
	                      >
	                        ✓
	                      </button>
	                      <button
	                        onClick={() => handleResultChange(bet.ID, 0)}
	                        style={{
	                          ...styles.resultButton,
	                          ...(bet.Result === 0 ? styles.resultButtonActiveLose : {}),
	                        }}
	                        title="Lose"
	                      >
	                        ✕
	                      </button>
	                      <button
	                        onClick={() => handleResultChange(bet.ID, 2)}
	                        style={{
	                          ...styles.resultButton,
	                          ...(bet.Result === 2 ? styles.resultButtonActiveReset : {}),
	                        }}
	                        title="Reset"
	                      >
	                        🔁
	                      </button>
		                    </div>
		                  </td>
		                  <td style={styles.cell}>{bet.UserName || '—'}</td>
		                  <td style={styles.cell}>
		                    <button
	                      style={styles.editButton}
	                      onClick={() => handleEditClick(bet)}
	                      title="Editar"
	                    >
	                      ✏️
	                    </button>
	                  </td>
	                  <td style={styles.cell}>
	                    <button
	                      style={styles.deleteButton}
	                      onClick={() => handleDeleteClick(bet.ID, bet.Match)}
	                      title="Excluir"
	                    >
	                      🗑️
	                    </button>
	                  </td>
	                </tr>
	              ))
		            ) : (
		              <tr style={styles.row}>
		                <td style={styles.emptyCell} colSpan={11}>Sem apostas cadastradas</td>
		              </tr>
		            )}
	          </tbody>
	        </table>
	      </div>

      {token && (
        <NovaApostaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          token={token}
          formData={formData}
          onInputChange={handleInputChange}
          onSuccess={handleSuccess}
          onRefreshBets={() => {
            const fetchBets = async () => {
              const data = await getBets(token);
              setBets(data);
            };
            fetchBets();
          }}
          onDateChange={handleDateChangeFromModal}
        />
      )}

      {token && (
        <EditBetModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setBetToEdit(null); }}
          token={token}
          bet={betToEdit}
          onRefreshBets={() => {
            const fetchBets = async () => {
              const data = await getBets(token);
              setBets(data);
            };
            fetchBets();
          }}
        />
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        betMatch={betToDelete?.match || ''}
      />
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    minHeight: '100vh',
    backgroundColor: '#fafafa',
  } as const,
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
  } as const,
  headerRowMobile: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  } as const,
  headerButtonsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as const,
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  } as const,
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    color: '#09090b',
  } as const,
  addButton: {
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#18181b',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  } as const,
  tableWrapper: {
    overflowX: 'auto' as const,
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    backgroundColor: 'white',
  } as const,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  } as const,
  tableHeaderRow: {
    backgroundColor: '#18181b',
  } as const,
  header: {
    padding: '0.875rem 1rem',
    textAlign: 'left' as const,
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'white',
  } as const,
  row: {
    borderBottom: '1px solid #e4e4e7',
  } as const,
  cell: {
    padding: '0.875rem 1rem',
    fontSize: '0.875rem',
    color: '#09090b',
  } as const,
  emptyCell: {
    padding: '1.5rem 1rem',
    fontSize: '0.875rem',
    color: '#6b7280',
    textAlign: 'center' as const,
  } as const,
  link: {
    color: '#2563eb',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '0.875rem',
  } as const,
  iconGreen: {
    color: '#16a34a',
    fontSize: '1rem',
    fontWeight: 'bold',
  } as const,
  iconRed: {
    color: '#dc2626',
    fontSize: '1rem',
    fontWeight: 'bold',
  } as const,
  iconPending: {
    color: '#9ca3af',
    fontSize: '1rem',
  } as const,
  select: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.875rem',
    border: '1px solid #d4d4d8',
    borderRadius: '0.25rem',
    backgroundColor: 'white',
    cursor: 'pointer',
  } as const,
  resultButtons: {
    display: 'flex',
    gap: '0.25rem',
  } as const,
  resultButton: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.875rem',
    border: '1px solid #d4d4d8',
    borderRadius: '0.25rem',
    backgroundColor: 'white',
    cursor: 'pointer',
    color: '#9ca3af',
  } as const,
  resultButtonActive: {
    backgroundColor: '#16a34a',
    color: 'white',
    borderColor: '#16a34a',
  } as const,
  resultButtonActiveLose: {
    backgroundColor: '#dc2626',
    color: 'white',
    borderColor: '#dc2626',
  } as const,
  resultButtonActiveReset: {
    backgroundColor: '#f59e0b',
    color: 'white',
    borderColor: '#f59e0b',
  } as const,
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '1rem',
    padding: '1rem',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  } as const,
  pageButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#18181b',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  } as const,
  pageInfo: {
    fontSize: '0.875rem',
    color: '#09090b',
  } as const,
  datePickerWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  } as const,
  calendarInput: {
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    border: '1px solid #d4d4d8',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  } as const,
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
    border: 'none',
    padding: 0,
  } as const,
  iconButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '0.25rem',
  } as const,
  editButton: {
    background: 'none',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '0.25rem',
  } as const,
  deleteButton: {
    background: 'none',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '0.25rem',
  } as const,
};
