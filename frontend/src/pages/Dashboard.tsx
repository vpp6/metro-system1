import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AirlineStopsIcon from '@mui/icons-material/AirlineStops';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { kpiApi, KPISummary } from '../api/client';
import { useLang } from '../context/LanguageContext';

const COLORS = ['#1a237e', '#ff6f00', '#4caf50', '#f44336', '#9c27b0', '#2196f3', '#ff9800', '#795548'];

export default function Dashboard() {
  const [kpi, setKpi] = useState<KPISummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    kpiApi.summary().then(res => setKpi(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>{t('dashboard.title')}</Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #1a237e' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" variant="caption">{t('dashboard.totalIncidents')}</Typography>
                  <Typography variant="h4" fontWeight={700}>{kpi?.total_incidents || 0}</Typography>
                </Box>
                <WarningAmberIcon sx={{ fontSize: 40, color: '#1a237e', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #ff6f00' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" variant="caption">{t('dashboard.openIncidents')}</Typography>
                  <Typography variant="h4" fontWeight={700}>{kpi?.open_incidents || 0}</Typography>
                </Box>
                <ErrorIcon sx={{ fontSize: 40, color: '#ff6f00', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #4caf50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" variant="caption">{t('dashboard.closedIncidents')}</Typography>
                  <Typography variant="h4" fontWeight={700}>{kpi?.closed_incidents || 0}</Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: '#4caf50', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #f44336' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" variant="caption">{t('dashboard.injuriesFatalities')}</Typography>
                  <Typography variant="h4" fontWeight={700}>{kpi?.total_injuries || 0} / {kpi?.total_fatalities || 0}</Typography>
                </Box>
                <AirlineStopsIcon sx={{ fontSize: 40, color: '#f44336', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>{t('dashboard.avgResponseTimes')}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <Box>
                  <Typography variant="h4" color="primary" fontWeight={700}>
                    {kpi?.avg_response_time?.toFixed(1) || '-'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">{t('dashboard.response')}</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" color="secondary" fontWeight={700}>
                    {kpi?.avg_evacuation_time?.toFixed(1) || '-'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">{t('dashboard.evacuation')}</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" color="error" fontWeight={700}>
                    {kpi?.avg_rescue_time?.toFixed(1) || '-'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">{t('dashboard.rescue')}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>{t('dashboard.byStation')}</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={kpi?.incidents_by_station || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1a237e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>{t('dashboard.byType')}</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={kpi?.incidents_by_type || []}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(kpi?.incidents_by_type || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>{t('dashboard.monthlyTrend')}</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={kpi?.monthly_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ff6f00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
