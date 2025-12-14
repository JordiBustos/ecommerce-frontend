import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import PropTypes from 'prop-types';
import EmptyState from './EmptyState';
import { InboxOutlined } from '@mui/icons-material';

/**
 * Reusable DataTable component
 * Implements the Template Method pattern for consistent table rendering
 * 
 * @param {Array} columns - Column definitions [{ field, header, render }]
 * @param {Array} data - Table data
 * @param {boolean} loading - Loading state
 * @param {Object} emptyState - Empty state configuration
 * @param {Function} onRowClick - Optional row click handler
 * @param {Object} sx - Additional styles
 */
const DataTable = ({
  columns,
  data = [],
  loading = false,
  emptyState = {},
  onRowClick,
  sx = {},
}) => {
  // Show loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
          ...sx,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show empty state
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={emptyState.icon || InboxOutlined}
        iconColor={emptyState.iconColor || 'grey.500'}
        iconBgColor={emptyState.iconBgColor || 'grey.100'}
        title={emptyState.title || 'No Data Available'}
        description={emptyState.description || 'There are no items to display.'}
        actionLabel={emptyState.actionLabel}
        onAction={emptyState.onAction}
      />
    );
  }

  return (
    <TableContainer component={Paper} sx={sx}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <TableCell
                key={column.field || index}
                align={column.align || 'left'}
                sx={{
                  fontWeight: 600,
                  bgcolor: 'grey.50',
                  ...column.headerSx,
                }}
              >
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={row.id || rowIndex}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              sx={{
                cursor: onRowClick ? 'pointer' : 'default',
                '&:hover': onRowClick
                  ? {
                      bgcolor: 'action.hover',
                    }
                  : {},
                '&:last-child td, &:last-child th': { border: 0 },
              }}
            >
              {columns.map((column, colIndex) => (
                <TableCell
                  key={column.field || colIndex}
                  align={column.align || 'left'}
                  sx={column.cellSx}
                >
                  {column.render
                    ? column.render(row[column.field], row, rowIndex)
                    : row[column.field]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string,
      header: PropTypes.string.isRequired,
      render: PropTypes.func,
      align: PropTypes.oneOf(['left', 'center', 'right']),
      headerSx: PropTypes.object,
      cellSx: PropTypes.object,
    })
  ).isRequired,
  data: PropTypes.array,
  loading: PropTypes.bool,
  emptyState: PropTypes.shape({
    icon: PropTypes.elementType,
    iconColor: PropTypes.string,
    iconBgColor: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    actionLabel: PropTypes.string,
    onAction: PropTypes.func,
  }),
  onRowClick: PropTypes.func,
  sx: PropTypes.object,
};

export default DataTable;
