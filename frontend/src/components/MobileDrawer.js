"use client";
import React from "react";
import {
  Drawer,
  Box,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Radio_Canada } from "next/font/google";
import { usePathname } from "next/navigation";
import logo from "../assets/images/logo.png";
 
 
import Link from "next/link";

 

const Radio_Canada_font = Radio_Canada({
  variable: "--font-Radio_Canada-sans",
  subsets: ["latin"],
  weight: "400",
});
const MobileDrawer  = ({ open, onClose, onOpen }) => {
    const pathname = usePathname();
  return (
    <>
      <Box
        sx={{ display: { md: "none" } }}
        onClick={onOpen}
      >
        <MenuIcon />
      </Box>
      <Drawer anchor="left" open={open} onClose={onClose} sx={{
        "& .MuiPaper-root":{
            width:"70%",
            background:"#000102"
        }
      }}>
   
          
 
    
      <Box
          sx={{
            // position: "fixed",
            background:
              "linear-gradient(90deg, rgba(87,144,174,0.25) 0%, rgba(36,92,133,0.25) 100%)",
            backdropFilter: "blur(15px)",
            left: "10px",
            width: "100%",
            height: "100%",
            py: "2rem",
            // px: "1rem",
            transition: "width 0.3s ease",
          }}
 
        >
           <Box sx={{
            position:"absolute",
            top:"10px",
            right:"10px"
           }}>
           <CloseIcon onClick={onClose} sx={{
            color:"rgba(76, 191, 254, 1)"
           }}/>
           </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              justifyContent: "center",
              alignItems: "center",
              color:"#fff",
              "& .active": {
                background: "rgba(0, 0, 0, 0.2)",
                border: "1px solid rgba(76, 191, 254, 0.4)",
                borderRadius: "5px",
                width: "100%",
                display: "flex",
                p: "5px",
                alignItems: "center",
                // pr: hovered ? "15px" : "",
                fontFamily: Radio_Canada_font.style.fontFamily,
                fontSize: "14px",
              },
              "& .initial": {
                width: "100%",
                display: "flex",
                alignItems: "center",
                // pr: hovered ? "15px" : "",
                fontFamily: Radio_Canada_font.style.fontFamily,
                fontSize: "15px",
                "&:hover": {
                  background: "#80808070",
                  border: "none",
                  borderRadius: "5px",
                },
              },
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "144px",
                height: "auto",
                display:"flex",
                justifyContent:"center"
              }}
            >
              {/* Render both logos and toggle visibility */}
            
              <Typography
                component={"img"}
                src={logo.src}
                // sx={{
                //   position: "absolute",
                //   top: 0,
                //   left: 0,
             
                //   transition: "opacity 0.3s ease",
                // }}
                width="144px"
              />
            </Box>

            <Box
              sx={{
                mt: "5rem",
                px:"2rem",
                width:"100%",
                flexDirection: "column",
                gap: "1rem",
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
                "& img": {
                  height: "54px",
                  width: "54px",
                },
              }}
            >
              <Box
                component={Link}
                href={"/"}
                className={pathname == "/" ? "active" : "initial"}
              > 
                {<span>Home</span>}
              </Box>
              
              <Box
                component={Link}
                href={"/create"}
                className={
                  pathname == "/create" ? "active" : "initial"
                }
              > 
                {<span>Launch</span>}
              </Box>
              <Box
                component={Link}
                href={"https://x.com/omaxchain"} 
                className="initial"
              > 
                {<span>Twitter</span>}
              </Box>
              <Box
                component={Link}
                href={"https://t.me/omaxfun"} 
                className="initial"
              > 
                {<span>Telegram</span>}
              </Box>
              <Box
                component={Link}
                href={"https://docs.omax.fun/"} 
                className="initial"
              > 
                {<span>Docs</span>}
              </Box>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default MobileDrawer;
