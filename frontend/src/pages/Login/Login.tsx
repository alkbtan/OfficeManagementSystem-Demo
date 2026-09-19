import { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { authService } from "../../api/auth";

import Logo from "../../assets/images/testfly-logo.webp";

function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login({ username, password });

      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        navigate("/dashboard");
      } else {
        setError(t("login.invalidResponse"));
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const message =
        err?.response?.data?.message || t("login.invalidCredentials");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a0e27 0%, #1a1a4e 40%, #1a237e 70%, #0d47a1 100%)",
        p: 0,
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        "& *": {
          fontFamily: '"Plus Jakarta Sans", sans-serif !important',
        }
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(123, 31, 162, 0.1) 0%, transparent 70%)",
          animation: "pulse 8s ease-in-out infinite",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -50,
          left: -50,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(123, 31, 162, 0.06) 0%, transparent 70%)",
          animation: "pulse 10s ease-in-out infinite reverse",
        }}
      />

      <Container maxWidth="sm" sx={{ px: { xs: 0, sm: 0 } }}>
        <Paper
          elevation={24}
          sx={{
            p: { xs: 4, sm: 5 },
            borderRadius: 4,
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
            border: "1px solid rgba(123, 31, 162, 0.08)",
            position: "relative",
            overflow: "hidden",
            width: "100%",
            maxWidth: "520px",
            mx: "auto",
            minHeight: "75vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(123, 31, 162, 0.03) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <Box
              component="img"
              src={Logo}
              alt="TestFlyQA Mascot"
              sx={{
                width: 135,
                height: 135,
                objectFit: "contain",
                filter: "drop-shadow(0px 4px 16px rgba(123, 31, 162, 0.18))",
                flexShrink: 0,
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                ml: -1,
                mt: 0.5,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "#7b1fa2",
                  letterSpacing: "-0.8px",
                  fontSize: { xs: "1.3rem", sm: "1.5rem" },
                  lineHeight: 1.1,
                  textShadow: "0 0 30px rgba(123, 31, 162, 0.06)",
                  WebkitFontSmoothing: "antialiased",
                  MozOsxFontSmoothing: "grayscale",
                }}
              >
                TestFlyQA
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  letterSpacing: "0.2px",
                  fontSize: { xs: "0.65rem", sm: "0.7rem" },
                  opacity: 0.85,
                  mt: 0.4,
                  textTransform: "uppercase",
                }}
              >
                {t("app.subtitle")}
              </Typography>
            </Box>
          </Box>

          <Divider
            sx={{
              mb: 2.5,
              mt: 0.5,
              "&::before, &::after": {
                borderColor: "rgba(123, 31, 162, 0.12)",
                borderWidth: 1,
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#7b1fa2",
                px: 2,
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontSize: "0.6rem",
                opacity: 0.8,
              }}
            >
              {t("login.secureAccess")}
            </Typography>
          </Divider>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2.5,
                borderRadius: 2,
                border: "1px solid #f44336",
                fontWeight: 500,
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label={t("login.username")}
              type="text"
              fullWidth
              margin="dense"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="admin"
              variant="outlined"
              autoComplete="username"
              sx={{
                mb: 1.5,
                "& .MuiInputLabel-root": {
                  fontWeight: 600,
                  color: "#7b1fa2",
                  fontSize: "0.75rem",
                  letterSpacing: "0.3px",
                  "&.Mui-focused": {
                    color: "#7b1fa2",
                  },
                },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: "0.95rem",
                  "& fieldset": {
                    borderColor: "rgba(123, 31, 162, 0.15)",
                  },
                  "&:hover fieldset": {
                    borderColor: "#7b1fa2",
                    borderWidth: 2,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#7b1fa2",
                    borderWidth: 2,
                    boxShadow: "0 0 0 4px rgba(123, 31, 162, 0.06)",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: "#7b1fa2", fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label={t("login.password")}
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="dense"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              variant="outlined"
              autoComplete="current-password"
              sx={{
                mb: 2.5,
                "& .MuiInputLabel-root": {
                  fontWeight: 600,
                  color: "#7b1fa2",
                  fontSize: "0.75rem",
                  letterSpacing: "0.3px",
                  "&.Mui-focused": {
                    color: "#7b1fa2",
                  },
                },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: "0.95rem",
                  "& fieldset": {
                    borderColor: "rgba(123, 31, 162, 0.15)",
                  },
                  "&:hover fieldset": {
                    borderColor: "#7b1fa2",
                    borderWidth: 2,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#7b1fa2",
                    borderWidth: 2,
                    boxShadow: "0 0 0 4px rgba(123, 31, 162, 0.06)",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "#7b1fa2", fontSize: 18 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{
                        color: "rgba(123, 31, 162, 0.5)",
                        "&:hover": {
                          color: "#7b1fa2",
                        },
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 3,
                background: "linear-gradient(135deg, #6a1b9a, #7b1fa2, #9c27b0)",
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 700,
                letterSpacing: "0.5px",
                boxShadow: "0 4px 25px rgba(123, 31, 162, 0.35)",
                "&:hover": {
                  boxShadow: "0 8px 35px rgba(123, 31, 162, 0.5)",
                  transform: "translateY(-2px)",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
                transition: "all 0.3s ease",
              }}
            >
              {loading ? (
                <CircularProgress size={26} color="inherit" />
              ) : (
                t("login.signIn")
              )}
            </Button>
          </form>

          <Box
            sx={{
              mt: 3,
              textAlign: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "rgba(123, 31, 162, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
                fontWeight: 600,
                fontSize: "0.6rem",
                letterSpacing: "0.5px",
              }}
            >
              {t("login.copyright")}
            </Typography>
          </Box>
        </Paper>
      </Container>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

          @keyframes pulse {
            0%, 100% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.1) rotate(10deg); }
          }
        `}
      </style>
    </Box>
  );
}

export default Login;