import { Box, Typography, Alert } from "@mui/material";
import PropTypes from "prop-types";

/**
 * Banking information component to display bank account details for transfers
 * @param {Object} props - Component props
 * @param {Object} props.storeSettings - Store settings containing bank information
 * @param {boolean} [props.showInstructions=false] - Whether to show payment instructions and important notice
 * @param {boolean} [props.compact=false] - Compact view with less spacing
 */
const BankingInformation = ({ storeSettings, showInstructions = false, compact = false }) => {
  if (!storeSettings) return null;

  const hasBankInfo =
    storeSettings.bank_name ||
    storeSettings.cvu ||
    storeSettings.cbu ||
    storeSettings.alias ||
    storeSettings.account_number;

  if (!hasBankInfo) return null;

  return (
    <Box>
      {/* Bank Account Details */}
      <Box
        sx={{
          bgcolor: "grey.50",
          p: compact ? 2 : 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "grey.200",
        }}
      >
        {storeSettings.bank_name && (
          <Box sx={{ mb: compact ? 1 : 1.5 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Bank
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {storeSettings.bank_name}
            </Typography>
          </Box>
        )}

        {storeSettings.account_type && (
          <Box sx={{ mb: compact ? 1 : 1.5 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Account Type
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {storeSettings.account_type}
            </Typography>
          </Box>
        )}

        {storeSettings.cvu && (
          <Box sx={{ mb: compact ? 1 : 1.5 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              CVU
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                fontSize: compact ? "1em" : "1.1em",
                color: storeSettings.primary_color || "primary.main",
                fontFamily: "monospace",
              }}
            >
              {storeSettings.cvu}
            </Typography>
          </Box>
        )}

        {storeSettings.cbu && (
          <Box sx={{ mb: compact ? 1 : 1.5 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              CBU
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                fontSize: compact ? "1em" : "1.1em",
                color: storeSettings.primary_color || "primary.main",
                fontFamily: "monospace",
              }}
            >
              {storeSettings.cbu}
            </Typography>
          </Box>
        )}

        {storeSettings.alias && (
          <Box sx={{ mb: compact ? 1 : 1.5 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Alias
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                fontSize: compact ? "1em" : "1.1em",
                color: storeSettings.primary_color || "primary.main",
              }}
            >
              {storeSettings.alias}
            </Typography>
          </Box>
        )}

        {storeSettings.account_number && (
          <Box sx={{ mb: 0 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Account Number
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {storeSettings.account_number}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Additional Instructions */}
      {showInstructions && (
        <>
          {storeSettings.payment_instructions && (
            <Typography
              variant="body2"
              color="text.secondary"
              paragraph
              sx={{ mt: 2 }}
            >
              {storeSettings.payment_instructions}
            </Typography>
          )}

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Important:</strong> When making the transfer, you must share
              the receipt{" "}
              {storeSettings.phone ? (
                <>
                  to our WhatsApp:{" "}
                  <a
                    href={`https://wa.me/${storeSettings.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "underline" }}
                  >
                    {storeSettings.phone}
                  </a>
                </>
              ) : storeSettings.email ? (
                <>
                  via email:{" "}
                  <a
                    href={`mailto:${storeSettings.email}`}
                    style={{ textDecoration: "underline" }}
                  >
                    {storeSettings.email}
                  </a>
                </>
              ) : (
                "to us"
              )}{" "}
              or upload it here for verification.
            </Typography>
          </Alert>
        </>
      )}
    </Box>
  );
};

BankingInformation.propTypes = {
  storeSettings: PropTypes.shape({
    bank_name: PropTypes.string,
    account_type: PropTypes.string,
    cvu: PropTypes.string,
    cbu: PropTypes.string,
    alias: PropTypes.string,
    account_number: PropTypes.string,
    primary_color: PropTypes.string,
    payment_instructions: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
  }),
  showInstructions: PropTypes.bool,
  compact: PropTypes.bool,
};

export default BankingInformation;
