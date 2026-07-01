import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Typography, Button, Chip, IconButton, TablePagination,
  TextField, MenuItem, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { incidentsApi, Incident } from '../api/client';

const shifts = ['', 'صباحية', 'مسائية', 'ليلية'];
const stations = ['', 'محطة الخرطوم', 'محطة أم درمان', 'محطة بحري', 'محطة وسط البلد'];

export default function IncidentList() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [filterStation, setFilterStation] = useState('');
  const [filterShift, setFilterShift] = useState('');

  const load = () => {
    incidentsApi.list({
      skip: page * rowsPerPage,
      limit: rowsPerPage,
      ...(filterStation && { station: filterStation }),
      ...(filterShift && { shift: filterShift }),
    }).then(res => setIncidents(res.data));
  };

  useEffect(() => { load(); }, [page, rowsPerPage, filterStation, filterShift]);

  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الحادث؟')) {
      await incidentsApi.delete(id);
      load();
    }
  };

  const handleReport = async (id: number) => {
    const res = await incidentsApi.report(id);
    const url = URL.createObjectURL(new Blob([res.data]));
    window.open(url, '_blank');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>إدارة الحوادث</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/incidents/new')}>
          حادث جديد
        </Button>
      </Box>

      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField select label="المحطة" value={filterStation} onChange={e => setFilterStation(e.target.value)} fullWidth>
              {stations.map(s => <MenuItem key={s} value={s}>{s || 'الكل'}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField select label="الوردية" value={filterShift} onChange={e => setFilterShift(e.target.value)} fullWidth>
              {shifts.map(s => <MenuItem key={s} value={s}>{s || 'الكل'}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>رقم الحادث</TableCell>
                <TableCell>التاريخ</TableCell>
                <TableCell>الوقت</TableCell>
                <TableCell>الوردية</TableCell>
                <TableCell>المحطة</TableCell>
                <TableCell>النوع</TableCell>
                <TableCell>الوصف</TableCell>
                <TableCell align="center">إجراءات</TableCell>
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
                    <Chip label={inc.shift} size="small" color={inc.shift === 'صباحية' ? 'primary' : inc.shift === 'مسائية' ? 'warning' : 'default'} />
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
                    <IconButton size="small" color="error" onClick={() => handleDelete(inc.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {incidents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary" py={4}>لا توجد حوادث مسجلة</Typography>
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
          labelRowsPerPage="عدد الصفوف"
        />
      </Card>
    </Box>
  );
}
