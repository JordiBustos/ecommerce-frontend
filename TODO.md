# E-Commerce Frontend - TODO

## 🔴 Crítico / Alta Prioridad

### Admin Panel

- [ ] **Add Order (Admin)**: Permitir a admins crear órdenes manualmente para usuarios
- [ ] **Admin navigation**: Reemplazar botones de admin en navbar por una navegación dedicada/sidebar
- [ ] **Cart Admin View**: Corregir y mejorar la vista de administración de todos los carritos
- [ ] **Categorías en dropdown**: Corregir jerarquía
- [ ] **Agregar field delivery date a orden**: Permitir al admin setear delivery date en la orden del usuario.
- [ ] **Barra de navegación responsive**: Agregar favoritos, ordenes y mi cuenta en un dropdown para que entre la navbar en mobile.
- [ ] **Ocultar IDs donde sea posible reales** i.e order ids, product ids, ...
- [ ] **Monto mínimo de compra**: backend y frontend.

### User Experience

- [ ] **Skeletons & Loaders**: Implementar skeletons de carga en lugar de spinners genéricos
- [ ] **Error boundaries**: Agregar manejo de errores global con componentes boundary
- [ ] **Toast notifications**: Revisar y unificar todas las notificaciones (notistack)

## 🟡 Importante / Media Prioridad

### Catálogo y Productos

- [ ] **Filtro de categorías jerárquico**: Permitir drill-down por categorías con hijos (revisar funcionamiento)
- [ ] **Productos similares**: Vista de productos relacionados en cart
- [ ] **Filtro de categorías**: Cuando está seteado por URL no se puede filtrar.
- [ ] **Comparador de productos**: Permitir comparar múltiples productos lado a lado
- [ ] **Wishlist/Favorites mejorado**: Agregar notas o prioridades a favoritos
- [ ] **Recently viewed**: Historial de productos vistos recientemente

### CRUD Completo

- [ ] **Export CSV**: Exportar productos masivamente
- [ ] **Bulk operations**: Editar múltiples productos a la vez (precio, stock, status) (quizá se resuelve con 2.)
- [ ] **Product variants**: Soporte para variantes (talla, color, etc.)
- [ ] **Product images**: Soporte para varias imagenes

### Órdenes y Compras

- [ ] **Recibo en PDF**: Generar y descargar recibo de orden en PDF
- [ ] **Envío de recibo por email**: Enviar automáticamente recibo tras completar orden
- [ ] **Tracking de envío**: Integrar seguimiento de paquetería
- [ ] **Historial de cambios de orden**: Log de modificaciones en estado de órdenes
- [ ] **Cancelación de orden**: Permitir a usuarios cancelar órdenes pendientes

## 🟢 Mejoras / Baja Prioridad

### Backend & Frontend Integration

- [ ] **Lógica de promociones**: Sistema de cupones, descuentos y promociones
- [ ] **Lógica de envíos**: Cálculo de costos por zona/peso
- [ ] **Stock reservado**: Reservar stock temporalmente durante el checkout (opcional)
- [ ] **Notificaciones de bajo stock**: Alertas cuando productos están por agotarse
- [ ] **Notificaciones push**: Sistema de notificaciones web push

### Admin Dashboard

- [ ] **Dashboard con métricas**: Gráficos de ventas, productos más vendidos, ingresos
- [ ] **Reportes exportables**: Excel/PDF de ventas por período
- [ ] **Analytics integration**: Google Analytics o similar
- [ ] **Audit log**: Registro de todas las acciones de admin
- [ ] **User management**: CRUD de usuarios

### User Features

- [ ] **Formulario de arrepentimiento**: Según normativa de consumidor
- [ ] **Programa de puntos/rewards**: Sistema de fidelización (opcional)
- [ ] **Reviews y ratings**: Calificaciones y reseñas de productos (opcional)
- [ ] **Q&A de productos**: Preguntas y respuestas en productos
- [ ] **Social sharing**: Compartir productos en redes sociales

### UI/UX Enhancements

- [ ] **Menú con categorías anidadas**: Mega menú en navbar con categorías jerárquicas
- [ ] **Dark mode**: Tema oscuro completo
- [ ] **Responsive tables**: Mejorar tablas en móvil (cards colapsables)
- [ ] **Image zoom**: Zoom de imágenes de productos
- [ ] **Image gallery**: Múltiples imágenes por producto con carousel
- [ ] **Quick view**: Modal de vista rápida en cards de producto
- [ ] **Filtros avanzados**: Rangos de precio, múltiples atributos
- [ ] **Búsqueda con autocomplete**: Sugerencias mientras escribes

### Performance & SEO - Análogo al modulo metatags de drupal

- [ ] **Lazy loading**: Cargar imágenes y componentes bajo demanda
- [ ] **Code splitting**: Dividir bundle por rutas
- [ ] **Service Worker**: Cache y funcionalidad offline
- [ ] **Meta tags dinámicos**: SEO para cada página de producto
- [ ] **Sitemap generation**: Generar sitemap.xml automáticamente
- [ ] **Structured data**: Schema.org para productos

## 🔵 Avanzado / Futuro

### Integraciones

- [ ] **Pasarelas de pago**: MercadoPago, Stripe, PayPal (al menos MP)
- [ ] **Facturación electrónica**: Integración con AFIP (opcional)
- [ ] **CRM integration**: Sincronizar con sistemas CRM
- [ ] **ERP integration**: Conectar con sistemas de gestión empresarial
- [ ] **Chat support**: Chat en vivo con soporte (opcional)
- [ ] **WhatsApp integration**: Compra o consultas por WhatsApp

### Features Empresariales

- [ ] **Multi-tenant**: Soporte para múltiples tiendas (opcional)
- [ ] **Multi-currency**: Soporte para múltiples monedas (opcional)
- [ ] **Multi-language**: Internacionalización (i18n) (opcional)
- [ ] **B2B features**: Portal para clientes mayoristas
- [ ] **Subscription products**: Productos con suscripción recurrente
- [ ] **Gift cards**: Sistema de tarjetas de regalo (opcional)

### FINAL: Testing & Quality

- [ ] **Unit tests**: Tests unitarios con Jest
- [ ] **Integration tests**: Tests de integración
- [ ] **E2E tests**: Tests end-to-end con Cypress/Playwright
- [ ] **Accessibility audit**: WCAG compliance
- [ ] **Performance audit**: Lighthouse scoring > 90
- [ ] **Security audit**: Penetration testing

## 🐛 Bugs & Fixes Conocidos

- [ ] **ProductsPage**: Revisar filtrado de categorías
- [ ] **Sorting en tablas paginadas**: El sorting actual solo ordena la página visible, no todas

## 📝 Notas de Implementación

### Consideraciones Técnicas

- Mantener patrón de arquitectura actual (Context + Services + Components)
- Seguir guías de seguridad establecidas (sanitización, token encryption)
- Documentar con JSDoc todos los nuevos componentes
- Agregar PropTypes a todos los componentes
- Mantener consistencia con Material-UI sx prop

---

**Última actualización**: 16 de diciembre de 2025
