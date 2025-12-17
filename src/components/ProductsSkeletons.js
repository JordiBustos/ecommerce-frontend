import { Container, Grid, Box, Skeleton, Stack, Paper, Divider, Typography } from "@mui/material";

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

export const ProductDetailSkeleton = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 1. Back Button Skeleton */}
      <Skeleton variant="rectangular" width={180} height={36} sx={{ mb: 3, borderRadius: 1 }} />

      {/* 2. Breadcrumbs Skeleton */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, alignItems: 'center' }}>
        <Skeleton variant="text" width={60} />
        <Typography variant="body1" color="text.secondary">/</Typography>
        <Skeleton variant="text" width={80} />
        <Typography variant="body1" color="text.secondary">/</Typography>
        <Skeleton variant="text" width={150} />
      </Box>

      <Grid container spacing={4}>
        {/* === COLUMNA IZQUIERDA (IMAGEN) === */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              borderRadius: 3,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Skeleton
              variant="rectangular"
              width={100}
              height={32}
              sx={{ position: "absolute", top: 24, left: 24, borderRadius: 4, zIndex: 1 }}
            />

            <Skeleton
              variant="circular"
              width={40}
              height={40}
              sx={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}
            />

            <Skeleton
              variant="rectangular"
              width="100%"
              height={400}
              sx={{ borderRadius: 2, mt: 8 }}
            />
          </Paper>
        </Grid>

        {/* === COLUMNA DERECHA (DETALLES) === */}
        <Grid item xs={12} md={6}>
          <Box>
            {/* Título del Producto */}
            <Skeleton variant="text" height={60} width="90%" sx={{ mb: 1 }} />

            {/* Marca (Icono + Texto) */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
              <Skeleton variant="text" width={120} />
            </Box>

            {/* Precio */}
            <Skeleton variant="text" height={50} width={150} sx={{ mb: 3 }} />

            <Divider sx={{ mb: 3 }} />

            {/* Descripción (Simulación de párrafo) */}
            <Stack spacing={1} sx={{ mb: 3 }}>
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" width="80%" />
            </Stack>

            {/* Selector de Cantidad + Botones */}
            <Box sx={{ mb: 3 }}>
              <Skeleton variant="text" width={80} sx={{ mb: 1 }} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                {/* Input cantidad */}
                <Skeleton variant="rectangular" width={140} height={44} sx={{ borderRadius: 1 }} />
                {/* Botón Add to cart */}
                <Skeleton variant="rectangular" width="100%" height={44} sx={{ borderRadius: 1 }} />
              </Box>
            </Box>

            {/* Alerta de Envío */}
            <Skeleton variant="rectangular" width="100%" height={50} sx={{ borderRadius: 2, mb: 3 }} />

            {/* Especificaciones */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 3 }}>
              <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Grid item xs={12} key={i}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Skeleton variant="circular" width={20} height={20} />
                      <Skeleton variant="text" width="60%" />
                    </Box>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Skeleton variant="text" width="70%" />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};