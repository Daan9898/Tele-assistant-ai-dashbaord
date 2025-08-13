'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
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
import Pagination from '@mui/material/Pagination';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr';
import dayjs from 'dayjs';

import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

type Invoice = {
  id: string;
  date: string; // e.g., "Aug 1, 2025"
  plan: 'Basic' | 'Pro' | 'Enterprise';
  amount: number;
  status: 'Paid' | 'Due' | 'Overdue';
};

const invoices: Invoice[] = [
  { id: 'INV-006', date: 'Aug 1, 2025', plan: 'Enterprise', amount: 1731.84, status: 'Paid' },
  { id: 'INV-005', date: 'Jul 1, 2025', plan: 'Pro', amount: 570.84, status: 'Paid' },
  { id: 'INV-004', date: 'Jun 1, 2025', plan: 'Pro', amount: 570.84, status: 'Paid' },
  { id: 'INV-003', date: 'May 1, 2025', plan: 'Basic', amount: 388.64, status: 'Paid' },
  { id: 'INV-002', date: 'Apr 1, 2025', plan: 'Basic', amount: 388.64, status: 'Paid' },
  { id: 'INV-001', date: 'Mar 1, 2025', plan: 'Basic', amount: 388.64, status: 'Paid' },
];

const PLAN_MINUTES: Record<Invoice['plan'], number> = {
  Basic: 600,
  Pro: 1100,
  Enterprise: 3600,
};

const euro = (n: number) => `€${n.toFixed(2)}`;

// Small utility to trigger browser download (no dependency on file-saver)
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Safer layout that respects page width and margins; wraps long text.
function generateInvoicePdfBlob(inv: Invoice): Blob {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 56;
  const leftX = margin;
  const rightX = pageW - margin;
  const contentW = rightX - leftX;

  let y = margin + 8;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('INVOICE', leftX, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Invoice #: ${inv.id}`, rightX, margin + 8, { align: 'right' });
  doc.text(`Date: ${dayjs(inv.date).format('MMM D, YYYY')}`, rightX, margin + 24, { align: 'right' });
  doc.text(`Status: ${inv.status}`, rightX, margin + 40, { align: 'right' });

  // From
  y += 32;
  doc.setFont('helvetica', 'bold');
  doc.text('From', leftX, y);
  doc.setFont('helvetica', 'normal');
  y += 16; doc.text('TeleAssistant AI (Demo)', leftX, y);
  y += 14; doc.text('Your address line 1', leftX, y);
  y += 14; doc.text('Your address line 2', leftX, y);
  y += 14; doc.text('Billing: billing@yourdomain.com · +31 6 0000 0000', leftX, y);

  // Bill To
  y += 28; doc.setFont('helvetica', 'bold'); doc.text('Bill To', leftX, y);
  doc.setFont('helvetica', 'normal');
  y += 16; doc.text('Client Company Name', leftX, y);
  y += 14; doc.text('Client address line 1', leftX, y);
  y += 14; doc.text('Client address line 2', leftX, y);

  // Table header
  y += 28;
  const colDesc = leftX;
  const colQty  = leftX + Math.min(300, contentW - 260);
  const colUnit = rightX - 140;
  const colTotal= rightX;

  doc.setFont('helvetica', 'bold');
  doc.text('Description', colDesc, y);
  doc.text('Qty', colQty, y);
  doc.text('Unit Price', colUnit, y, { align: 'right' });
  doc.text('Line Total', colTotal, y, { align: 'right' });

  doc.setDrawColor(200);
  doc.line(leftX, y + 6, rightX, y + 6);

  // Row
  y += 24;
  doc.setFont('helvetica', 'normal');
  const minutes = PLAN_MINUTES[inv.plan];
  const monthLabel = dayjs(inv.date).format('MMMM YYYY');
  const description = `${inv.plan} Plan — ${minutes} minutes (${monthLabel})`;

  const wrapped = doc.splitTextToSize(description, colQty - colDesc - 8);
  doc.text(wrapped, colDesc, y);

  const rowY = y + (Array.isArray(wrapped) ? (wrapped.length - 1) * 12 : 0);
  doc.text('1', colQty, rowY);
  doc.text(euro(inv.amount), colUnit, rowY, { align: 'right' });
  doc.text(euro(inv.amount), colTotal, rowY, { align: 'right' });

  // Totals
  let tY = rowY + 28;
  doc.setDrawColor(200);
  doc.line(leftX, tY, rightX, tY);
  tY += 18;

  doc.text('Subtotal:', colUnit, tY, { align: 'right' });
  doc.text(euro(inv.amount), colTotal, tY, { align: 'right' });
  tY += 16;

  doc.setFont('helvetica', 'bold');
  doc.text('Total:', colUnit, tY, { align: 'right' });
  doc.text(euro(inv.amount), colTotal, tY, { align: 'right' });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    'Thank you for your business. Payment received via saved method. This is a demo invoice.',
    leftX,
    pageH - margin
  );

  return doc.output('blob');
}

export function InvoiceHistoryCard(): React.JSX.Element {
  const handleDownload = (invoice: Invoice) => {
    const blob = generateInvoicePdfBlob(invoice);
    downloadBlob(blob, `${invoice.id}.pdf`);
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    invoices.forEach((inv) => zip.file(`${inv.id}.pdf`, generateInvoicePdfBlob(inv)));
    const content = await zip.generateAsync({ type: 'blob' });
    downloadBlob(content, 'invoices.zip');
  };

  return (
    <Card>
      <CardHeader
        title="Invoice History"
        action={
          <Button endIcon={<ArrowRightIcon />} size="small" variant="text" onClick={handleDownloadAll}>
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
                  <Button size="small" variant="text" onClick={() => handleDownload(invoice)}>
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
