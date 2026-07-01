import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  MenuItem, Alert, CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { incidentsApi, IncidentCreate } from '../api/client';

const shifts = ['صباحية', 'مسائية', 'ليلية'];
const locations = ['الرصيف', 'الكونكورس', 'مستوى الشارع', 'المسار', 'غرفة المعدات'];
const operationModes = ['UTO', 'ATPM', 'RM', 'DM'];
const discoverers = ['OCC', 'مدير المحطة (SM)', 'مساعد مدير المحطة (ASM)', 'سفير المحطة (SA)', 'الأمن', 'الصيانة', 'عامل النظافة', 'راكب', 'الشرطة', 'الدفاع المدني', 'أخرى'];

const incidentTypeOptions = [
  'حادث طبي للراكب', 'إصابة أو سقوط', 'إنذار حريق', 'دخان',
  'مضخة مكافحة الحريق', 'المولد', 'الشيلر', 'نظام تهوية الأنفاق TVS',
  'HVAC', 'UPS', 'السلالم المتحركة', 'المصاعد', 'أبواب الرصيف PSD',
  'انقطاع الكهرباء', 'تسرب مياه', 'الوصول إلى المسار', 'تعطل نقطة التحويل',
  'إنقاذ قطار', 'تعطل قطار', 'عزل الأبواب', 'فرامل التثبيت',
  'الفرامل الهوائية', 'فقدان تموضع القطار', 'حادث أمني', 'جسم مشبوه', 'أخرى',
];

const staffRoles = ['مدير المحطة SM', 'مساعد مدير المحطة ASM', 'سفير المحطة SA', 'الأمن', 'الصيانة', 'الإسعاف', 'الشرطة', 'الدفاع المدني'];

const emptyForm: IncidentCreate = {
  date: new Date().toISOString().split('T')[0],
  day: '',
  time: '',
  shift: '',
  station: '',
  location: '',
  platform: '',
  concourse: '',
  street_level: '',
  track: '',
  equipment_room: '',
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
          date: d.date || '',
          day: d.day || '',
          time: d.time || '',
          shift: d.shift || '',
          station: d.station || '',
          location: d.location || '',
          platform: d.platform || '',
          concourse: d.concourse || '',
          street_level: d.street_level || '',
          track: d.track || '',
          equipment_room: d.equipment_room || '',
          description: d.description || '',
          detection: d.detection || {},
          incident_types: d.incident_types || [],
          passengers: d.passengers || [],
          train_operations: d.train_operations || {},
          evacuation: d.evacuation || {},
          staff: d.staff || [],
          impact: d.impact || {},
        });
        setSelectedTypes((d.incident_types || []).map(t => t.type_name));
      }).catch(() => setError('فشل تحميل بيانات الحادث')).finally(() => setLoading(false));
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

  const addPassenger = () => {
    update('passengers', [...(form.passengers || []), {}]);
  };

  const removePassenger = (index: number) => {
    update('passengers', (form.passengers || []).filter((_, i) => i !== index));
  };

  const handleStaffChange = (index: number, field: string, value: any) => {
    const staff = [...(form.staff || [])];
    staff[index] = { ...staff[index], [field]: value };
    update('staff', staff);
  };

  const addStaff = () => {
    update('staff', [...(form.staff || []), {}]);
  };

  const removeStaff = (index: number) => {
    update('staff', (form.staff || []).filter((_, i) => i !== index));
  };

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
      setError(err?.response?.data?.detail || 'فشل حفظ الحادث');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/incidents')} sx={{ ml: 2 }}>رجوع</Button>
        <Typography variant="h5" fontWeight={700}>{isEdit ? 'تعديل الحادث' : 'تسجيل حادث جديد'}</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        {/* Section 1: General Info */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" color="primary" mb={2}>المعلومات العامة للحادث</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <TextField label="التاريخ" type="date" value={form.date || ''}
                  onChange={e => update('date', e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label="اليوم" value={form.day || ''} onChange={e => update('day', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label="الوقت" type="time" value={form.time || ''}
                  onChange={e => update('time', e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField select label="الوردية" value={form.shift || ''} onChange={e => update('shift', e.target.value)}>
                  {shifts.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="المحطة" value={form.station || ''} onChange={e => update('station', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField select label="الموقع" value={form.location || ''} onChange={e => update('location', e.target.value)}>
                  {locations.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="رقم الرصيف / المسار" value={form.platform || ''} onChange={e => update('platform', e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="وصف الحادث" multiline rows={3} value={form.description || ''}
                  onChange={e => update('description', e.target.value)} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Section 2: Detection */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" color="primary" mb={2}>اكتشاف الحادث والإبلاغ</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField select label="مكتشف الحادث" value={form.detection?.discovered_by || ''}
                  onChange={e => update('detection', { ...form.detection, discovered_by: e.target.value })}>
                  {discoverers.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="المبلغ الأول" value={form.detection?.first_reporter || ''}
                  onChange={e => update('detection', { ...form.detection, first_reporter: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="رمز الطوارئ" value={form.detection?.emergency_code || ''}
                  onChange={e => update('detection', { ...form.detection, emergency_code: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label="وقت الاكتشاف" type="time" value={form.detection?.detection_time || ''}
                  onChange={e => update('detection', { ...form.detection, detection_time: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label="وقت إبلاغ OCC" type="time" value={form.detection?.occ_notification_time || ''}
                  onChange={e => update('detection', { ...form.detection, occ_notification_time: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label="وقت استجابة OCC" type="time" value={form.detection?.occ_response_time || ''}
                  onChange={e => update('detection', { ...form.detection, occ_response_time: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label="رقم التصريح" value={form.detection?.permit_number || ''}
                  onChange={e => update('detection', { ...form.detection, permit_number: e.target.value })} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Section 3: Incident Types */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" color="primary" mb={2}>نوع الحادث</Typography>
            <Grid container spacing={1}>
              {incidentTypeOptions.map(type => (
                <Grid item key={type}>
                  <Button
                    variant={selectedTypes.includes(type) ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handleTypeToggle(type)}
                    sx={{ borderRadius: 4, textTransform: 'none' }}
                  >
                    {type}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Section 4: Train Operations */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" color="primary" mb={2}>عمليات القطار</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField label="رقم القطار" value={form.train_operations?.train_number || ''}
                  onChange={e => update('train_operations', { ...form.train_operations, train_number: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="الموقع الحالي" value={form.train_operations?.current_location || ''}
                  onChange={e => update('train_operations', { ...form.train_operations, current_location: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="الوجهة" value={form.train_operations?.destination || ''}
                  onChange={e => update('train_operations', { ...form.train_operations, destination: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField select label="وضع التشغيل" value={form.train_operations?.operation_mode || ''}
                  onChange={e => update('train_operations', { ...form.train_operations, operation_mode: e.target.value })}>
                  {operationModes.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="رقم قطار الإنقاذ" value={form.train_operations?.rescue_train_number || ''}
                  onChange={e => update('train_operations', { ...form.train_operations, rescue_train_number: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label="بداية الإنقاذ" type="time" value={form.train_operations?.rescue_start_time || ''}
                  onChange={e => update('train_operations', { ...form.train_operations, rescue_start_time: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label="نهاية الإنقاذ" type="time" value={form.train_operations?.rescue_end_time || ''}
                  onChange={e => update('train_operations', { ...form.train_operations, rescue_end_time: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Section 5: Evacuation */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" color="primary" mb={2}>إخلاء المحطة</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField label="وقت أمر الإخلاء" type="time" value={form.evacuation?.evacuation_order_time || ''}
                  onChange={e => update('evacuation', { ...form.evacuation, evacuation_order_time: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="وقت بدء الإخلاء" type="time" value={form.evacuation?.evacuation_start_time || ''}
                  onChange={e => update('evacuation', { ...form.evacuation, evacuation_start_time: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="وقت اكتمال الإخلاء" type="time" value={form.evacuation?.evacuation_completion_time || ''}
                  onChange={e => update('evacuation', { ...form.evacuation, evacuation_completion_time: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="إبلاغ OCC بخلو المحطة" type="time" value={form.evacuation?.station_clear_notification_time || ''}
                  onChange={e => update('evacuation', { ...form.evacuation, station_clear_notification_time: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="وقت إعادة فتح المحطة" type="time" value={form.evacuation?.station_reopening_time || ''}
                  onChange={e => update('evacuation', { ...form.evacuation, station_reopening_time: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Section 6: Passengers */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="primary">بيانات الركاب</Typography>
              <Button variant="outlined" size="small" onClick={addPassenger}>إضافة راكب</Button>
            </Box>
            {(form.passengers || []).map((p, i) => (
              <Box key={i} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2">راكب {i + 1}</Typography>
                  <Button size="small" color="error" onClick={() => removePassenger(i)}>حذف</Button>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}><TextField label="الاسم" value={p.name || ''} onChange={e => handlePassengerChange(i, 'name', e.target.value)} /></Grid>
                  <Grid item xs={12} sm={2}><TextField label="العمر" type="number" value={p.age || ''} onChange={e => handlePassengerChange(i, 'age', parseInt(e.target.value) || 0)} /></Grid>
                  <Grid item xs={12} sm={3}><TextField label="الهاتف" value={p.phone || ''} onChange={e => handlePassengerChange(i, 'phone', e.target.value)} /></Grid>
                  <Grid item xs={12} sm={3}><TextField label="جهة الاتصال" value={p.emergency_contact || ''} onChange={e => handlePassengerChange(i, 'emergency_contact', e.target.value)} /></Grid>
                  <Grid item xs={12} sm={4}><TextField label="الحالة" value={p.passenger_status || ''} onChange={e => handlePassengerChange(i, 'passenger_status', e.target.value)} /></Grid>
                  <Grid item xs={12} sm={8}><TextField label="الإسعافات المقدمة" fullWidth value={p.first_aid_given || ''} onChange={e => handlePassengerChange(i, 'first_aid_given', e.target.value)} /></Grid>
                  <Grid item xs={12} sm={3}><TextField label="طلب الإسعاف" type="time" value={p.ambulance_request_time || ''} onChange={e => handlePassengerChange(i, 'ambulance_request_time', e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
                  <Grid item xs={12} sm={3}><TextField label="وقت الوصول" type="time" value={p.arrival_time || ''} onChange={e => handlePassengerChange(i, 'arrival_time', e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
                  <Grid item xs={12} sm={3}><TextField label="وقت التسليم" type="time" value={p.handover_time || ''} onChange={e => handlePassengerChange(i, 'handover_time', e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
                  <Grid item xs={12} sm={3}><TextField label="وقت المغادرة" type="time" value={p.departure_time || ''} onChange={e => handlePassengerChange(i, 'departure_time', e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
                  <Grid item xs={12} sm={8}><TextField label="اسم المستشفى" value={p.hospital_name || ''} onChange={e => handlePassengerChange(i, 'hospital_name', e.target.value)} /></Grid>
                  <Grid item xs={12} sm={4}><TextField label="رقم مرجع الإسعاف" value={p.ambulance_reference || ''} onChange={e => handlePassengerChange(i, 'ambulance_reference', e.target.value)} /></Grid>
                </Grid>
              </Box>
            ))}
            {(form.passengers || []).length === 0 && (
              <Typography color="textSecondary" variant="body2">لا يوجد ركاب مضافين</Typography>
            )}
          </CardContent>
        </Card>

        {/* Section 7: Staff */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="primary">الموظفون</Typography>
              <Button variant="outlined" size="small" onClick={addStaff}>إضافة موظف</Button>
            </Box>
            {(form.staff || []).map((s, i) => (
              <Box key={i} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2">موظف {i + 1}</Typography>
                  <Button size="small" color="error" onClick={() => removeStaff(i)}>حذف</Button>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField select label="الدور" value={s.role || ''} onChange={e => handleStaffChange(i, 'role', e.target.value)}>
                      {staffRoles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={4}><TextField label="الاسم" value={s.name || ''} onChange={e => handleStaffChange(i, 'name', e.target.value)} /></Grid>
                  <Grid item xs={12} sm={4}><TextField label="الرقم الوظيفي" value={s.employee_id || ''} onChange={e => handleStaffChange(i, 'employee_id', e.target.value)} /></Grid>
                </Grid>
              </Box>
            ))}
            {(form.staff || []).length === 0 && (
              <Typography color="textSecondary" variant="body2">لا يوجد موظفين مضافين</Typography>
            )}
          </CardContent>
        </Card>

        {/* Section 8: Impact Assessment */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" color="primary" mb={2}>تقييم الأثر</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}><TextField label="مدة الحادث (دقائق)" type="number" value={form.impact?.incident_duration || ''} onChange={e => update('impact', { ...form.impact, incident_duration: parseInt(e.target.value) || 0 })} /></Grid>
              <Grid item xs={12} sm={3}><TextField label="مدة الاستجابة (دقائق)" type="number" value={form.impact?.response_duration || ''} onChange={e => update('impact', { ...form.impact, response_duration: parseInt(e.target.value) || 0 })} /></Grid>
              <Grid item xs={12} sm={3}><TextField label="مدة الإخلاء (دقائق)" type="number" value={form.impact?.evacuation_duration || ''} onChange={e => update('impact', { ...form.impact, evacuation_duration: parseInt(e.target.value) || 0 })} /></Grid>
              <Grid item xs={12} sm={3}><TextField label="تأخير القطارات (دقائق)" type="number" value={form.impact?.train_delays || ''} onChange={e => update('impact', { ...form.impact, train_delays: parseInt(e.target.value) || 0 })} /></Grid>
              <Grid item xs={12} sm={3}><TextField label="الركاب المتأثرين" type="number" value={form.impact?.passengers_affected || ''} onChange={e => update('impact', { ...form.impact, passengers_affected: parseInt(e.target.value) || 0 })} /></Grid>
              <Grid item xs={12} sm={3}><TextField label="الإصابات" type="number" value={form.impact?.injuries || ''} onChange={e => update('impact', { ...form.impact, injuries: parseInt(e.target.value) || 0 })} /></Grid>
              <Grid item xs={12} sm={3}><TextField label="الوفيات" type="number" value={form.impact?.fatalities || ''} onChange={e => update('impact', { ...form.impact, fatalities: parseInt(e.target.value) || 0 })} /></Grid>
              <Grid item xs={12} sm={3}>
                <TextField select label="حالة الحادث" value={form.impact?.incident_closed !== undefined ? (form.impact.incident_closed ? 'مغلق' : 'مفتوح') : ''}
                  onChange={e => update('impact', { ...form.impact, incident_closed: e.target.value === 'مغلق' })}>
                  <MenuItem value="مفتوح">مفتوح</MenuItem>
                  <MenuItem value="مغلق">مغلق</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}><TextField label="المعدات المتأثرة" value={form.impact?.equipment_affected || ''} onChange={e => update('impact', { ...form.impact, equipment_affected: e.target.value })} /></Grid>
              <Grid item xs={12}><TextField label="سبب الحادث" multiline rows={2} value={form.impact?.cause || ''} onChange={e => update('impact', { ...form.impact, cause: e.target.value })} /></Grid>
              <Grid item xs={12}><TextField label="الإجراءات التصحيحية" multiline rows={2} value={form.impact?.corrective_actions || ''} onChange={e => update('impact', { ...form.impact, corrective_actions: e.target.value })} /></Grid>
              <Grid item xs={12}><TextField label="الدروس المستفادة" multiline rows={2} value={form.impact?.lessons_learned || ''} onChange={e => update('impact', { ...form.impact, lessons_learned: e.target.value })} /></Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', mb: 4 }}>
          <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">
            {saving ? 'جاري الحفظ...' : (isEdit ? 'تحديث الحادث' : 'تسجيل الحادث')}
          </Button>
          <Button variant="outlined" onClick={() => navigate('/incidents')} size="large">إلغاء</Button>
        </Box>
      </form>
    </Box>
  );
}
