import "@/styles/globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "@/components/Header";
import Script from 'next/script';
import WalletContextProvider from "@/contexts/WalletContext";
import { Box, Container } from "@mui/material";
import CopyRight from "@/components/CopyRight";
import TopRanker from "@/components/TopRanker";


export default function App({ Component, pageProps }) {
  // return <Component {...pageProps} />;
  return (
    <Box
    sx={{
      "& .MuiContainer-root":{
        "@media (min-width:1260px)":{
          maxWidth:"1500px"
        },
      }
      
    }}>
      <WalletContextProvider>
        <Container>
          <div className="w-full min-h-screen flex flex-col overflow-hidden">
          <div>

            <Header />
            <TopRanker />
          </div>
            <div className="relative">
              <Component {...pageProps} />
            </div>
          </div>
          <CopyRight/>
        </Container>
      </WalletContextProvider>
      <ToastContainer
        autoClose={5000}
        hideProgressBar
        pauseOnHover={false}
        pauseOnFocusLoss={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
      />
    </Box>
  )
}
