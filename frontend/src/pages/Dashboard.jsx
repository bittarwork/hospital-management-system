import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
} from "@mui/material";
import {
  People as PatientsIcon,
  LocalHospital as DoctorsIcon,
  EventNote as AppointmentsIcon,
  MonetizationOn as MoneyIcon,
} from "@mui/icons-material";

const Dashboard = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 3,
        }}
      >
        أهلاً وسهلاً بك في مستشفى ماهر العلي 🏥
      </Typography>

      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        نظرة عامة شاملة على أداء المستشفى اليوم
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    إجمالي المرضى
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#3b82f6">
                    1,247
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "#3b82f6", width: 56, height: 56 }}>
                  <PatientsIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    الأطباء المتاحون
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#10b981">
                    89
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "#10b981", width: 56, height: 56 }}>
                  <DoctorsIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    مواعيد اليوم
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#f59e0b">
                    45
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "#f59e0b", width: 56, height: 56 }}>
                  <AppointmentsIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    الإيرادات الشهرية
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#8b5cf6">
                    485,000 ريال
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "#8b5cf6", width: 56, height: 56 }}>
                  <MoneyIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Welcome Message */}
      <Card sx={{ mt: 4 }}>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            🎉 مرحباً بك في النظام الجديد!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            تم ترقية النظام بنجاح إلى Vite مع تصميم عصري جديد
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
