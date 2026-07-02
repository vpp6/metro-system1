import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Typography, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Divider, Avatar
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import MenuIcon from '@mui/icons-material/Menu';
import SubwayIcon from '@mui/icons-material/DirectionsSubway';
import { useLang } from '../context/LanguageContext';

const DRAWER_WIDTH = 260;

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { label: t('nav.dashboard'), icon: <DashboardIcon />, path: '/' },
    { label: t('nav.incidents'), icon: <WarningAmberIcon />, path: '/incidents' },
    { label: t('nav.newIncident'), icon: <AddCircleIcon />, path: '/incidents/new' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{
        p: 3, textAlign: 'center',
        background: 'linear-gradient(135deg, #0f2b5e 0%, #1a3f7a 100%)',
        position: 'relative', overflow: 'hidden',
        '&::before': {
          content: '""', position: 'absolute', top: -50, right: -50,
          width: 150, height: 150, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        },
        '&::after': {
          content: '""', position: 'absolute', bottom: -30, left: -30,
          width: 100, height: 100, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        },
      }}>
        <Avatar sx={{
          bgcolor: 'rgba(255,255,255,0.15)', width: 56, height: 56, mx: 'auto', mb: 1,
          backdropFilter: 'blur(10px)',
        }}>
          <SubwayIcon sx={{ fontSize: 32, color: '#fff' }} />
        </Avatar>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fff', opacity: 0.9 }}>
          {t('app.shortTitle')}
        </Typography>
        <Typography variant="caption" sx={{ color: '#fff', opacity: 0.5 }}>
          {t('app.subtitle')}
        </Typography>
      </Box>
      <Divider sx={{ opacity: 0.1 }} />
      <List sx={{ flex: 1, px: 1.5, py: 1 }}>
        {menuItems.map(item => {
          const selected = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={{
                borderRadius: 3, mb: 0.5, px: 2, py: 1.2,
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, rgba(15,43,94,0.08) 0%, rgba(26,63,122,0.05) 100%)',
                  '& .MuiListItemIcon-root': { color: '#0f2b5e' },
                  '& .MuiListItemText-primary': { color: '#0f2b5e', fontWeight: 700 },
                  '&::before': {
                    content: '""', position: 'absolute', left: 0, top: '50%',
                    transform: 'translateY(-50%)', width: 3, height: 20,
                    borderRadius: '0 4px 4px 0',
                    background: 'linear-gradient(180deg, #0f2b5e, #1a3f7a)',
                  },
                },
                '&:hover:not(.Mui-selected)': {
                  background: 'rgba(0,0,0,0.03)',
                },
              }}
            >
              <ListItemIcon sx={{
                minWidth: 38,
                color: selected ? '#0f2b5e' : 'text.secondary',
                transition: 'all 0.2s',
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: selected ? 700 : 500,
                  color: selected ? '#0f2b5e' : 'text.secondary',
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f0f2f5' }}>
      <AppBar position="fixed" sx={{
        background: 'linear-gradient(135deg, #0f2b5e 0%, #1a3f7a 50%, #234b8a 100%)',
        backdropFilter: 'blur(20px)',
        zIndex: theme => theme.zIndex.drawer + 1,
      }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { md: 'none' }, bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
            <MenuIcon />
          </IconButton>
          <SubwayIcon sx={{ ml: lang === 'ar' ? 0 : 1, mr: lang === 'ar' ? 1 : 0, fontSize: 28 }} />
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: '0.02em' }}>
            {t('app.title')}
          </Typography>

        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, borderRadius: '0 16px 16px 0' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH, boxSizing: 'border-box',
              borderRight: '1px solid rgba(0,0,0,0.06)',
              bgcolor: '#ffffff',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{
        flexGrow: 1, p: 3, mt: 8,
        minHeight: 'calc(100vh - 64px)',
      }}>
        {children}
      </Box>
    </Box>
  );
}
