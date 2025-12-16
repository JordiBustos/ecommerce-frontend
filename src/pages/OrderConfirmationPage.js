import { useState, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Receipt as ReceiptIcon,
  CloudUpload as UploadIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useStore } from "../contexts/StoreContext";
import orderService from "../services/orderService";
import { BankingInformation } from "../components";

/**
 * Order confirmation page with payment instructions
 */
const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;
  const { enqueueSnackbar } = useSnackbar();
  const { storeSettings } = useStore();
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);

  // If no order data, redirect to home
  if (!order) {
    setTimeout(() => navigate("/"), 100);
    return null;
  }

  /**
   * Handle file selection and upload
   */
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      enqueueSnackbar(
        "Please upload an image (JPEG, JPG, PNG, WebP) or PDF file",
        {
          variant: "error",
        }
      );
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      enqueueSnackbar("File size must be less than 10MB", { variant: "error" });
      return;
    }

    try {
      setUploading(true);
      await orderService.uploadReceipt(order.id, file);
      enqueueSnackbar("Receipt uploaded successfully!", { variant: "success" });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      enqueueSnackbar("Failed to upload receipt. Please try again.", {
        variant: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  /**
   * Open file picker
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Card elevation={3}>
        <CardContent sx={{ textAlign: "center", py: 6, px: 4 }}>
          {/* Icon */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 120,
              height: 120,
              borderRadius: "50%",
              bgcolor: "primary.light",
              mb: 3,
            }}
          >
            <ReceiptIcon sx={{ fontSize: 60, color: "primary.main" }} />
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            gutterBottom
            color="primary.main"
            fontWeight="bold"
          >
            Payment Instructions
          </Typography>

          {/* Thank you message */}
          <Typography
            variant="h6"
            color="text.secondary"
            gutterBottom
            sx={{ mb: 4 }}
          >
            Thank you very much for your purchase!
          </Typography>

          {/* Payment instructions */}
          <Box sx={{ mb: 4, textAlign: "left", maxWidth: 600, mx: "auto" }}>
            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              To continue with the payment, you can make a bank transfer:
            </Typography>

            <BankingInformation storeSettings={storeSettings} showInstructions />
          </Box>

          {/* Order reference */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Order ID: <strong>#{order.id}</strong>
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              maxWidth: 400,
              mx: "auto",
            }}
          >
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />

            <Button
              variant="outlined"
              size="large"
              startIcon={
                uploading ? <CircularProgress size={20} /> : <UploadIcon />
              }
              onClick={handleUploadClick}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload Receipt"}
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/")}
              sx={{
                color: "#fff",
                bgcolor: storeSettings?.accent_color,
                "&:hover": {
                  bgcolor: storeSettings?.accent_color,
                },
              }}
            >
              BACK TO HOME
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default OrderConfirmationPage;
