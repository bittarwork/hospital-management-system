import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Card,
  CardContent,
  Chip,
  useTheme,
  useMediaQuery,
  Tooltip,
  Button,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PatientsIcon,
  LocalHospital as DoctorsIcon,
  EventNote as AppointmentsIcon,
  Description as MedicalRecordsIcon,
  Receipt as InvoicesIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Help as HelpIcon,
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Home as HomeIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material";

const drawerWidth = 280;

const menuItems = [
  { text: "لوحة التحكم", icon: DashboardIcon, path: "/", color: "#3b82f6" },
  { text: "المرضى", icon: PatientsIcon, path: "/patients", color: "#10b981" },
  { text: "الأطباء", icon: DoctorsIcon, path: "/doctors", color: "#8b5cf6" },
  {
    text: "المواعيد",
    icon: AppointmentsIcon,
    path: "/appointments",
    color: "#f59e0b",
  },
  {
    text: "السجلات الطبية",
    icon: MedicalRecordsIcon,
    path: "/medical-records",
    color: "#ef4444",
  },
  { text: "الفواتير", icon: InvoicesIcon, path: "/invoices", color: "#06b6d4" },
];

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const currentRoute = menuItems.find(
    (item) => item.path === location.pathname
  );

  const SidebarContent = () => (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: "primary.main",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                fontSize: "1.5rem",
                fontWeight: "bold",
              }}
            >
              م
            </Avatar>
          </motion.div>
          <Box>
            <Typography variant="h6" fontWeight="bold" color="primary">
              مستشفى ماهر العلي
            </Typography>
            <Typography variant="body2" color="text.secondary">
              نظام الإدارة الطبية
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Box sx={{ p: 2 }}>
        <Card
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            mb: 2,
          }}
        >
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
              مرحباً بك، د. أحمد محمد
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  12
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  مواعيد اليوم
                </Typography>
              </Box>
              <Chip
                label="نشط"
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: "bold",
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, px: 2 }}>
        <List>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      px: 2,
                      mx: 1,
                      bgcolor: isActive ? `${item.color}15` : "transparent",
                      border: isActive
                        ? `1px solid ${item.color}30`
                        : "1px solid transparent",
                      "&:hover": {
                        bgcolor: `${item.color}08`,
                        transform: "translateX(-4px)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? item.color : "text.secondary",
                        minWidth: 40,
                      }}
                    >
                      <item.icon />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        "& .MuiListItemText-primary": {
                          fontSize: "0.875rem",
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? item.color : "text.primary",
                        },
                      }}
                    />
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: item.color,
                          }}
                        />
                      </motion.div>
                    )}
                  </ListItemButton>
                </ListItem>
              </motion.div>
            );
          })}
        </List>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton sx={{ borderRadius: 2, py: 1 }}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="الإعدادات" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton sx={{ borderRadius: 2, py: 1 }}>
              <ListItemIcon>
                <HelpIcon />
              </ListItemIcon>
              <ListItemText primary="المساعدة" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          boxShadow:
            "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" }, color: "text.primary" }}
          >
            <MenuIcon />
          </IconButton>

          {/* Breadcrumb */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
            <HomeIcon sx={{ color: "text.secondary", fontSize: 18 }} />
            <Typography variant="body2" color="text.secondary">
              /
            </Typography>
            <Typography
              variant="body2"
              color="primary.main"
              fontWeight="medium"
            >
              {currentRoute?.text || "الصفحة الرئيسية"}
            </Typography>
          </Box>

          {/* Right Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Notifications */}
            <IconButton
              size="large"
              aria-label="show notifications"
              color="inherit"
              onClick={handleNotificationMenuOpen}
              sx={{ color: "text.primary" }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Profile */}
            <Tooltip title="الملف الشخصي">
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{ ml: 1 }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "primary.main",
                    fontSize: "0.875rem",
                  }}
                >
                  أح
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              border: "none",
              boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
            },
          }}
        >
          <SidebarContent />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              border: "none",
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
          open
        >
          <SidebarContent />
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Toolbar />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ padding: "24px" }}
        >
          {children}
        </motion.div>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.1))",
            mt: 1.5,
            borderRadius: 2,
            minWidth: 200,
            "& .MuiMenuItem-root": {
              px: 2,
              py: 1.5,
              borderRadius: 1,
              mx: 1,
              my: 0.5,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          الملف الشخصي
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          الإعدادات
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          تسجيل الخروج
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.1))",
            mt: 1.5,
            borderRadius: 2,
            minWidth: 320,
            maxHeight: 400,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" fontWeight="bold">
            الإشعارات
          </Typography>
        </Box>
        <Box sx={{ maxHeight: 250, overflow: "auto" }}>
          {[1, 2, 3].map((item) => (
            <MenuItem
              key={item}
              sx={{
                flexDirection: "column",
                alignItems: "flex-start",
                whiteSpace: "normal",
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                موعد جديد مع د. سارة العتيبي
              </Typography>
              <Typography variant="caption" color="text.secondary">
                منذ 5 دقائق
              </Typography>
            </MenuItem>
          ))}
        </Box>
        <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Button fullWidth size="small">
            عرض جميع الإشعارات
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Layout;
