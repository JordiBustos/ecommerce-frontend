import { Box, Typography } from "@mui/material";

/**
 * Product detail table row for displaying product weight
 * @param {object} props
 * @param {string} props.label - Label for the row
 * @param {string} props.value - Value for the row
 */
const ProductDetailTableRow = ({ label, value }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        py: 1,
        borderBottom: "1px solid #eee",
      }}
    >
      <Typography
        variant="body2"
        sx={{ fontWeight: 700, textTransform: "uppercase" }}
      >
        {label}
      </Typography>
      <Typography variant="body2">{value || "N/A"}</Typography>
    </Box>
  );
};

export default ProductDetailTableRow;