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

// ---- Types for conversation list / details ----
type TranscriptRole = 'user' | 'assistant' | 'ai';
export interface TranscriptMessage {
  role: TranscriptRole;
  message: string;
}
interface ConversationDetailsResponse {
  transcript?: TranscriptMessage[] | string | null;
}
interface RawConversation {
  id?: string;
  conversation_id?: string;
  date?: string | number;
  duration?: number;
  call_duration_secs?: number;
  messages?: number;
  message_count?: number;
  evaluation?: string;
  evaluation_result?: string;
}

// Type guard so TS knows it's our message array (not any[])
function isTranscriptArray(val: unknown): val is TranscriptMessage[] {
  return (
    Array.isArray(val) &&
    val.every(
      (m) =>
        m &&
        typeof m === 'object' &&
        'message' in (m as Record<string, unknown>) &&
        typeof (m as Record<string, unknown>).message === 'string'
    )
  );
}

export function ConversationsTable(): React.JSX.Element {
  // list + paging lives here now
  const [rows, setRows] = React.useState<ConversationRow[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loadingList, setLoadingList] = React.useState(true);

  // dialog state
  const [selectedRow, setSelectedRow] = React.useState<ConversationRow | null>(null);
  const [open, setOpen] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [transcript, setTranscript] = React.useState<string | TranscriptMessage[] | null>(null);
  const [loadingDetail, setLoadingDetail] = React.useState(false);

  // fetch conversations (last 30 days)
  React.useEffect(() => {
    const fetchConversations = async () => {
      try {
        const now = Math.floor(Date.now() / 1000);
        const oneMonthAgo = now - 30 * 24 * 60 * 60;

        const res = await fetch(`/.netlify/functions/listConversations?start=${oneMonthAgo}&end=${now}`);
        const data = await res.json();

        const formatted: ConversationRow[] = (data.conversations as RawConversation[]).map((c) => ({
          id: c.id || c.conversation_id || 'unknown',
          date: c.date
            ? new Date(Number(c.date) * 1000).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Invalid Date',
          duration: formatDuration(c.duration ?? c.call_duration_secs ?? 0),
          messages: c.messages ?? c.message_count ?? 0,
          evaluation: normalizeEvaluation(c.evaluation ?? c.evaluation_result ?? 'Pending'),
        }));

        setRows(formatted);
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setLoadingList(false);
      }
    };

    fetchConversations();
  }, []);

  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage);
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleRowClick = async (row: ConversationRow) => {
    setSelectedRow(row);
    setOpen(true);
    setLoadingDetail(true);

    try {
      // Get transcript & metadata
      const detailRes = await fetch(`/.netlify/functions/getConversationDetails?id=${row.id}`);
      const detailData: ConversationDetailsResponse = await detailRes.json();

      const t = detailData?.transcript ?? null;
      if (typeof t === 'string' || t === null || isTranscriptArray(t)) {
        setTranscript(t ?? 'No transcript available.');
      } else {
        setTranscript('No transcript available.');
      }

      // Fetch audio as blob
      const audioRes = await fetch(`/.netlify/functions/getAudioBlob?id=${row.id}`);
      const audioBlob = await audioRes.blob();
      const audioObjectUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioObjectUrl);
    } catch (error) {
      console.error('Error loading conversation:', error);
      setTranscript('Failed to load conversation details.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
    setAudioUrl(null);
    setTranscript(null);
  };

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
                <TableRow key={row.id} hover onClick={() => handleRowClick(row)} sx={{ cursor: 'pointer' }}>
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
          {loadingDetail ? (
            <CircularProgress />
          ) : (
            <>
              {selectedRow?.date && (
                <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
                  {selectedRow.date}
                </Typography>
              )}

              {audioUrl && (
                <Box mb={2}>
                  <audio controls style={{ width: '100%' }}>
                    <source src={audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </Box>
              )}

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
                {typeof transcript === 'string' && (
                  <Typography variant="body2" color="text.primary">
                    {transcript}
                  </Typography>
                )}

                {isTranscriptArray(transcript) &&
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
                  ))}

                {!transcript && (
                  <Typography variant="body2" color="error">
                    No transcript available.
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

// helpers
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
function normalizeEvaluation(value: string): 'Successful' | 'Failed' | 'Pending' {
  const val = value.toLowerCase();
  if (val === 'success' || val === 'successful') return 'Successful';
  if (val === 'fail' || val === 'failed') return 'Failed';
  return 'Pending';
}
