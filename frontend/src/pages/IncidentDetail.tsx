import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableRow,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { incidentsApi, Incident } from '../api/client';
import { useLang } from '../context/LanguageContext';

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="caption" color="textSecondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value || '-'}</Typography>
    </Grid>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" color="primary" mb={2}>{title}</Typography>
        {children}
      </CardContent>
    </Card>
  );
}

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      incidentsApi.get(parseInt(id))
        .then(res => setIncident(res.data))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleReport = async () => {
    if (!id) return;
    const res = await incidentsApi.report(parseInt(id));
    const url = URL.createObjectURL(new Blob([res.data]));
    window.open(url, '_blank');
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (!incident) return <Typography>{t('detail.notFound')}</Typography>;

  const i = incident;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/incidents')}>{t('detail.back')}</Button>
        <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }}>
          {t('detail.incident')} {i.incident_number}
        </Typography>
        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => navigate(`/incidents/${id}/edit`)}>{t('detail.edit')}</Button>
        <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={handleReport}>{t('detail.pdf')}</Button>
      </Box>

      <Section title={t('detail.generalInfo')}>
        <Grid container spacing={2}>
          <Field label={t('table.incidentNumber')} value={i.incident_number} />
          <Field label={t('table.date')} value={i.date} />
          <Field label={t('field.createdByName')} value={i.created_by_name} />
          <Field label={t('field.createdByEmployeeId')} value={i.created_by_employee_id} />
          <Field label={t('form.day')} value={i.day} />
          <Field label={t('table.time')} value={i.time} />
          <Field label={t('table.shift')} value={i.shift} />
          <Field label={t('table.station')} value={i.station} />
          <Field label={t('form.location')} value={i.location} />
          <Field label={t('loc.platform')} value={i.platform} />
          <Field label={t('loc.concourse')} value={i.concourse} />
          <Field label={t('loc.streetLevel')} value={i.street_level} />
          <Field label={t('loc.track')} value={i.track} />
          <Field label={t('loc.equipmentRoom')} value={i.equipment_room} />
        </Grid>
        <Box mt={2}>
          <Typography variant="caption" color="textSecondary">{t('form.description')}</Typography>
          <Typography variant="body2">{i.description || '-'}</Typography>
        </Box>
      </Section>

      <Section title={t('detail.detection')}>
        <Grid container spacing={2}>
          <Field label={t('form.discoveredBy')} value={i.detection?.discovered_by} />
          <Field label={t('form.firstReporter')} value={i.detection?.first_reporter} />
          <Field label={t('form.emergencyCode')} value={i.detection?.emergency_code} />
          <Field label={t('form.permitNumber')} value={i.detection?.permit_number} />
          <Field label={t('form.detectionTime')} value={i.detection?.detection_time} />
          <Field label={t('form.occNotification')} value={i.detection?.occ_notification_time} />
          <Field label={t('form.occResponse')} value={i.detection?.occ_response_time} />
        </Grid>
      </Section>

      <Section title={t('detail.incidentType')}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {(i.incident_types || []).map(typ => (
            <Chip key={typ.type_name} label={typ.type_name} color="primary" variant="outlined" />
          ))}
          {(!i.incident_types || i.incident_types.length === 0) && <Typography variant="body2" color="textSecondary">{t('detail.notSpecified')}</Typography>}
        </Box>
      </Section>

      {i.passengers && i.passengers.length > 0 && (
        <Section title={t('detail.passengerData')}>
          {i.passengers.map((p, idx) => (
            <Box key={idx} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="subtitle2" mb={1}>{t('form.passenger')} {idx + 1}</Typography>
              <Grid container spacing={2}>
                <Field label={t('field.name')} value={p.name} />
                <Field label={t('field.age')} value={p.age} />
                <Field label={t('field.phone')} value={p.phone} />
                <Field label={t('field.emergencyContact')} value={p.emergency_contact} />
                <Field label={t('field.status')} value={p.passenger_status} />
                <Field label={t('field.hospital')} value={p.hospital_name} />
                <Field label={t('field.ambulanceRef')} value={p.ambulance_reference} />
              </Grid>
            </Box>
          ))}
        </Section>
      )}

      <Section title={t('detail.trainOps')}>
        <Grid container spacing={2}>
          <Field label={t('form.trainNumber')} value={i.train_operations?.train_number} />
          <Field label={t('form.currentLocation')} value={i.train_operations?.current_location} />
          <Field label={t('form.destination')} value={i.train_operations?.destination} />
          <Field label={t('form.operationMode')} value={i.train_operations?.operation_mode} />
          <Field label={t('form.rescueTrain')} value={i.train_operations?.rescue_train_number} />
          <Field label={t('form.rescueStart')} value={i.train_operations?.rescue_start_time} />
          <Field label={t('form.rescueEnd')} value={i.train_operations?.rescue_end_time} />
        </Grid>
      </Section>

      <Section title={t('detail.evacuation')}>
        <Grid container spacing={2}>
          <Field label={t('form.evacuationOrder')} value={i.evacuation?.evacuation_order_time} />
          <Field label={t('form.evacuationStart')} value={i.evacuation?.evacuation_start_time} />
          <Field label={t('form.evacuationComplete')} value={i.evacuation?.evacuation_completion_time} />
          <Field label={t('form.evacuationClear')} value={i.evacuation?.station_clear_notification_time} />
          <Field label={t('form.evacuationReopen')} value={i.evacuation?.station_reopening_time} />
        </Grid>
      </Section>

      {i.staff && i.staff.length > 0 && (
        <Section title={t('detail.staff')}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('field.role')}</TableCell>
                  <TableCell>{t('field.name')}</TableCell>
                  <TableCell>{t('field.employeeId')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {i.staff.map((s, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Chip label={s.role} size="small" /></TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.employee_id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Section>
      )}

      <Section title={t('detail.impact')}>
        <Grid container spacing={2}>
          <Field label={t('form.incidentDuration')} value={i.impact?.incident_duration} />
          <Field label={t('form.responseDuration')} value={i.impact?.response_duration} />
          <Field label={t('form.evacuationDuration')} value={i.impact?.evacuation_duration} />
          <Field label={t('form.trainDelays')} value={i.impact?.train_delays} />
          <Field label={t('form.passengersAffected')} value={i.impact?.passengers_affected} />
          <Field label={t('form.injuries')} value={i.impact?.injuries} />
          <Field label={t('form.fatalities')} value={i.impact?.fatalities} />
          <Grid item xs={12}>
            <Field label={t('detail.status')} value={i.impact?.incident_closed ? t('detail.closed') : t('detail.open')} />
          </Grid>
        </Grid>
        {i.impact?.cause && (
          <Box mt={2}>
            <Typography variant="caption" color="textSecondary">{t('field.cause')}</Typography>
            <Typography variant="body2">{i.impact.cause}</Typography>
          </Box>
        )}
        {i.impact?.corrective_actions && (
          <Box mt={2}>
            <Typography variant="caption" color="textSecondary">{t('field.correctiveActions')}</Typography>
            <Typography variant="body2">{i.impact.corrective_actions}</Typography>
          </Box>
        )}
        {i.impact?.lessons_learned && (
          <Box mt={2}>
            <Typography variant="caption" color="textSecondary">{t('field.lessonsLearned')}</Typography>
            <Typography variant="body2">{i.impact.lessons_learned}</Typography>
          </Box>
        )}
      </Section>
    </Box>
  );
}
