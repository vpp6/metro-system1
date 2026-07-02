import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  MenuItem, Alert, CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { incidentsApi, IncidentCreate } from '../api/client';
import { useLang } from '../context/LanguageContext';
import {
  shifts, locations, discoverers, incidentTypeOptions,
  staffRoles, operationModes, stations
} from '../context/translations';

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
  const { t, lang } = useLang();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<IncidentCreate>(emptyForm);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/incidents')} sx={{ ml: 2 }}>{t('detail.back')}</Button>
        <Typography variant="h5" fontWeight={700}>{isEdit ? t('form.editIncident') : t('form.newIncident')}</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" color="primary" mb={2}>{t('form.generalInfo')}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <TextField label={t('form.date')} type="date" value={form.date || ''}
                  onChange={e => update('date', e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label={t('form.day')} value={form.day || ''} onChange={e => update('day', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label={t('form.time')} type="time" value={form.time || ''}
                  onChange={e => update('time', e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField select label={t('form.shift')} value={form.shift || ''} onChange={e => update('shift', e.target.value)}>
                  {shifts.map(s => <MenuItem key={s.en} value={s[lang]}>{s[lang]}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField select label={t('form.station')} value={form.station || ''} onChange={e => update('station', e.target.value)}>
                  {stations.map(s => <MenuItem key={s.en} value={s[lang]}>{s[lang]}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField select label={t('form.location')} value={form.location || ''} onChange={e => update('location', e.target.value)}>
                  {locations.map(l => <MenuItem key={l.en} value={l[lang]}>{l[lang]}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label={t('form.platformTrack')} value={form.platform || ''} onChange={e => update('platform', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label={t('field.createdByName')} value={form.created_by_name || ''}
                  onChange={e => update('created_by_name', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label={t('field.createdByEmployeeId')} value={form.created_by_employee_id || ''}
                  onChange={e => update('created_by_employee_id', e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField label={t('form.description')} multiline rows={3} value={form.description || ''}
                  onChange={e => update('description', e.target.value)} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" color="primary" mb={2}>{t('form.detection')}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField select label={t('form.discoveredBy')} value={form.detection?.discovered_by || ''}
                  onChange={e => update('detection', { ...form.detection, discovered_by: e.target.value })}>
                  {discoverers.map(d => <MenuItem key={d.en} value={d[lang]}>{d[lang]}</MenuItem>)}
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

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" color="primary" mb={2}>{t('form.incidentType')}</Typography>
            <Grid container spacing={1}>
              {incidentTypeOptions.map(typ => (
                <Grid item key={typ.en}>
                  <Button
                    variant={selectedTypes.includes(typ[lang]) ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handleTypeToggle(typ[lang])}
                    sx={{ borderRadius: 4, textTransform: 'none' }}
                  >
                    {typ[lang]}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" color="primary" mb={2}>{t('form.trainOps')}</Typography>
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
              <Grid item xs={12} sm={3}>
                <TextField label={t('form.rescueStart')} type="time" value={form.train_operations?.rescue_start_time || ''}
                  onChange={e => update('train_operations', { ...form.train_operations, rescue_start_time: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label={t('form.rescueEnd')} type="time" value={form.train_operations?.rescue_end_time || ''}
                  onChange={e => update('train_operations', { ...form.train_operations, rescue_end_time: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" color="primary" mb={2}>{t('form.evacuation')}</Typography>
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

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="primary">{t('form.passengers')}</Typography>
              <Button variant="outlined" size="small" onClick={addPassenger}>{t('form.addPassenger')}</Button>
            </Box>
            {(form.passengers || []).map((p, i) => (
              <Box key={i} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2">{t('form.passenger')} {i + 1}</Typography>
                  <Button size="small" color="error" onClick={() => removePassenger(i)}>{t('form.delete')}</Button>
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
              <Typography color="textSecondary" variant="body2">{t('form.noPassengers')}</Typography>
            )}
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="primary">{t('form.staff')}</Typography>
              <Button variant="outlined" size="small" onClick={addStaff}>{t('form.addStaff')}</Button>
            </Box>
            {(form.staff || []).map((s, i) => (
              <Box key={i} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2">{t('form.staffMember')} {i + 1}</Typography>
                  <Button size="small" color="error" onClick={() => removeStaff(i)}>{t('form.delete')}</Button>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField select label={t('field.role')} value={s.role || ''} onChange={e => handleStaffChange(i, 'role', e.target.value)}>
                      {staffRoles.map(r => <MenuItem key={r.en} value={r[lang]}>{r[lang]}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={4}><TextField label={t('field.name')} value={s.name || ''} onChange={e => handleStaffChange(i, 'name', e.target.value)} /></Grid>
                  <Grid item xs={12} sm={4}><TextField label={t('field.employeeId')} value={s.employee_id || ''} onChange={e => handleStaffChange(i, 'employee_id', e.target.value)} /></Grid>
                </Grid>
              </Box>
            ))}
            {(form.staff || []).length === 0 && (
              <Typography color="textSecondary" variant="body2">{t('form.noStaff')}</Typography>
            )}
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" color="primary" mb={2}>{t('form.impact')}</Typography>
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

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', mb: 4 }}>
          <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">
            {saving ? t('form.saving') : (isEdit ? t('form.update') : t('form.register'))}
          </Button>
          <Button variant="outlined" onClick={() => navigate('/incidents')} size="large">{t('form.cancel')}</Button>
        </Box>
      </form>
    </Box>
  );
}
