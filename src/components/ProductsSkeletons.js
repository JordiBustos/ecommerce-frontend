import { Paper, Skeleton, Stack, Box } from "@mui/material";

/**
 * Skeleton for the sidebar filters
 */
export const SidebarSkeleton = () => {
  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
      {/* Titles and separators */}
      <Skeleton variant="text" width="50%" height={32} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={1} sx={{ mb: 3 }} />
      <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
      
      {/* Categories */}
      <Stack spacing={1} sx={{ mb: 4 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
          <Skeleton key={index} variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
        ))}
      </Stack>

      {/* Brands */}
      <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
      <Stack spacing={1}>
        {[1, 2, 3, 4, 5].map((index) => (
          <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Skeleton variant="rectangular" width={20} height={20} />
            <Skeleton variant="text" width="70%" />
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

/**
 * Skeleton for a single product card
 */
export const CardSkeleton = () => {
  return (
    <Paper elevation={1} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
      {/* Heart Icon */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Skeleton variant="circular" width={34} height={34} />
      </Box>
      
      {/* Image */}
      <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1, mb: 2 }} />
      
      {/* Texts */}
      <Skeleton variant="text" height={32} width="80%" sx={{ mb: 1 }} />
      <Skeleton variant="text" height={20} width="60%" sx={{ mb: 2 }} />
      
      {/* Price and Buttons */}
      <Box sx={{ mt: 'auto' }}>
        <Skeleton variant="text" height={40} width="40%" sx={{ mb: 1 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1, width: '100%' }} />
        </Box>
      </Box>
    </Paper>
  );
};