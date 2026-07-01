import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Typography, Button, Chip, IconButton, TablePagination,
  TextField, MenuItem, Grid, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { incidentsApi, Incident } from '../api/client';
import { useLang } from '../context/LanguageContext';
import { shifts, blueLineStations } from '../context/translations';

export default function IncidentList() {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [filterStation, setFilterStation] = useState('');
  const [filterShift, setFilterShift] = useState('');
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

  const stationList = [{ ar: '', en: '' }, ...blueLineStations];
  const shiftList = [{ ar: '', en: '' }, ...shifts];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>{t('incidents.title')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/incidents/new')}>
          {t('incidents.new')}
        </Button>
      </Box>

      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField select label={t('form.station')} value={filterStation} onChange={e => setFilterStation(e.target.value)} fullWidth>
              {stationList.map(s => (
                <MenuItem key={s.en} value={s[lang]}>{s[lang] || t('incidents.all')}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField select label={t('form.shift')} value={filterShift} onChange={e => setFilterShift(e.target.value)} fullWidth>
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
                <TableCell>{t('table.description')}</TableCell>
                <TableCell align="center">{t('table.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidents.map(inc => (
                <TableRow key={inc.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{inc.incident_number}</Typography>
                  </TableCell>
                  <TableCell>{inc.date}</TableCell>
                  <TableCell>{inc.time}</TableCell>
                  <TableCell>
                    <Chip label={inc.shift} size="small" color={inc.shift === 'صباحية' || inc.shift === 'Morning' ? 'primary' : inc.shift === 'مسائية' || inc.shift === 'Evening' ? 'warning' : 'default'} />
                  </TableCell>
                  <TableCell>{inc.station}</TableCell>
                  <TableCell>
                    {inc.incident_types?.slice(0, 2).map(t => (
                      <Chip key={t.type_name} label={t.type_name} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{
                      maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {inc.description}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => navigate(`/incidents/${inc.id}`)}><VisibilityIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => navigate(`/incidents/${inc.id}/edit`)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => handleReport(inc.id)}><PictureAsPdfIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteDialog(inc.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {incidents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary" py={4}>{t('incidents.noData')}</Typography>
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

      <Dialog open={deleteDialog !== null} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>{t('incidents.deleteConfirm')}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>{t('form.cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>{t('form.delete')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
