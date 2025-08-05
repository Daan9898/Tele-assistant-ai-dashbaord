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

interface ConversationsTableProps {
  rows: ConversationRow[];
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ConversationsTable({
  rows,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: ConversationsTableProps): React.JSX.Element {
  const [selectedRow, setSelectedRow] = React.useState<ConversationRow | null>(null);
  const [open, setOpen] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [transcript, setTranscript] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

    const handleRowClick = async (row: ConversationRow) => {
    setSelectedRow(row);
    setOpen(true);
    setLoading(true);

    try {
        // Get transcript & metadata
        const detailRes = await fetch(`/.netlify/functions/getConversationDetails?id=${row.id}`);
        const detailData = await detailRes.json();
        setTranscript(detailData.transcript || 'No transcript available.');

        // Fetch audio as base64
        const audioRes = await fetch(`/.netlify/functions/getAudioBlob?id=${row.id}`);
        const audioBlob = await audioRes.blob();
        const audioObjectUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioObjectUrl);
    } catch (error) {
        console.error('Error loading conversation:', error);
        setTranscript('Failed to load conversation details.');
    }

    setLoading(false);
    };


  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
    setAudioUrl(null);
    setTranscript(null);
  };

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
                {rows.map((row) => (
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
          count={count}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>

     <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Conversation Details</DialogTitle>
        <DialogContent dividers>
            {loading ? (
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
