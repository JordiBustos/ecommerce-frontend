import { Container, Typography, Box, Paper, Divider } from '@mui/material';

/**
 * Privacy Policy page
 */
const PrivacyPolicyPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
        Política de Privacidad
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Última actualización: {new Date().toLocaleDateString('es-ES')}
      </Typography>

      <Paper elevation={0} sx={{ p: 4, bgcolor: 'grey.50' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            1. Introducción
          </Typography>
          <Typography variant="body1" paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure 
            dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            2. Información que Recopilamos
          </Typography>
          <Typography variant="body1" paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi accumsan ipsum velit, sed malesuada arcu faucibus vel. 
            Praesent venenatis elit at leo auctor, eu tincidunt velit tincidunt:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
            <li>Nombre completo y datos de contacto</li>
            <li>Dirección de correo electrónico</li>
            <li>Número de teléfono</li>
            <li>Dirección de envío y facturación</li>
            <li>Información de pago (procesada de forma segura)</li>
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            3. Uso de la Información
          </Typography>
          <Typography variant="body1" paragraph>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, 
            eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam 
            voluptatem quia voluptas sit aspernatur aut odit aut fugit.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            4. Protección de Datos
          </Typography>
          <Typography variant="body1" paragraph>
            At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti 
            quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia 
            deserunt mollitia animi, id est laborum et dolorum fuga.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            5. Cookies y Tecnologías Similares
          </Typography>
          <Typography variant="body1" paragraph>
            Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque 
            nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            6. Compartir Información
          </Typography>
          <Typography variant="body1" paragraph>
            Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae 
            sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus 
            maiores alias consequatur aut perferendis doloribus asperiores repellat.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            7. Derechos del Usuario
          </Typography>
          <Typography variant="body1" paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
            <li>Derecho de acceso a sus datos personales</li>
            <li>Derecho de rectificación de datos incorrectos</li>
            <li>Derecho de supresión de sus datos</li>
            <li>Derecho de limitación del tratamiento</li>
            <li>Derecho de portabilidad de datos</li>
            <li>Derecho de oposición al tratamiento</li>
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            8. Contacto
          </Typography>
          <Typography variant="body1" paragraph>
            Si tiene preguntas sobre esta Política de Privacidad, puede contactarnos a través de:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
            <li>Email: privacy@ejemplo.com</li>
            <li>Teléfono: +34 900 000 000</li>
            <li>Dirección: Calle Ejemplo 123, Madrid, España</li>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicyPage;
