import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress, Chip
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AirlineStopsIcon from '@mui/icons-material/AirlineStops';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrainIcon from '@mui/icons-material/Train';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { kpiApi, KPISummary } from '../api/client';
import { useLang } from '../context/LanguageContext';

const COLORS = ['#0f2b5e', '#d4a11e', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

function KpiCard({ title, value, icon, color, subtitle }: {
  title: string; value: string | number; icon: React.ReactNode; color: string; subtitle?: string;
}) {
  return (
    <Card sx={{
      position: 'relative', overflow: 'hidden',
      '&::before': {
        content: '""', position: 'absolute', top: 0, right: 0,
        width: 120, height: 120, borderRadius: '0 0 0 100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      },
    }}>
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography color="textSecondary" variant="caption" sx={{ fontWeight: 500, letterSpacing: '0.03em' }}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{
            width: 48, height: 48, borderRadius: 3,
            background: `linear-gradient(135deg, ${color}20, ${color}10)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 24, color } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <Box sx={{
        bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
        p: 1.5, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        border: '1px solid rgba(0,0,0,0.06)',
      }}>
        <Typography variant="caption" fontWeight={600}>{label}</Typography>
        {payload.map((entry: any, i: number) => (
          <Typography key={i} variant="body2" sx={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
}

const chartDefaults = {
  sx: { '& .recharts-cartesian-grid-horizontal line': { stroke: '#e8eaed' } },
};

export default function Dashboard() {
  const [kpi, setKpi] = useState<KPISummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    kpiApi.summary().then(res => setKpi(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress size={48} thickness={4} sx={{ color: '#0f2b5e' }} />
    </Box>
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={800} sx={{ color: '#0f2b5e' }}>
          {t('dashboard.title')}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          {t('app.subtitle')}
        </Typography>
      </Box>

      <Grid container spacing={2.5} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={t('dashboard.totalIncidents')}
            value={kpi?.total_incidents || 0}
            icon={<WarningAmberIcon />}
            color="#0f2b5e"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={t('dashboard.openIncidents')}
            value={kpi?.open_incidents || 0}
            icon={<ErrorIcon />}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={t('dashboard.closedIncidents')}
            value={kpi?.closed_incidents || 0}
            icon={<CheckCircleIcon />}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={t('dashboard.injuriesFatalities')}
            value={`${kpi?.total_injuries || 0} / ${kpi?.total_fatalities || 0}`}
            icon={<AirlineStopsIcon />}
            color="#ef4444"
            subtitle="إصابات / وفيات"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} mb={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, gap: 1 }}>
                <AccessTimeIcon sx={{ color: '#0f2b5e', fontSize: 20 }} />
                <Typography variant="h6" sx={{ color: '#0f2b5e' }}>{t('dashboard.avgResponseTimes')}</Typography>
              </Box>
              <Grid container spacing={2}>
                {[
                  { label: t('dashboard.response'), value: kpi?.avg_response_time, color: '#0f2b5e' },
                  { label: t('dashboard.evacuation'), value: kpi?.avg_evacuation_time, color: '#d4a11e' },
                  { label: t('dashboard.rescue'), value: kpi?.avg_rescue_time, color: '#ef4444' },
                ].map(item => (
                  <Grid item xs={4} key={item.label}>
                    <Box sx={{
                      textAlign: 'center', p: 1.5, borderRadius: 3,
                      bgcolor: `${item.color}08`,
                      border: `1px solid ${item.color}15`,
                    }}>
                      <Typography variant="h5" fontWeight={800} sx={{ color: item.color }}>
                        {item.value?.toFixed(1) || '-'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                        {item.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, gap: 1 }}>
                <TrainIcon sx={{ color: '#0f2b5e', fontSize: 20 }} />
                <Typography variant="h6" sx={{ color: '#0f2b5e' }}>{t('dashboard.byStation')}</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={kpi?.incidents_by_station || []} {...chartDefaults}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(15,43,94,0.04)' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {(kpi?.incidents_by_station || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#d4a11e' }} />
                <Typography variant="h6" sx={{ color: '#0f2b5e' }}>{t('dashboard.byType')}</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={kpi?.incidents_by_type || []}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {(kpi?.incidents_by_type || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, justifyContent: 'center' }}>
                {(kpi?.incidents_by_type || []).map((item, i) => (
                  <Chip
                    key={item.name}
                    label={`${item.name} (${item.count})`}
                    size="small"
                    sx={{
                      bgcolor: `${COLORS[i % COLORS.length]}15`,
                      color: COLORS[i % COLORS.length],
                      fontWeight: 600,
                      borderRadius: 2,
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#0f2b5e' }} />
                <Typography variant="h6" sx={{ color: '#0f2b5e' }}>{t('dashboard.monthlyTrend')}</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={kpi?.monthly_trend || []} {...chartDefaults}>
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f2b5e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0f2b5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="#0f2b5e" strokeWidth={2} fill="url(#trendGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
