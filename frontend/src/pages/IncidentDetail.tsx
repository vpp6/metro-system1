import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableRow,
  CircularProgress, Divider, Avatar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import TrainIcon from '@mui/icons-material/Train';
import EvStationIcon from '@mui/icons-material/EvStation';
import BadgeIcon from '@mui/icons-material/Badge';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { incidentsApi, Incident } from '../api/client';
import { useLang, formatLangDate, formatLangTime } from '../context/LanguageContext';

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500, letterSpacing: '0.02em' }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ mt: 0.3, color: '#1a1a2e' }}>
        {value || '-'}
      </Typography>
    </Grid>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card sx={{ mb: 2.5, overflow: 'hidden' }}>
      <Box sx={{
        px: 2.5, py: 1.5,
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', gap: 1.5,
      }}>
        <Avatar sx={{
          width: 32, height: 32, borderRadius: 2,
          bgcolor: '#0f2b5e10', color: '#0f2b5e',
        }}>
          {icon}
        </Avatar>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f2b5e' }}>
          {title}
        </Typography>
      </Box>
      <CardContent sx={{ p: 2.5 }}>
        {children}
      </CardContent>
    </Card>
  );
}

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();
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

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress size={48} thickness={4} sx={{ color: '#0f2b5e' }} />
    </Box>
  );
  if (!incident) return <Typography>{t('detail.notFound')}</Typography>;

  const i = incident;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5, flexWrap: 'wrap' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/incidents')}
          variant="outlined" sx={{ borderRadius: 2 }}>
          {t('detail.back')}
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={800} sx={{ color: '#0f2b5e' }}>
            {t('detail.incident')} {i.incident_number}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<EditIcon />}
          onClick={() => navigate(`/incidents/${id}/edit`)} sx={{ borderRadius: 2 }}>
          {t('detail.edit')}
        </Button>
        <Button variant="contained" startIcon={<PictureAsPdfIcon />}
          onClick={handleReport} sx={{ borderRadius: 2 }}>
          {t('detail.pdf')}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Chip label={i.shift} size="small" color="primary" variant="outlined" sx={{ borderRadius: 1.5 }} />
        <Chip label={i.station} size="small" color="secondary" variant="outlined" sx={{ borderRadius: 1.5 }} />
        {i.impact?.incident_closed !== undefined && (
          <Chip
            label={i.impact.incident_closed ? t('detail.closed') : t('detail.open')}
            size="small"
            color={i.impact.incident_closed ? 'success' : 'warning'}
            sx={{ borderRadius: 1.5, fontWeight: 600 }}
          />
        )}
      </Box>

      <Section title={t('detail.generalInfo')} icon={<InfoIcon sx={{ fontSize: 18 }} />}>
        <Grid container spacing={2}>
          <Field label={t('table.incidentNumber')} value={i.incident_number} />
          <Field label={t('table.date')} value={formatLangDate(i.date, lang)} />
          <Field label={t('field.createdByName')} value={i.created_by_name} />
          <Field label={t('field.createdByEmployeeId')} value={i.created_by_employee_id} />
          <Field label={t('form.day')} value={i.day} />
          <Field label={t('table.time')} value={formatLangTime(i.time, lang)} />
          <Field label={t('table.shift')} value={i.shift} />
          <Field label={t('table.station')} value={i.station} />
          <Field label={t('form.location')} value={i.location} />
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>{t('form.description')}</Typography>
        <Typography variant="body2" sx={{ mt: 0.5, color: '#1a1a2e', lineHeight: 1.7 }}>
          {i.description || '-'}
        </Typography>
      </Section>

      <Section title={t('detail.detection')} icon={<SearchIcon sx={{ fontSize: 18 }} />}>
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

      <Section title={t('detail.incidentType')} icon={<CategoryIcon sx={{ fontSize: 18 }} />}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {(i.incident_types || []).map(typ => (
            <Chip key={typ.type_name} label={typ.type_name}
              sx={{ bgcolor: '#0f2b5e10', color: '#0f2b5e', fontWeight: 600, borderRadius: 2 }} />
          ))}
          {(!i.incident_types || i.incident_types.length === 0) &&
            <Typography variant="body2" color="textSecondary">{t('detail.notSpecified')}</Typography>}
        </Box>
      </Section>

      {i.passengers && i.passengers.length > 0 && (
        <Section title={t('detail.passengerData')} icon={<PeopleIcon sx={{ fontSize: 18 }} />}>
          {i.passengers.map((p, idx) => (
            <Box key={idx} sx={{
              mb: 2, p: 2, borderRadius: 3,
              bgcolor: '#f8faff', border: '1px solid rgba(15,43,94,0.08)',
              '&:last-child': { mb: 0 },
            }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f2b5e', mb: 1.5 }}>
                {t('form.passenger')} {idx + 1}
              </Typography>
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

      <Section title={t('detail.trainOps')} icon={<TrainIcon sx={{ fontSize: 18 }} />}>
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

      <Section title={t('detail.evacuation')} icon={<EvStationIcon sx={{ fontSize: 18 }} />}>
        <Grid container spacing={2}>
          <Field label={t('form.evacuationOrder')} value={i.evacuation?.evacuation_order_time} />
          <Field label={t('form.evacuationStart')} value={i.evacuation?.evacuation_start_time} />
          <Field label={t('form.evacuationComplete')} value={i.evacuation?.evacuation_completion_time} />
          <Field label={t('form.evacuationClear')} value={i.evacuation?.station_clear_notification_time} />
          <Field label={t('form.evacuationReopen')} value={i.evacuation?.station_reopening_time} />
        </Grid>
      </Section>

      {i.staff && i.staff.length > 0 && (
        <Section title={t('detail.staff')} icon={<BadgeIcon sx={{ fontSize: 18 }} />}>
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
                    <TableCell>
                      <Chip label={s.role} size="small"
                        sx={{ bgcolor: '#d4a11e10', color: '#b08210', fontWeight: 600, borderRadius: 1.5 }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{s.name}</TableCell>
                    <TableCell>{s.employee_id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Section>
      )}

      <Section title={t('detail.impact')} icon={<AssessmentIcon sx={{ fontSize: 18 }} />}>
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
            <Divider sx={{ mb: 2 }} />
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>{t('field.cause')}</Typography>
            <Typography variant="body2" sx={{ mt: 0.3, color: '#1a1a2e' }}>{i.impact.cause}</Typography>
          </Box>
        )}
        {i.impact?.corrective_actions && (
          <Box mt={2}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>{t('field.correctiveActions')}</Typography>
            <Typography variant="body2" sx={{ mt: 0.3, color: '#1a1a2e' }}>{i.impact.corrective_actions}</Typography>
          </Box>
        )}
        {i.impact?.lessons_learned && (
          <Box mt={2}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>{t('field.lessonsLearned')}</Typography>
            <Typography variant="body2" sx={{ mt: 0.3, color: '#1a1a2e' }}>{i.impact.lessons_learned}</Typography>
          </Box>
        )}
      </Section>
    </Box>
  );
}
