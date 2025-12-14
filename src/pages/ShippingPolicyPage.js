import React from 'react';
import { Container, Typography, Box, Paper, Divider, Chip } from '@mui/material';
import { LocalShipping as ShippingIcon } from '@mui/icons-material';

/**
 * Shipping Policy page
 */
const ShippingPolicyPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <ShippingIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          Política de Envío
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Última actualización: {new Date().toLocaleDateString('es-ES')}
      </Typography>

      <Paper elevation={0} sx={{ p: 4, bgcolor: 'grey.50' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            1. Áreas de Envío
          </Typography>
          <Typography variant="body1" paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Realizamos envíos a toda la península ibérica, 
            islas Baleares y Canarias. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            <Chip label="Península" color="primary" />
            <Chip label="Islas Baleares" color="primary" />
            <Chip label="Islas Canarias" color="primary" />
            <Chip label="Portugal" color="primary" />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            2. Tiempo de Procesamiento
          </Typography>
          <Typography variant="body1" paragraph>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
            Los pedidos se procesan en un plazo de 24-48 horas laborables. Duis aute irure dolor in reprehenderit in 
            voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            3. Métodos de Envío y Tarifas
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 2 }}>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. 
            Ofrecemos diferentes opciones de envío:
          </Typography>
          
          <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Envío Estándar (3-5 días laborables)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Península: 4.95€ (Gratis en pedidos superiores a 50€)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Islas Baleares: 7.95€
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Islas Canarias: 12.95€
            </Typography>
          </Box>

          <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Envío Express (24-48 horas)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Península: 9.95€
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • No disponible para islas
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            4. Seguimiento del Pedido
          </Typography>
          <Typography variant="body1" paragraph>
            At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum. 
            Una vez que tu pedido sea enviado, recibirás un correo electrónico con el número de seguimiento y 
            un enlace para rastrear tu paquete en tiempo real.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            5. Retrasos en la Entrega
          </Typography>
          <Typography variant="body1" paragraph>
            Et harum quidem rerum facilis est et expedita distinctio. En caso de retrasos debido a circunstancias 
            excepcionales (condiciones meteorológicas adversas, huelgas, etc.), te informaremos inmediatamente por 
            correo electrónico o teléfono.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            6. Recepción del Pedido
          </Typography>
          <Typography variant="body1" paragraph>
            Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet. 
            Es importante que alguien esté presente en la dirección de entrega para recibir el paquete:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
            <li>Verifica el estado del paquete antes de firmar</li>
            <li>Reporta cualquier daño visible inmediatamente</li>
            <li>Si no estás disponible, el transportista dejará un aviso</li>
            <li>Tienes 7 días para recoger el paquete en la oficina de correos</li>
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            7. Contacto
          </Typography>
          <Typography variant="body1" paragraph>
            Para cualquier consulta sobre tu envío, puedes contactarnos:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
            <li>Email: envios@ejemplo.com</li>
            <li>Teléfono: +34 900 123 456</li>
            <li>Horario: Lunes a Viernes, 9:00 - 18:00</li>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ShippingPolicyPage;
