import {
  Container,
  Typography,
  Chip,
} from '@mui/material';
import { ShoppingCartOutlined } from '@mui/icons-material';
import useDataFetching from '../../hooks/useDataFetching';
import { DataTable, PageHeader } from '../../components';
import apiClient from '../../services/api';

/**
 * Admin page to view all user carts
 */
const AdminCartsPage = () => {
  const { data: carts, loading, error } = useDataFetching(
    async () => {
      const response = await apiClient.get('/cart/all/admin');
      return response.data;
    },
    []
  );

  const columns = [
    {
      field: 'id',
      header: 'Cart ID',
      render: (row) => `#${row.id}`,
    },
    {
      field: 'user_id',
      header: 'User ID',
      render: (row) => row.user_id || 'N/A',
    },
    {
      field: 'user_email',
      header: 'User Email',
      render: (row) => row.user?.email || row.user_email || 'N/A',
    },
    {
      field: 'items_count',
      header: 'Items',
      render: (row) => (
        <Chip
          label={`${row.items?.length || 0} items`}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: 'total',
      header: 'Total',
      render: (row) => {
        const total = row.items?.reduce(
          (sum, item) => sum + (item.product?.price || 0) * item.quantity,
          0
        ) || 0;
        return `$${total.toFixed(2)}`;
      },
    },
    {
      field: 'created_at',
      header: 'Created',
      render: (row) => 
        row.created_at 
          ? new Date(row.created_at).toLocaleDateString()
          : 'N/A',
    },
    {
      field: 'updated_at',
      header: 'Last Updated',
      render: (row) => 
        row.updated_at 
          ? new Date(row.updated_at).toLocaleDateString()
          : 'N/A',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="All Carts"
        description="View and manage all user shopping carts"
      />

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error loading carts: {error}
        </Typography>
      )}

      <DataTable
        columns={columns}
        data={carts || []}
        loading={loading}
        emptyState={{
          icon: ShoppingCartOutlined,
          iconColor: 'primary.main',
          title: 'No Carts Found',
          description: 'There are no shopping carts in the system yet.',
        }}
      />
    </Container>
  );
};

export default AdminCartsPage;
