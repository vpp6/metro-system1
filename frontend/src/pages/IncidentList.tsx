import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Typography, Button, Chip, IconButton, TablePagination,
  TextField, MenuItem, Grid, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, InputAdornment, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { incidentsApi, Incident } from '../api/client';
import { useLang } from '../context/LanguageContext';
import { shifts, stations } from '../context/translations';

const shiftChip = (shift?: string) => {
  const s = shift || '';
  if (s === 'صباحية' || s === 'Morning') return { color: 'primary' as const, label: s };
  if (s === 'مسائية' || s === 'Evening') return { color: 'warning' as const, label: s };
  if (s === 'ليلية' || s === 'Night') return { color: 'default' as const, label: s };
  return { color: 'default' as const, label: s };
};

export default function IncidentList() {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [filterStation, setFilterStation] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [search, setSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null);

  const load = () => {
    incidentsApi.list({
      skip: page * rowsPerPage,
      limit: rowsPerPage,
      ...(filterStation && { station: filterStation }),
      ...(filterShift && { shift: filterShift }),
    }).then(res => setIncidents(res.data));
  };

  useEffect(() => { load(); }, [page, rowsPerPage, filterStation, filterShift]);

  const handleDelete = async () => {
    if (deleteDialog === null) return;
    await incidentsApi.delete(deleteDialog);
    setDeleteDialog(null);
    load();
  };

  const handleReport = async (id: number) => {
    const res = await incidentsApi.report(id);
    const url = URL.createObjectURL(new Blob([res.data]));
    window.open(url, '_blank');
  };

  const stationList = [{ ar: '', en: '' }, ...stations];
  const shiftList = [{ ar: '', en: '' }, ...shifts];

  const filtered = incidents.filter(inc =>
    !search || (inc.incident_number?.toLowerCase().includes(search.toLowerCase()) ||
      inc.description?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: '#0f2b5e' }}>
            {t('incidents.title')}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {t('app.subtitle')}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/incidents/new')}
          sx={{ borderRadius: 2, px: 3, py: 1 }}>
          {t('incidents.new')}
        </Button>
      </Box>

      <Card sx={{ mb: 3, p: 2.5 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              placeholder={t('incidents.search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8f9fc' } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField select label={t('form.station')} value={filterStation}
              onChange={e => setFilterStation(e.target.value)}
              SelectProps={{ displayEmpty: true }}>
              {stationList.map(s => (
                <MenuItem key={s.en} value={s[lang]}>{s[lang] || t('incidents.all')}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField select label={t('form.shift')} value={filterShift}
              onChange={e => setFilterShift(e.target.value)}
              SelectProps={{ displayEmpty: true }}>
              {shiftList.map(s => (
                <MenuItem key={s.en} value={s[lang]}>{s[lang] || t('incidents.all')}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('table.incidentNumber')}</TableCell>
                <TableCell>{t('table.date')}</TableCell>
                <TableCell>{t('table.time')}</TableCell>
                <TableCell>{t('table.shift')}</TableCell>
                <TableCell>{t('table.station')}</TableCell>
                <TableCell>{t('table.type')}</TableCell>
                <TableCell>{t('field.createdByName')}</TableCell>
                <TableCell>{t('table.description')}</TableCell>
                <TableCell align="center">{t('table.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(inc => (
                <TableRow key={inc.id}
                  hover
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f8faff' },
                    '&:hover .actions-cell': { opacity: 1 },
                  }}
                  onClick={() => navigate(`/incidents/${inc.id}`)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#0f2b5e' }}>
                      {inc.incident_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{inc.date}</Typography>
                  </TableCell>
                  <TableCell>{inc.time}</TableCell>
                  <TableCell>
                    <Chip
                      label={shiftChip(inc.shift).label}
                      size="small"
                      color={shiftChip(inc.shift).color}
                      variant="filled"
                      sx={{ fontWeight: 600, borderRadius: 1.5 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{inc.station}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {inc.incident_types?.slice(0, 2).map(t => (
                        <Chip key={t.type_name} label={t.type_name} size="small"
                          variant="outlined" sx={{ borderRadius: 1.5, borderColor: '#0f2b5e30', color: '#0f2b5e' }} />
                      ))}
                      {(inc.incident_types?.length || 0) > 2 && (
                        <Chip label={`+${(inc.incident_types?.length || 0) - 2}`} size="small"
                          sx={{ borderRadius: 1.5, bgcolor: '#f0f2f5', fontSize: '0.7rem' }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{inc.created_by_name || '-'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{
                      maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      color: 'text.secondary',
                    }}>
                      {inc.description}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box className="actions-cell" sx={{ opacity: 0.6, transition: 'opacity 0.2s', display: 'flex', gap: 0.5, justifyContent: 'center' }}
                      onClick={e => e.stopPropagation()}>
                      <Tooltip title={t('detail.view') || 'View'}>
                        <IconButton size="small" onClick={() => navigate(`/incidents/${inc.id}`)}
                          sx={{ bgcolor: '#0f2b5e10', '&:hover': { bgcolor: '#0f2b5e20' } }}>
                          <VisibilityIcon fontSize="small" sx={{ color: '#0f2b5e' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('detail.edit') || 'Edit'}>
                        <IconButton size="small" onClick={() => navigate(`/incidents/${inc.id}/edit`)}
                          sx={{ bgcolor: '#d4a11e10', '&:hover': { bgcolor: '#d4a11e20' } }}>
                          <EditIcon fontSize="small" sx={{ color: '#d4a11e' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('detail.pdf') || 'PDF'}>
                        <IconButton size="small" onClick={() => handleReport(inc.id)}
                          sx={{ bgcolor: '#ef444410', '&:hover': { bgcolor: '#ef444420' } }}>
                          <PictureAsPdfIcon fontSize="small" sx={{ color: '#ef4444' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('form.delete') || 'Delete'}>
                        <IconButton size="small" color="error" onClick={() => setDeleteDialog(inc.id)}
                          sx={{ bgcolor: '#00000008', '&:hover': { bgcolor: '#ef444420' } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Box sx={{ py: 6 }}>
                      <FilterListIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                      <Typography color="textSecondary">{t('incidents.noData')}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={-1}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
          labelRowsPerPage={t('incidents.rowsPerPage')}
        />
      </Card>

      <Dialog open={deleteDialog !== null} onClose={() => setDeleteDialog(null)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('incidents.deleteConfirm')}</DialogTitle>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialog(null)} variant="outlined">{t('form.cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDelete}
            sx={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', '&:hover': { background: 'linear-gradient(135deg, #dc2626, #b91c1c)' } }}>
            {t('form.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
