import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Button,
  Table, TableBody, TableCell, TableRow, TableContainer,
  CircularProgress, Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { incidentsApi, Incident } from '../api/client';

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
  if (!incident) return <Typography>الحادث غير موجود</Typography>;

  const i = incident;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/incidents')}>رجوع</Button>
        <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }}>
          الحادث {i.incident_number}
        </Typography>
        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => navigate(`/incidents/${id}/edit`)}>تعديل</Button>
        <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={handleReport}>تقرير PDF</Button>
      </Box>

      <Section title="المعلومات العامة">
        <Grid container spacing={2}>
          <Field label="رقم الحادث" value={i.incident_number} />
          <Field label="التاريخ" value={i.date} />
          <Field label="اليوم" value={i.day} />
          <Field label="الوقت" value={i.time} />
          <Field label="الوردية" value={i.shift} />
          <Field label="المحطة" value={i.station} />
          <Field label="الموقع" value={i.location} />
          <Field label="الرصيف" value={i.platform} />
          <Field label="الكونكورس" value={i.concourse} />
          <Field label="مستوى الشارع" value={i.street_level} />
          <Field label="المسار" value={i.track} />
          <Field label="غرفة المعدات" value={i.equipment_room} />
        </Grid>
        <Box mt={2}>
          <Typography variant="caption" color="textSecondary">وصف الحادث</Typography>
          <Typography variant="body2">{i.description || '-'}</Typography>
        </Box>
      </Section>

      <Section title="اكتشاف الحادث والإبلاغ">
        <Grid container spacing={2}>
          <Field label="مكتشف الحادث" value={i.detection?.discovered_by} />
          <Field label="المبلغ الأول" value={i.detection?.first_reporter} />
          <Field label="رمز الطوارئ" value={i.detection?.emergency_code} />
          <Field label="رقم التصريح" value={i.detection?.permit_number} />
          <Field label="وقت الاكتشاف" value={i.detection?.detection_time} />
          <Field label="وقت إبلاغ OCC" value={i.detection?.occ_notification_time} />
          <Field label="وقت استجابة OCC" value={i.detection?.occ_response_time} />
        </Grid>
      </Section>

      <Section title="نوع الحادث">
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {(i.incident_types || []).map(t => (
            <Chip key={t.type_name} label={t.type_name} color="primary" variant="outlined" />
          ))}
          {(!i.incident_types || i.incident_types.length === 0) && <Typography variant="body2" color="textSecondary">غير محدد</Typography>}
        </Box>
      </Section>

      {i.passengers && i.passengers.length > 0 && (
        <Section title="بيانات الركاب">
          {i.passengers.map((p, idx) => (
            <Box key={idx} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="subtitle2" mb={1}>راكب {idx + 1}</Typography>
              <Grid container spacing={2}>
                <Field label="الاسم" value={p.name} />
                <Field label="العمر" value={p.age} />
                <Field label="الهاتف" value={p.phone} />
                <Field label="جهة الاتصال" value={p.emergency_contact} />
                <Field label="الحالة" value={p.passenger_status} />
                <Field label="المستشفى" value={p.hospital_name} />
                <Field label="رقم الإسعاف" value={p.ambulance_reference} />
              </Grid>
            </Box>
          ))}
        </Section>
      )}

      <Section title="عمليات القطار">
        <Grid container spacing={2}>
          <Field label="رقم القطار" value={i.train_operations?.train_number} />
          <Field label="الموقع" value={i.train_operations?.current_location} />
          <Field label="الوجهة" value={i.train_operations?.destination} />
          <Field label="وضع التشغيل" value={i.train_operations?.operation_mode} />
          <Field label="قطار الإنقاذ" value={i.train_operations?.rescue_train_number} />
          <Field label="بداية الإنقاذ" value={i.train_operations?.rescue_start_time} />
          <Field label="نهاية الإنقاذ" value={i.train_operations?.rescue_end_time} />
        </Grid>
      </Section>

      <Section title="إخلاء المحطة">
        <Grid container spacing={2}>
          <Field label="وقت أمر الإخلاء" value={i.evacuation?.evacuation_order_time} />
          <Field label="وقت البدء" value={i.evacuation?.evacuation_start_time} />
          <Field label="وقت الاكتمال" value={i.evacuation?.evacuation_completion_time} />
          <Field label="إبلاغ OCC" value={i.evacuation?.station_clear_notification_time} />
          <Field label="إعادة الفتح" value={i.evacuation?.station_reopening_time} />
        </Grid>
      </Section>

      {i.staff && i.staff.length > 0 && (
        <Section title="الموظفون">
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>الدور</TableCell>
                  <TableCell>الاسم</TableCell>
                  <TableCell>الرقم الوظيفي</TableCell>
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

      <Section title="تقييم الأثر">
        <Grid container spacing={2}>
          <Field label="مدة الحادث (دقائق)" value={i.impact?.incident_duration} />
          <Field label="مدة الاستجابة" value={i.impact?.response_duration} />
          <Field label="مدة الإخلاء" value={i.impact?.evacuation_duration} />
          <Field label="تأخير القطارات" value={i.impact?.train_delays} />
          <Field label="الركاب المتأثرين" value={i.impact?.passengers_affected} />
          <Field label="الإصابات" value={i.impact?.injuries} />
          <Field label="الوفيات" value={i.impact?.fatalities} />
          <Grid item xs={12}>
            <Field label="الحالة" value={i.impact?.incident_closed ? 'مغلق' : 'مفتوح'} />
          </Grid>
        </Grid>
        {i.impact?.cause && (
          <Box mt={2}>
            <Typography variant="caption" color="textSecondary">سبب الحادث</Typography>
            <Typography variant="body2">{i.impact.cause}</Typography>
          </Box>
        )}
        {i.impact?.corrective_actions && (
          <Box mt={2}>
            <Typography variant="caption" color="textSecondary">الإجراءات التصحيحية</Typography>
            <Typography variant="body2">{i.impact.corrective_actions}</Typography>
          </Box>
        )}
        {i.impact?.lessons_learned && (
          <Box mt={2}>
            <Typography variant="caption" color="textSecondary">الدروس المستفادة</Typography>
            <Typography variant="body2">{i.impact.lessons_learned}</Typography>
          </Box>
        )}
      </Section>
    </Box>
  );
}
