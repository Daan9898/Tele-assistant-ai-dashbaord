'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr';
import dayjs from 'dayjs';

const invoices = [
  { id: 'INV-006', date: 'Aug 1, 2025', plan: 'Enterprise', amount: 1731.84, status: 'Paid' },
  { id: 'INV-005', date: 'Jul 1, 2025', plan: 'Pro', amount: 570.84, status: 'Paid' },
  { id: 'INV-004', date: 'Jun 1, 2025', plan: 'Pro', amount: 570.84, status: 'Paid' },
  { id: 'INV-003', date: 'May 1, 2025', plan: 'Basic', amount: 388.64, status: 'Paid' },
  { id: 'INV-002', date: 'Apr 1, 2025', plan: 'Basic', amount: 388.64, status: 'Paid' },
  { id: 'INV-001', date: 'Mar 1, 2025', plan: 'Basic', amount: 388.64, status: 'Paid' },
];

const pricingExamples = [
  { minutes: 600, price: 388.64, plan: 'Basic' },
  { minutes: 1100, price: 570.84, plan: 'Pro' },
  { minutes: 3600, price: 1731.84, plan: 'Enterprise' },
];

export function InvoiceHistoryCard(): React.JSX.Element {
  const total = invoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <Card>
      <CardHeader
        title="Invoice History"
        action={
          <Button endIcon={<ArrowRightIcon />} size="small" variant="text">
            Download All
          </Button>
        }
      />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow hover key={invoice.id}>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{dayjs(invoice.date).format('MMM D, YYYY')}</TableCell>
                <TableCell>{invoice.plan}</TableCell>
                <TableCell>€{invoice.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip color="success" label={invoice.status} size="small" />
                </TableCell>
                <TableCell>
                  <Button size="small" variant="text">
                    Download
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <Pagination count={3} size="small" />
      </Box>
    </Card>
  );
}
