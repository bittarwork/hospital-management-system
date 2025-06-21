import React from 'react';
import { Typography, Box, Paper } from '@mui/material';

export default function MedicalRecords() {
    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                السجلات الطبية
            </Typography>
            <Paper sx={{ p: 3, mt: 2 }}>
                <Typography variant="body1">
                    هنا سيتم عرض السجلات الطبية للمرضى
                </Typography>
            </Paper>
        </Box>
    );
} 