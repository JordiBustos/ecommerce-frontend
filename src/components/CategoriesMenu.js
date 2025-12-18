import { useState } from 'react';
import {
  Button,
  Menu,
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Fade,
  Skeleton,
} from '@mui/material';
import {
  Category as CategoryIcon,
  KeyboardArrowDown as ArrowDownIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../contexts/CategoriesContext';

/**
 * Mega-menu component for displaying categories in navbar
 */
const CategoriesMenu = () => {
  const navigate = useNavigate();
  const { categoriesTree, loading } = useCategories();
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setHoveredCategory(null);
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
    handleClose();
  };

  const handleMouseEnter = (category) => {
    setHoveredCategory(category);
  };

  if (loading) {
    return (
      <Button
        color="inherit"
        startIcon={<CategoryIcon />}
        endIcon={<ArrowDownIcon />}
        disabled
      >
        <Skeleton width={80} />
      </Button>
    );
  }

  return (
    <>
      <Button
        color="inherit"
        startIcon={<CategoryIcon />}
        endIcon={<ArrowDownIcon />}
        onClick={handleClick}
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1.5,
            minWidth: 700,
            maxWidth: 900,
            overflow: 'visible',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              left: 20,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        <Box sx={{ display: 'flex', minHeight: 400, maxHeight: 500 }}>
          {/* Left side - Parent categories */}
          <Box
            sx={{
              width: 250,
              borderRight: 1,
              borderColor: 'divider',
              overflowY: 'auto',
            }}
          >
            <List component="nav" dense>
              {categoriesTree.map((category) => (
                <ListItemButton
                  key={category.id}
                  selected={hoveredCategory?.id === category.id}
                  onMouseEnter={() => handleMouseEnter(category)}
                  onClick={() => handleCategoryClick(category.id)}
                  sx={{
                    py: 1.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary={category.name}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      fontSize: '0.95rem',
                    }}
                  />
                  {category.children && category.children.length > 0 && (
                    <ChevronRightIcon fontSize="small" />
                  )}
                </ListItemButton>
              ))}
            </List>
          </Box>

          {/* Right side - Subcategories */}
          <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
            {hoveredCategory ? (
              <>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    color: 'primary.main',
                    fontWeight: 600,
                  }}
                >
                  {hoveredCategory.name}
                </Typography>

                {hoveredCategory.children && hoveredCategory.children.length > 0 ? (
                  <Grid container spacing={2}>
                    {hoveredCategory.children.map((subcategory) => (
                      <Grid item xs={6} sm={4} key={subcategory.id}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: 1,
                            borderColor: 'divider',
                            '&:hover': {
                              bgcolor: 'action.hover',
                              borderColor: 'primary.main',
                              transform: 'translateY(-2px)',
                              boxShadow: 2,
                            },
                          }}
                          onClick={() => handleCategoryClick(subcategory.id)}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color: 'text.primary',
                              mb: 0.5,
                            }}
                          >
                            {subcategory.name}
                          </Typography>
                          {subcategory.description && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {subcategory.description}
                            </Typography>
                          )}
                          {subcategory.children && subcategory.children.length > 0 && (
                            <Typography
                              variant="caption"
                              color="primary"
                              sx={{ display: 'block', mt: 0.5 }}
                            >
                              {subcategory.children.length} subcategories
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 200,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No subcategories available
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Hover over a category to see subcategories
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Menu>
    </>
  );
};

CategoriesMenu.propTypes = {};

export default CategoriesMenu;
