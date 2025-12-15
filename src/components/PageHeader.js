import { Box, Typography, Button } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

/**
 * Reusable page header component
 * Provides consistent styling for page titles and descriptions
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} [props.description] - Page description/subtitle
 * @param {string} [props.backUrl] - URL to navigate back to (shows back button)
 * @param {React.ReactNode} [props.action] - Action button or element to display on the right
 */
const PageHeader = ({ title, description, backUrl, action }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {backUrl && (
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(backUrl)}
              variant="outlined"
              size="small"
            >
              Back
            </Button>
          )}
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: description ? 1 : 0 }}>
              {title}
            </Typography>
            {description && (
              <Typography variant="body1" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>
        </Box>
        {action && <Box>{action}</Box>}
      </Box>
    </Box>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  backUrl: PropTypes.string,
  action: PropTypes.node,
};

export default PageHeader;
