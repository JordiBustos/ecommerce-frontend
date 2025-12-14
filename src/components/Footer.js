import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Link,
  Paper,
  Divider,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useStore } from '../contexts/StoreContext';
import productService from '../services/productService';
import newsletterService from '../services/newsletterService';

/**
 * Footer component with newsletter subscription and site navigation
 */
const Footer = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { storeSettings } = useStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  /**
   * Load categories
   */
  const loadCategories = async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data.slice(0, 5)); // Show only first 5
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

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
  const socialMedia = [
    { icon: <FacebookIcon />, name: 'Facebook', url: storeSettings?.facebook_url },
    { icon: <InstagramIcon />, name: 'Instagram', url: storeSettings?.instagram_url },
    { icon: <TwitterIcon />, name: 'Twitter', url: storeSettings?.twitter_url },
    { icon: <LinkedInIcon />, name: 'LinkedIn', url: storeSettings?.linkedin_url },
  ].filter(social => social.url);

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
              <Link
                component="button"
                variant="body2"
                color="text.secondary"
                onClick={() => {
                  navigate('/products');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                sx={{ textAlign: 'left', textDecoration: 'none' }}
              >
                Productos
              </Link>
              <Link
                component="button"
                variant="body2"
                color="text.secondary"
                onClick={() => {
                  navigate('/favorites');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                sx={{ textAlign: 'left', textDecoration: 'none' }}
              >
                Favoritos
              </Link>
              <Link
                component="button"
                variant="body2"
                color="text.secondary"
                onClick={() => {
                  navigate('/privacy-policy');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                sx={{ textAlign: 'left', textDecoration: 'none' }}
              >
                Política de privacidad
              </Link>
              <Link
                component="button"
                variant="body2"
                color="text.secondary"
                onClick={() => {
                  navigate('/shipping-policy');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                sx={{ textAlign: 'left', textDecoration: 'none' }}
              >
                Política de envío
              </Link>
            </Box>
          </Grid>

          {/* Categories Column */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Categorías
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  component="button"
                  variant="body2"
                  color="text.secondary"
                  onClick={() => {
                    navigate(`/products?category=${category.id}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  sx={{ textAlign: 'left', textDecoration: 'none' }}
                >
                  {category.name}
                </Link>
              ))}
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
