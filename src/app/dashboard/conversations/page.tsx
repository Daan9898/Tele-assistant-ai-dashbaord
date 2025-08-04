'use client';

import * as React from 'react';
import { Stack, Typography, CircularProgress, Card } from '@mui/material';
import { ConversationsTable, ConversationRow } from '@/components/dashboard/conversations/conversations-table';

export default function Page(): React.JSX.Element {
  const [rows, setRows] = React.useState<ConversationRow[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchConversations = async () => {
      try {
        const now = Math.floor(Date.now() / 1000);
        const oneMonthAgo = now - 30 * 24 * 60 * 60;

        const res = await fetch(`/.netlify/functions/listConversations?start=${oneMonthAgo}&end=${now}`);
        const data = await res.json();

        const formatted: ConversationRow[] = data.conversations.map((c: any) => ({
          id: c.id || c.conversation_id,
         date: c.date
          ? new Date(Number(c.date) * 1000).toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Invalid Date',
          duration: formatDuration(c.duration || c.call_duration_secs || 0),
          messages: c.messages || c.message_count || 0,
          evaluation: normalizeEvaluation(c.evaluation || c.evaluation_result || 'Pending'),
          conversationId: c.id,
        }));

        setRows(formatted);
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage);
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading conversations...
        </Typography>
      </Card>
    );
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Conversations</Typography>
      <ConversationsTable
        rows={paginatedRows}
        count={rows.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Stack>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function normalizeEvaluation(value: string): 'Successful' | 'Failed' | 'Pending' {
  const val = value?.toLowerCase?.();

  if (val === 'success' || val === 'successful') return 'Successful';
  if (val === 'fail' || val === 'failed') return 'Failed';

  return 'Pending';
}
