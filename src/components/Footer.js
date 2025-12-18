import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useStore } from '../contexts/StoreContext';
import { useCategories } from '../contexts/CategoriesContext';
import newsletterService from '../services/newsletterService';
import ScrollLink from './ScrollLink';

/**
 * Footer component with newsletter subscription and site navigation
 */
const Footer = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { storeSettings } = useStore();
  const { categories } = useCategories(); // Get categories from context
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Show only first 5 categories
  const displayCategories = categories.slice(0, 5);

  /**
   * Handle newsletter subscription
   */
  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      enqueueSnackbar('Please enter a valid email address', { variant: 'warning' });
      return;
    }

    try {
      setLoading(true);
      await newsletterService.subscribe(email);
      enqueueSnackbar('Successfully subscribed to newsletter!', { variant: 'success' });
      setEmail('');
    } catch (error) {
      enqueueSnackbar('Failed to subscribe. Please try again.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Social media links from store settings
   */
  const socialMedia = Array.isArray(storeSettings) ? [] : [
    { icon: <FacebookIcon />, name: 'Facebook', url: storeSettings?.facebook_url },
    { icon: <InstagramIcon />, name: 'Instagram', url: storeSettings?.instagram_url },
    { icon: <TwitterIcon />, name: 'Twitter', url: storeSettings?.twitter_url },
    { icon: <LinkedInIcon />, name: 'LinkedIn', url: storeSettings?.linkedin_url },
  ].filter(social => social?.url);

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.100',
        mt: 8,
        pt: 6,
        pb: 3,
      }}
    >
      <Container maxWidth="lg">
        {/* Newsletter Section */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 6,
            bgcolor: 'white',
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Únete a la comunidad{' '}
            <Typography component="span" variant="h5" color="primary" sx={{ fontWeight: 600 }}>
              {storeSettings?.store_name || 'E-Commerce'}
            </Typography>
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Suscríbete para recibir noticias sobre nuevos productos, descuentos exclusivos y guías.
          </Typography>
          
          <Box
            component="form"
            onSubmit={handleSubscribe}
            sx={{
              display: 'flex',
              gap: 2,
              maxWidth: 500,
              mx: 'auto',
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <TextField
              fullWidth
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              size="small"
              sx={{
                bgcolor: 'grey.100',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { border: 'none' },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                px: 4,
                textTransform: 'uppercase',
                fontWeight: 600,
                bgcolor: 'primary',
                color: 'secondary',
                '&:hover': {
                  bgcolor: 'warning.dark',
                },
              }}
            >
              Suscribirse
            </Button>
          </Box>
        </Paper>

        {/* Footer Links */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Brand Column */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 700, color: 'primary' }}
            >
              {storeSettings?.store_name || 'E-Commerce'}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {storeSettings?.description || 'Tu destino premium para compras online'}
            </Typography>
            {storeSettings?.email && (
              <Typography variant="body2" color="text.secondary">
                {storeSettings.email}
              </Typography>
            )}
            {storeSettings?.phone && (
              <Typography variant="body2" color="text.secondary">
                {storeSettings.phone}
              </Typography>
            )}
          </Grid>

          {/* Navigation Column */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Navega
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <ScrollLink
                to="/products"
                variant="link"
                color="text.secondary"
                sx={{ textAlign: 'left' }}
              >
                Productos
              </ScrollLink>
              <ScrollLink
                to="/favorites"
                variant="link"
                color="text.secondary"
                sx={{ textAlign: 'left' }}
              >
                Favoritos
              </ScrollLink>
              <ScrollLink
                to="/privacy-policy"
                variant="link"
                color="text.secondary"
                sx={{ textAlign: 'left' }}
              >
                Política de privacidad
              </ScrollLink>
              <ScrollLink
                to="/shipping-policy"
                variant="link"
                color="text.secondary"
                sx={{ textAlign: 'left' }}
              >
                Política de envío
              </ScrollLink>
            </Box>
          </Grid>

          {/* Categories Column */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Categorías
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Array.isArray(displayCategories) && displayCategories.length > 0 ? (
                displayCategories.map((category) => (
                  <ScrollLink
                    key={category.id}
                    to={`/products?category=${category.id}`}
                    variant="link"
                    color="text.secondary"
                    sx={{ textAlign: 'left' }}
                  >
                    {category.name}
                  </ScrollLink>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Cargando...
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Social Media Column */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Síguenos
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {socialMedia.length > 0 ? (
                socialMedia.map((social) => (
                  <IconButton
                    key={social.name}
                    component="a"
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'primary.main', color: 'white' },
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Próximamente
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Copyright */}
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} {storeSettings?.store_name || 'E-Commerce'}. Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
