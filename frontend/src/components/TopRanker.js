import { Box, Typography } from "@mui/material";
import React from "react";
import icon from "../assets/images/Frame.svg";

const TopRanker = () => {
  return (
    <Box
      sx={{
        background: "#000000",
        width: { lg: "930px", xs: "100%" },
        m: "2rem auto 0",
        borderRadius: {md:"100px",xs:"10px"},
        padding: "15px 25px",
        display: "flex",
        justifyContent: { sm: "space-between", xs: "center" },
        gap: "1rem",
        flexWrap: "wrap",
        "& p": {
          fontFamily: "JostRegular",
          fontSize: { sm: "16px", xs: "16px" },
          color: "#DCDCDC",
        },
      }}
    >
      <Typography
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Typography component={"img"} src={icon.src} />{" "}
        <span style={{ fontWeight: "600" }}>ABC</span>{" "}
        <span
          style={{
            color: "#797987",
            fontSize: "14px",
          }}
        >
          0x0d...dd27
        </span>{" "}
        <span style={{ color: "#2D8E2F", fontSize: "14px",fontFamily:"Inter" }}>
          BUY 10.000.02
        </span>
      </Typography>
      <Typography
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Typography component={"img"} src={icon.src} />{" "}
        <span style={{ fontWeight: "600" }}>ABC</span>{" "}
        <span
          style={{
            color: "#797987",
            fontSize: "14px",
          }}
        >
          0x0d...dd27
        </span>{" "}
        <span style={{ color: "#2D8E2F", fontSize: "14px",fontFamily:"Inter" }}>
          BUY 10.000.02
        </span>
      </Typography>
      <Typography
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Typography component={"img"} src={icon.src} />{" "}
        <span style={{ fontWeight: "600" }}>ABC</span>{" "}
        <span
          style={{
            color: "#797987",
            fontSize: "14px",
          }}
        >
          0x0d...dd27
        </span>{" "}
        <span style={{ color: "#2D8E2F", fontSize: "14px",fontFamily:"Inter" }}>
          BUY 10.000.02
        </span>
      </Typography>
    </Box>
  );
};

export default TopRanker;
