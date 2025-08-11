'use client';

import * as React from 'react';
import {
  Box,
  Card,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  TablePagination,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from '@mui/material';

export interface ConversationRow {
  id: string;
  date: string;
  duration: string;
  messages: number;
  evaluation: 'Successful' | 'Failed' | 'Pending';
}

type RawConversation = {
  id?: string;
  conversation_id?: string;
  date?: string | number; // epoch seconds (server)
  duration?: number;
  call_duration_secs?: number;
  messages?: number;
  message_count?: number;
  evaluation?: string;
  evaluation_result?: string;
};

type ListConversationsResponse = {
  conversations?: RawConversation[];
};

type TranscriptMessage = {
  role: string; // 'user' | 'assistant' | 'ai' | etc.
  message: string;
};

type ConversationDetailsResponse =
  | { transcript?: TranscriptMessage[] | string | null }
  | Record<string, unknown>;

export function ConversationsTable(): React.JSX.Element {
  // table data
  const [rows, setRows] = React.useState<ConversationRow[]>([]);
  const [loadingList, setLoadingList] = React.useState<boolean>(true);
  const [listError, setListError] = React.useState<string | null>(null);

  // pagination
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);

  // dialog + details
  const [selectedRow, setSelectedRow] = React.useState<ConversationRow | null>(null);
  const [open, setOpen] = React.useState<boolean>(false);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [transcript, setTranscript] = React.useState<TranscriptMessage[] | string | null>(null);
  const [loadingDetails, setLoadingDetails] = React.useState<boolean>(false);

  // Fetch conversations list (last 30 days) on mount
  React.useEffect(() => {
    const load = async (): Promise<void> => {
      setLoadingList(true);
      setListError(null);
      try {
        const now = Math.floor(Date.now() / 1000);
        const start = now - 30 * 24 * 60 * 60;

        const res = await fetch(`/.netlify/functions/listConversations?start=${start}&end=${now}`);
        const data: ListConversationsResponse = await res.json();

        const formatted: ConversationRow[] = (data.conversations ?? []).map((c) => ({
          id: c.id || c.conversation_id || 'unknown',
          date: c.date
            ? formatDate(Number(c.date))
            : 'Invalid Date',
          duration: formatDuration(c.duration ?? c.call_duration_secs ?? 0),
          messages: c.messages ?? c.message_count ?? 0,
          evaluation: normalizeEvaluation(c.evaluation ?? c.evaluation_result ?? 'Pending'),
        }));

        setRows(formatted);
      } catch (error) {
        console.error('Failed to load conversations:', error);
        setListError('Failed to load conversations.');
      } finally {
        setLoadingList(false);
      }
    };

    load();
  }, []);

  const handleRowClick = async (row: ConversationRow): Promise<void> => {
    setSelectedRow(row);
    setOpen(true);
    setLoadingDetails(true);
    setTranscript(null);
    setAudioUrl(null);

    try {
      // 1) Conversation details (transcript, etc.)
      const detailRes = await fetch(`/.netlify/functions/getConversationDetails?id=${row.id}`);
      const detailData: ConversationDetailsResponse = await detailRes.json();

      let nextTranscript: string | TranscriptMessage[] | null = null;
      const raw = detailData.transcript;

      if (typeof raw === 'string') {
        nextTranscript = raw;
      } else if (Array.isArray(raw)) {
        // coerce array items into TranscriptMessage shape
        nextTranscript = raw
          .filter((m): m is { role: unknown; message: unknown } => !!m && typeof m === 'object')
          .map((m: any) => ({
            role: String(m.role ?? 'assistant'),
            message: String(m.message ?? ''),
          }));
      }

      setTranscript(nextTranscript ?? 'No transcript available.');

      // 2) Audio blob
      const audioRes = await fetch(`/.netlify/functions/getAudioBlob?id=${row.id}`);
      if (audioRes.ok) {
        const audioBlob = await audioRes.blob();
        const objectUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(objectUrl);
      }
    } catch (error) {
      console.error('Error loading conversation details:', error);
      setTranscript('Failed to load conversation details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleClose = (): void => {
    setOpen(false);
    setSelectedRow(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setTranscript(null);
  };

  const handlePageChange = (_: unknown, newPage: number): void => setPage(newPage);
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Loading / error states for list
  if (loadingList) {
    return (
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading conversations...
        </Typography>
      </Card>
    );
  }

  if (listError) {
    return (
      <Card sx={{ p: 4 }}>
        <Typography variant="body2" color="error">
          {listError}
        </Typography>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell align="center">Date</TableCell>
                <TableCell align="center">Duration</TableCell>
                <TableCell align="center">Messages</TableCell>
                <TableCell align="center">Evaluation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => handleRowClick(row)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell align="center">
                    <Typography variant="body2">{row.date}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{row.duration}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{row.messages}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={row.evaluation}
                      variant="outlined"
                      size="small"
                      sx={{
                        ...(row.evaluation === 'Successful' && {
                          bgcolor: 'success.main',
                          borderColor: 'success.main',
                          color: 'white',
                        }),
                        ...(row.evaluation === 'Failed' && {
                          bgcolor: 'error.main',
                          borderColor: 'error.main',
                          color: 'white',
                        }),
                        ...(row.evaluation === 'Pending' && {
                          bgcolor: 'warning.light',
                          borderColor: 'warning.main',
                          color: 'black',
                        }),
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Divider />
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Conversation Details</DialogTitle>
        <DialogContent dividers>
          {loadingDetails ? (
            <CircularProgress />
          ) : (
            <>
              {selectedRow?.date ? (
                <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
                  {selectedRow.date}
                </Typography>
              ) : null}

              {audioUrl ? (
                <Box mb={2}>
                  <audio controls style={{ width: '100%' }}>
                    <source src={audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </Box>
              ) : null}

              <Divider variant="middle" flexItem sx={{ mb: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Transcript
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  mt: 2,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  px: 1,
                }}
              >
                {Array.isArray(transcript) ? (
                  transcript.map((msg, index) => (
                    <Box
                      key={index}
                      sx={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        backgroundColor: msg.role === 'user' ? '#DCF8C6' : '#F1F0F0',
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        maxWidth: '75%',
                        boxShadow: 1,
                      }}
                    >
                      <Typography variant="caption" color="textSecondary">
                        {msg.role === 'user' ? 'User' : 'AI'}
                      </Typography>
                      <Typography variant="body2" color="textPrimary">
                        {msg.message}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {typeof transcript === 'string' ? transcript : 'No transcript available.'}
                  </Typography>
                )}
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}


function formatDate(epochSeconds: number): string {
  // Client-side formatting only (this file is a Client Component)
  return new Date(epochSeconds * 1000).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function normalizeEvaluation(value: string): 'Successful' | 'Failed' | 'Pending' {
  const val = value?.toLowerCase?.() ?? '';
  if (val === 'success' || val === 'successful') return 'Successful';
  if (val === 'fail' || val === 'failed') return 'Failed';
  return 'Pending';
}
