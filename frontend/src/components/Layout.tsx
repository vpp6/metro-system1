import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Typography, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Divider
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import MenuIcon from '@mui/icons-material/Menu';
import SubwayIcon from '@mui/icons-material/DirectionsSubway';
import TranslateIcon from '@mui/icons-material/Translate';
import { useLang } from '../context/LanguageContext';

const DRAWER_WIDTH = 240;

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, toggleLang, lang } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { label: t('nav.dashboard'), icon: <DashboardIcon />, path: '/' },
    { label: t('nav.incidents'), icon: <WarningAmberIcon />, path: '/incidents' },
    { label: t('nav.newIncident'), icon: <AddCircleIcon />, path: '/incidents/new' },
  ];

  const drawer = (
    <Box>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <SubwayIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1 }}>
          {t('app.shortTitle')}
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map(item => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            sx={{ borderRadius: 1, mx: 1, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <SubwayIcon sx={{ ml: 1 }} />
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {t('app.title')}
          </Typography>
          <IconButton color="inherit" onClick={toggleLang}>
            <TranslateIcon />
            <Typography variant="caption" sx={{ ml: 0.5 }}>
              {lang === 'ar' ? 'English' : 'العربية'}
            </Typography>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
}
