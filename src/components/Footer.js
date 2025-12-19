import { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
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
        bgcolor: 'black',
        color: 'white',
        mt: 8,
        pt: 8,
        pb: 4,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={8}>
            {/* Newsletter Section - Integrated */}
            <Grid item xs={12} md={4}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 900, textTransform: 'uppercase', mb: 2 }}>
                    Join our Newsletter
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: '#999' }}>
                    Sign up for updates on new drops and special offers.
                </Typography>
                <Box
                    component="form"
                    onSubmit={handleSubscribe}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                    <TextField
                        fullWidth
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        variant="standard"
                        InputProps={{
                            disableUnderline: true,
                            sx: { 
                                color: 'white', 
                                borderBottom: '1px solid #555',
                                pb: 1,
                                fontSize: '1.1rem',
                                '&:hover': { borderBottom: '1px solid white' },
                                '&:focus-within': { borderBottom: '1px solid white' }
                            }
                        }}
                        sx={{
                            '& input::placeholder': { color: '#666', fontWeight: 700, textTransform: 'uppercase' }
                        }}
                    />
                    <Button
                        type="submit"
                        disabled={loading}
                        sx={{
                            alignSelf: 'flex-start',
                            color: 'white',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            p: 0,
                            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                        }}
                        endIcon={<span>→</span>}
                    >
                        Sign Up
                    </Button>
                </Box>
            </Grid>

          {/* Navigation Column */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 900, textTransform: 'uppercase', mb: 2 }}>
              Products
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <ScrollLink to="/products" variant="body2" color="#999" sx={{ textAlign: 'left', '&:hover': { color: 'white' } }}>
                All Products
              </ScrollLink>
              {displayCategories.map((category) => (
                <ScrollLink to={`/products?category=${category.id}`} key={category.id} variant="body2" color="#999" sx={{ textAlign: 'left', '&:hover': { color: 'white' } }}>
                  {category.name}
                </ScrollLink>
              ))}
            </Box>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 900, textTransform: 'uppercase', mb: 2 }}>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <ScrollLink to="/help" variant="body2" color="#999" sx={{ textAlign: 'left', '&:hover': { color: 'white' } }}>
                Help
              </ScrollLink>
              <ScrollLink to="/shipping-policy" variant="body2" color="#999" sx={{ textAlign: 'left', '&:hover': { color: 'white' } }}>
                Shipping
              </ScrollLink>
              <ScrollLink to="/returns" variant="body2" color="#999" sx={{ textAlign: 'left', '&:hover': { color: 'white' } }}>
                Returns
              </ScrollLink>
            </Box>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 900, textTransform: 'uppercase', mb: 2 }}>
              Company
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <ScrollLink to="/about" variant="body2" color="#999" sx={{ textAlign: 'left', '&:hover': { color: 'white' } }}>
                About Us
              </ScrollLink>
              <ScrollLink to="/careers" variant="body2" color="#999" sx={{ textAlign: 'left', '&:hover': { color: 'white' } }}>
                Careers
              </ScrollLink>
              <ScrollLink to="/privacy-policy" variant="body2" color="#999" sx={{ textAlign: 'left', '&:hover': { color: 'white' } }}>
                Privacy Policy
              </ScrollLink>
            </Box>
          </Grid>

          <Grid item xs={6} md={2}>
             <Typography variant="h6" gutterBottom sx={{ fontWeight: 900, textTransform: 'uppercase', mb: 2 }}>
              Follow Us
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
                {socialMedia.map((social, index) => (
                    <IconButton 
                        key={index} 
                        href={social.url} 
                        target="_blank" 
                        sx={{ color: 'white', p: 0, '&:hover': { color: '#999' } }}
                    >
                        {social.icon}
                    </IconButton>
                ))}
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 8, pt: 4, borderTop: '1px solid #333', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" color="#666">
                © {new Date().getFullYear()} {storeSettings?.store_name || 'E-Commerce'}. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
                <Typography variant="caption" color="#666" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>Privacy Settings</Typography>
                <Typography variant="caption" color="#666" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>Terms and Conditions</Typography>
            </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
