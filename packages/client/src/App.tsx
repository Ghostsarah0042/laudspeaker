import { useMemo, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import {
  createTheme,
  CssBaseline,
  PaletteMode,
  ThemeProvider,
} from "@mui/material";
import { ColorContext } from "./ColorContext";
import { darkTheme } from "./themes/dark";
import { lightTheme } from "./themes/light";
import "./Global.css";
import tokenService from "./services/token.service";
import { useDispatch } from "react-redux";
import { getUserPermissions } from "./reducers/auth";
import posthog from "posthog-js";
import { AppConfig } from "./constants";

interface IApp {
  children: React.ReactNode;
}
const App = ({ children }: IApp) => {
  const [mode, setMode] = useState<PaletteMode>("light");
  const isLoggedIn = tokenService.isUserLoggedIn();
  const dispatch = useDispatch();
  if (isLoggedIn) {
    dispatch(getUserPermissions());
  }

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode: PaletteMode) =>
          prevMode === "light" ? "dark" : "light"
        );
      },
    }),
    []
  );

  const theme = useMemo(
    () => createTheme(mode === "light" ? lightTheme : darkTheme),
    [mode]
  );

  posthog.init(AppConfig.POSTHOG_KEY ? AppConfig.POSTHOG_KEY : "", {
    api_host: "https://app.posthog.com",
  });

  return (
    <ColorContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <GoogleOAuthProvider clientId="31818866399-n6jktkbmj0o0tt7gbi8i8nosu61nakda.apps.googleusercontent.com">
          {children}
        </GoogleOAuthProvider>
      </ThemeProvider>
    </ColorContext.Provider>
  );
};

export default App;