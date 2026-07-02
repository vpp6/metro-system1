import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  MenuItem, Alert, CircularProgress, Avatar, Step, StepLabel, Stepper
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import TrainIcon from '@mui/icons-material/Train';
import EvStationIcon from '@mui/icons-material/EvStation';
import PeopleIcon from '@mui/icons-material/People';
import BadgeIcon from '@mui/icons-material/Badge';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { incidentsApi, IncidentCreate } from '../api/client';
import { useLang } from '../context/LanguageContext';
import {
  shifts, locations, discoverers, incidentTypeOptions,
  staffRoles, operationModes, stations
} from '../context/translations';

const sections = [
  { key: 'general', labelKey: 'form.generalInfo', icon: <InfoIcon sx={{ fontSize: 18 }} /> },
  { key: 'detection', labelKey: 'form.detection', icon: <SearchIcon sx={{ fontSize: 18 }} /> },
  { key: 'types', labelKey: 'form.incidentType', icon: <CategoryIcon sx={{ fontSize: 18 }} /> },
  { key: 'train', labelKey: 'form.trainOps', icon: <TrainIcon sx={{ fontSize: 18 }} /> },
  { key: 'evacuation', labelKey: 'form.evacuation', icon: <EvStationIcon sx={{ fontSize: 18 }} /> },
  { key: 'passengers', labelKey: 'form.passengers', icon: <PeopleIcon sx={{ fontSize: 18 }} /> },
  { key: 'staff', labelKey: 'form.staff', icon: <BadgeIcon sx={{ fontSize: 18 }} /> },
  { key: 'impact', labelKey: 'form.impact', icon: <AssessmentIcon sx={{ fontSize: 18 }} /> },
];

const emptyForm: IncidentCreate = {
  created_by_name: '',
  created_by_employee_id: '',
  date: new Date().toISOString().split('T')[0],
  day: '', time: '', shift: '', station: '', location: '',
  platform: '', concourse: '', street_level: '', track: '', equipment_room: '',
  description: '',
  detection: {
    discovered_by: '', first_reporter: '', detection_time: '',
    occ_notification_time: '', occ_response_time: '',
    emergency_code: '', permit_number: '',
  },
  incident_types: [],
  passengers: [],
  train_operations: {},
  evacuation: {},
  staff: [],
  impact: {},
};

export default function IncidentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<IncidentCreate>(emptyForm);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    if (id) {
      setLoading(true);
      incidentsApi.get(parseInt(id)).then(res => {
        const d = res.data;
        setForm({
          date: d.date || '', day: d.day || '', time: d.time || '',
          shift: d.shift || '', station: d.station || '', location: d.location || '',
          platform: d.platform || '', concourse: d.concourse || '',
          street_level: d.street_level || '', track: d.track || '',
          equipment_room: d.equipment_room || '', description: d.description || '',
          detection: d.detection || {}, incident_types: d.incident_types || [],
          passengers: d.passengers || [], train_operations: d.train_operations || {},
          evacuation: d.evacuation || {}, staff: d.staff || [], impact: d.impact || {},
        });
        setSelectedTypes((d.incident_types || []).map(t => t.type_name));
      }).catch(() => setError(t('form.loadError'))).finally(() => setLoading(false));
    }
  }, [id]);

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => {
      const exists = prev.includes(type);
      const updated = exists ? prev.filter(t => t !== type) : [...prev, type];
      update('incident_types', updated.map(t => ({ type_name: t })));
      return updated;
    });
  };

  const handlePassengerChange = (index: number, field: string, value: any) => {
    const passengers = [...(form.passengers || [])];
    passengers[index] = { ...passengers[index], [field]: value };
    update('passengers', passengers);
  };

  const addPassenger = () => update('passengers', [...(form.passengers || []), {}]);
  const removePassenger = (index: number) => update('passengers', (form.passengers || []).filter((_, i) => i !== index));

  const handleStaffChange = (index: number, field: string, value: any) => {
    const staff = [...(form.staff || [])];
    staff[index] = { ...staff[index], [field]: value };
    update('staff', staff);
  };

  const addStaff = () => update('staff', [...(form.staff || []), {}]);
  const removeStaff = (index: number) => update('staff', (form.staff || []).filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await incidentsApi.update(parseInt(id!), form);
      } else {
        await incidentsApi.create(form);
      }
      navigate('/incidents');
    } catch (err: any) {
      setError(err?.response?.data?.detail || t('form.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress size={48} thickness={4} sx={{ color: '#0f2b5e' }} />
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/incidents')}
          variant="outlined" sx={{ borderRadius: 2, mr: 2 }}>
          {t('detail.back')}
        </Button>
        <Typography variant="h5" fontWeight={800} sx={{ color: '#0f2b5e' }}>
          {isEdit ? t('form.editIncident') : t('form.newIncident')}
        </Typography>
      </Box>

      <Stepper
        activeStep={activeSection}
        alternativeLabel
        sx={{
          mb: 4, px: 2,
          '& .MuiStepLabel-label': { fontSize: '0.75rem', fontWeight: 600 },
          '& .MuiStepIcon-root': {
            '&.Mui-active': { color: '#0f2b5e' },
            '&.Mui-completed': { color: '#10b981' },
          },
        }}
      >
        {sections.map((s, i) => (
          <Step key={s.key}>
            <StepLabel
              onClick={() => setActiveSection(i)}
              sx={{ cursor: 'pointer' }}
            >
              {t(s.labelKey)}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        {activeSection === 0 && (
          <Card sx={{ mb: 3, overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#0f2b5e10', color: '#0f2b5e' }}>
                {sections[0].icon}
              </Avatar>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f2b5e' }}>{t('form.generalInfo')}</Typography>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label={t('field.createdByName')} value={form.created_by_name || ''}
                    onChange={e => update('created_by_name', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label={t('field.createdByEmployeeId')} value={form.created_by_employee_id || ''}
                    onChange={e => update('created_by_employee_id', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                    {t('form.station')}
                  </Typography>
                  <TextField select value={form.station || ''} onChange={e => update('station', e.target.value)}>
                    {stations.map((s, i) => (
                      <MenuItem key={s.en + i} value={s.en}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: (s as any).line === 'red' ? '#ef4444' : '#0f2b5e', flexShrink: 0 }} />
                          <Typography variant="body2">{s.en}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                    {t('form.shift')}
                  </Typography>
                  <TextField select value={form.shift || ''} onChange={e => update('shift', e.target.value)}>
                    {shifts.map(s => <MenuItem key={s.en} value={s.en}>{s.en}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField label={t('form.date')} type="date" value={form.date || ''}
                    onChange={e => update('date', e.target.value)} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField label={t('form.day')} value={form.day || ''} onChange={e => update('day', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField label={t('form.time')} type="time" value={form.time || ''}
                    onChange={e => update('time', e.target.value)} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField select label={t('form.location')} value={form.location || ''} onChange={e => update('location', e.target.value)}>
                    {locations.map(l => <MenuItem key={l.en} value={l.en}>{l.en}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label={t('form.platformTrack')} value={form.platform || ''} onChange={e => update('platform', e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label={t('form.description')} multiline rows={3} value={form.description || ''}
                    onChange={e => update('description', e.target.value)} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {activeSection === 1 && (
          <Card sx={{ mb: 3, overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#0f2b5e10', color: '#0f2b5e' }}>
                {sections[1].icon}
              </Avatar>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f2b5e' }}>{t('form.detection')}</Typography>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField select label={t('form.discoveredBy')} value={form.detection?.discovered_by || ''}
                    onChange={e => update('detection', { ...form.detection, discovered_by: e.target.value })}>
                    {discoverers.map(d => <MenuItem key={d.en} value={d.en}>{d.en}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label={t('form.firstReporter')} value={form.detection?.first_reporter || ''}
                    onChange={e => update('detection', { ...form.detection, first_reporter: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label={t('form.emergencyCode')} value={form.detection?.emergency_code || ''}
                    onChange={e => update('detection', { ...form.detection, emergency_code: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField label={t('form.detectionTime')} type="time" value={form.detection?.detection_time || ''}
                    onChange={e => update('detection', { ...form.detection, detection_time: e.target.value })} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField label={t('form.occNotification')} type="time" value={form.detection?.occ_notification_time || ''}
                    onChange={e => update('detection', { ...form.detection, occ_notification_time: e.target.value })} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField label={t('form.occResponse')} type="time" value={form.detection?.occ_response_time || ''}
                    onChange={e => update('detection', { ...form.detection, occ_response_time: e.target.value })} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField label={t('form.permitNumber')} value={form.detection?.permit_number || ''}
                    onChange={e => update('detection', { ...form.detection, permit_number: e.target.value })} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {activeSection === 2 && (
          <Card sx={{ mb: 3, overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#0f2b5e10', color: '#0f2b5e' }}>
                {sections[2].icon}
              </Avatar>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f2b5e' }}>{t('form.incidentType')}</Typography>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              <Grid container spacing={1.5}>
                {incidentTypeOptions.map(typ => (
                  <Grid item key={typ.en}>
                    <Button
                      variant={selectedTypes.includes(typ.en) ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => handleTypeToggle(typ.en)}
                      sx={{
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2,
                        ...(selectedTypes.includes(typ.en) ? {
                          background: 'linear-gradient(135deg, #0f2b5e 0%, #1a3f7a 100%)',
                        } : {
                          borderColor: '#0f2b5e30', color: '#0f2b5e',
                        }),
                      }}
                    >
                      {typ.en}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {activeSection === 3 && (
          <Card sx={{ mb: 3, overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#0f2b5e10', color: '#0f2b5e' }}>
                {sections[3].icon}
              </Avatar>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f2b5e' }}>{t('form.trainOps')}</Typography>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField label={t('form.trainNumber')} value={form.train_operations?.train_number || ''}
                    onChange={e => update('train_operations', { ...form.train_operations, train_number: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label={t('form.currentLocation')} value={form.train_operations?.current_location || ''}
                    onChange={e => update('train_operations', { ...form.train_operations, current_location: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label={t('form.destination')} value={form.train_operations?.destination || ''}
                    onChange={e => update('train_operations', { ...form.train_operations, destination: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField select label={t('form.operationMode')} value={form.train_operations?.operation_mode || ''}
                    onChange={e => update('train_operations', { ...form.train_operations, operation_mode: e.target.value })}>
                    {operationModes.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label={t('form.rescueTrain')} value={form.train_operations?.rescue_train_number || ''}
                    onChange={e => update('train_operations', { ...form.train_operations, rescue_train_number: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField label={t('form.rescueStart')} type="time" value={form.train_operations?.rescue_start_time || ''}
                    onChange={e => update('train_operations', { ...form.train_operations, rescue_start_time: e.target.value })} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField label={t('form.rescueEnd')} type="time" value={form.train_operations?.rescue_end_time || ''}
                    onChange={e => update('train_operations', { ...form.train_operations, rescue_end_time: e.target.value })} InputLabelProps={{ shrink: true }} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {activeSection === 4 && (
          <Card sx={{ mb: 3, overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#0f2b5e10', color: '#0f2b5e' }}>
                {sections[4].icon}
              </Avatar>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f2b5e' }}>{t('form.evacuation')}</Typography>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField label={t('form.evacuationOrder')} type="time" value={form.evacuation?.evacuation_order_time || ''}
                    onChange={e => update('evacuation', { ...form.evacuation, evacuation_order_time: e.target.value })} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label={t('form.evacuationStart')} type="time" value={form.evacuation?.evacuation_start_time || ''}
                    onChange={e => update('evacuation', { ...form.evacuation, evacuation_start_time: e.target.value })} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label={t('form.evacuationComplete')} type="time" value={form.evacuation?.evacuation_completion_time || ''}
                    onChange={e => update('evacuation', { ...form.evacuation, evacuation_completion_time: e.target.value })} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label={t('form.evacuationClear')} type="time" value={form.evacuation?.station_clear_notification_time || ''}
                    onChange={e => update('evacuation', { ...form.evacuation, station_clear_notification_time: e.target.value })} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label={t('form.evacuationReopen')} type="time" value={form.evacuation?.station_reopening_time || ''}
                    onChange={e => update('evacuation', { ...form.evacuation, station_reopening_time: e.target.value })} InputLabelProps={{ shrink: true }} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {activeSection === 5 && (
          <Card sx={{ mb: 3, overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#0f2b5e10', color: '#0f2b5e' }}>
                  {sections[5].icon}
                </Avatar>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f2b5e' }}>{t('form.passengers')}</Typography>
              </Box>
              <Button variant="contained" size="small" onClick={addPassenger}
                sx={{ borderRadius: 2, px: 2, fontSize: '0.75rem' }}>
                {t('form.addPassenger')}
              </Button>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              {(form.passengers || []).map((p, i) => (
                <Box key={i} sx={{
                  border: '1px solid rgba(15,43,94,0.12)', borderRadius: 3, p: 2, mb: 2,
                  bgcolor: '#f8faff',
                  '&:last-child': { mb: 0 },
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f2b5e' }}>
                      {t('form.passenger')} {i + 1}
                    </Typography>
                    <Button size="small" color="error" onClick={() => removePassenger(i)}
                      variant="outlined" sx={{ borderRadius: 1.5, fontSize: '0.7rem', borderColor: '#ef444450' }}>
                      {t('form.delete')}
                    </Button>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}><TextField label={t('field.name')} value={p.name || ''} onChange={e => handlePassengerChange(i, 'name', e.target.value)} /></Grid>
                    <Grid item xs={12} sm={2}><TextField label={t('field.age')} type="number" value={p.age || ''} onChange={e => handlePassengerChange(i, 'age', parseInt(e.target.value) || 0)} /></Grid>
                    <Grid item xs={12} sm={3}><TextField label={t('field.phone')} value={p.phone || ''} onChange={e => handlePassengerChange(i, 'phone', e.target.value)} /></Grid>
                    <Grid item xs={12} sm={3}><TextField label={t('field.emergencyContact')} value={p.emergency_contact || ''} onChange={e => handlePassengerChange(i, 'emergency_contact', e.target.value)} /></Grid>
                    <Grid item xs={12} sm={4}><TextField label={t('field.status')} value={p.passenger_status || ''} onChange={e => handlePassengerChange(i, 'passenger_status', e.target.value)} /></Grid>
                    <Grid item xs={12} sm={8}><TextField label={t('field.firstAid')} value={p.first_aid_given || ''} onChange={e => handlePassengerChange(i, 'first_aid_given', e.target.value)} /></Grid>
                    <Grid item xs={12} sm={3}><TextField label={t('form.ambulanceRequest')} type="time" value={p.ambulance_request_time || ''} onChange={e => handlePassengerChange(i, 'ambulance_request_time', e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
                    <Grid item xs={12} sm={3}><TextField label={t('form.arrivalTime')} type="time" value={p.arrival_time || ''} onChange={e => handlePassengerChange(i, 'arrival_time', e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
                    <Grid item xs={12} sm={3}><TextField label={t('form.handoverTime')} type="time" value={p.handover_time || ''} onChange={e => handlePassengerChange(i, 'handover_time', e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
                    <Grid item xs={12} sm={3}><TextField label={t('form.departureTime')} type="time" value={p.departure_time || ''} onChange={e => handlePassengerChange(i, 'departure_time', e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
                    <Grid item xs={12} sm={8}><TextField label={t('form.hospitalName')} value={p.hospital_name || ''} onChange={e => handlePassengerChange(i, 'hospital_name', e.target.value)} /></Grid>
                    <Grid item xs={12} sm={4}><TextField label={t('field.ambulanceRef')} value={p.ambulance_reference || ''} onChange={e => handlePassengerChange(i, 'ambulance_reference', e.target.value)} /></Grid>
                  </Grid>
                </Box>
              ))}
              {(form.passengers || []).length === 0 && (
                <Typography color="textSecondary" variant="body2" sx={{ textAlign: 'center', py: 4 }}>
                  {t('form.noPassengers')}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        {activeSection === 6 && (
          <Card sx={{ mb: 3, overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#0f2b5e10', color: '#0f2b5e' }}>
                  {sections[6].icon}
                </Avatar>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f2b5e' }}>{t('form.staff')}</Typography>
              </Box>
              <Button variant="contained" size="small" onClick={addStaff}
                sx={{ borderRadius: 2, px: 2, fontSize: '0.75rem' }}>
                {t('form.addStaff')}
              </Button>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              {(form.staff || []).map((s, i) => (
                <Box key={i} sx={{
                  border: '1px solid rgba(212,161,30,0.15)', borderRadius: 3, p: 2, mb: 2,
                  bgcolor: '#fffdf5',
                  '&:last-child': { mb: 0 },
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#b08210' }}>
                      {t('form.staffMember')} {i + 1}
                    </Typography>
                    <Button size="small" color="error" onClick={() => removeStaff(i)}
                      variant="outlined" sx={{ borderRadius: 1.5, fontSize: '0.7rem', borderColor: '#ef444450' }}>
                      {t('form.delete')}
                    </Button>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField select label={t('field.role')} value={s.role || ''} onChange={e => handleStaffChange(i, 'role', e.target.value)}>
                        {staffRoles.map(r => <MenuItem key={r.en} value={r.en}>{r.en}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}><TextField label={t('field.name')} value={s.name || ''} onChange={e => handleStaffChange(i, 'name', e.target.value)} /></Grid>
                    <Grid item xs={12} sm={4}><TextField label={t('field.employeeId')} value={s.employee_id || ''} onChange={e => handleStaffChange(i, 'employee_id', e.target.value)} /></Grid>
                  </Grid>
                </Box>
              ))}
              {(form.staff || []).length === 0 && (
                <Typography color="textSecondary" variant="body2" sx={{ textAlign: 'center', py: 4 }}>
                  {t('form.noStaff')}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        {activeSection === 7 && (
          <Card sx={{ mb: 3, overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#0f2b5e10', color: '#0f2b5e' }}>
                {sections[7].icon}
              </Avatar>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f2b5e' }}>{t('form.impact')}</Typography>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}><TextField label={t('form.incidentDuration')} type="number" value={form.impact?.incident_duration || ''} onChange={e => update('impact', { ...form.impact, incident_duration: parseInt(e.target.value) || 0 })} /></Grid>
                <Grid item xs={12} sm={3}><TextField label={t('form.responseDuration')} type="number" value={form.impact?.response_duration || ''} onChange={e => update('impact', { ...form.impact, response_duration: parseInt(e.target.value) || 0 })} /></Grid>
                <Grid item xs={12} sm={3}><TextField label={t('form.evacuationDuration')} type="number" value={form.impact?.evacuation_duration || ''} onChange={e => update('impact', { ...form.impact, evacuation_duration: parseInt(e.target.value) || 0 })} /></Grid>
                <Grid item xs={12} sm={3}><TextField label={t('form.trainDelays')} type="number" value={form.impact?.train_delays || ''} onChange={e => update('impact', { ...form.impact, train_delays: parseInt(e.target.value) || 0 })} /></Grid>
                <Grid item xs={12} sm={3}><TextField label={t('form.passengersAffected')} type="number" value={form.impact?.passengers_affected || ''} onChange={e => update('impact', { ...form.impact, passengers_affected: parseInt(e.target.value) || 0 })} /></Grid>
                <Grid item xs={12} sm={3}><TextField label={t('form.injuries')} type="number" value={form.impact?.injuries || ''} onChange={e => update('impact', { ...form.impact, injuries: parseInt(e.target.value) || 0 })} /></Grid>
                <Grid item xs={12} sm={3}><TextField label={t('form.fatalities')} type="number" value={form.impact?.fatalities || ''} onChange={e => update('impact', { ...form.impact, fatalities: parseInt(e.target.value) || 0 })} /></Grid>
                <Grid item xs={12} sm={3}>
                  <TextField select label={t('form.incidentStatus')} value={form.impact?.incident_closed !== undefined ? (form.impact.incident_closed ? t('detail.closed') : t('detail.open')) : ''}
                    onChange={e => update('impact', { ...form.impact, incident_closed: e.target.value === t('detail.closed') })}>
                    <MenuItem value={t('detail.open')}>{t('detail.open')}</MenuItem>
                    <MenuItem value={t('detail.closed')}>{t('detail.closed')}</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}><TextField label={t('field.equipmentAffected')} value={form.impact?.equipment_affected || ''} onChange={e => update('impact', { ...form.impact, equipment_affected: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField label={t('field.cause')} multiline rows={2} value={form.impact?.cause || ''} onChange={e => update('impact', { ...form.impact, cause: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField label={t('field.correctiveActions')} multiline rows={2} value={form.impact?.corrective_actions || ''} onChange={e => update('impact', { ...form.impact, corrective_actions: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField label={t('field.lessonsLearned')} multiline rows={2} value={form.impact?.lessons_learned || ''} onChange={e => update('impact', { ...form.impact, lessons_learned: e.target.value })} /></Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeSection > 0 && (
              <Button variant="outlined" onClick={() => setActiveSection(activeSection - 1)} size="large" sx={{ borderRadius: 2, px: 3 }}>
                {t('form.previous')}
              </Button>
            )}
            {activeSection < sections.length - 1 && (
              <Button variant="contained" onClick={() => setActiveSection(activeSection + 1)} size="large" sx={{ borderRadius: 2, px: 3 }}>
                {t('form.next')}
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/incidents')} size="large"
              sx={{ borderRadius: 2, px: 3 }}>
              {t('form.cancel')}
            </Button>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large"
              sx={{ borderRadius: 2, px: 4, background: 'linear-gradient(135deg, #10b981, #059669)', '&:hover': { background: 'linear-gradient(135deg, #059669, #047857)' } }}>
              {saving ? t('form.saving') : (isEdit ? t('form.update') : t('form.register'))}
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
}
