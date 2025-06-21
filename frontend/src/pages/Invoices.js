import React from 'react';
import { Typography, Box, Paper } from '@mui/material';

export default function Invoices() {
    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                إدارة الفواتير
            </Typography>
            <Paper sx={{ p: 3, mt: 2 }}>
                <Typography variant="body1">
                    هنا سيتم عرض الفواتير وإمكانية إنشاء فواتير جديدة
                </Typography>
            </Paper>
        </Box>
    );
} 