import { Box, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import icon from "../assets/images/Frame.svg";
import { getRecentTrade } from "@/api/token";
import { decimalToEth } from "@/engine/utils";
import { truncateAddress } from "@/utils";

const TopRanker = () => {
  const [recentTrade, setRecentTrade] = useState(null);
  const getRecentTradeInfo = async () => {
    const result = await getRecentTrade();
    console.log("top: ", result);
    setRecentTrade(result);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getRecentTradeInfo();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        background: "#000000",
        width: { lg: "930px", xs: "100%" },
        m: "2rem auto 0",
        borderRadius: { md: "100px", xs: "10px" },
        padding: "15px 25px",
        display: "flex",
        justifyContent: { sm: "space-between", xs: "center" },
        maxWidth: "100%",
        gap: "1rem",
        "& p": {
          fontFamily: "JostRegular",
          fontSize: { sm: "16px", xs: "16px" },
          color: "#DCDCDC",
        },
      }}
    >
      <div className="flex max-h-[32px] gap-1 w-max justify-between">
        {recentTrade !== null &&
          recentTrade.map((item, index) => {
            return (
              <Typography
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Typography component={"img"}
                  src={item.logo} sx={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    zIndex: "2",
                  }}
                  alt="" />{" "}
                <span style={{ fontWeight: "600" }} className="w-max">{item.username}</span>{" "}
                <span
                  style={{
                    color: "#797987",
                    fontSize: "14px",
                  }}
                  className="w-max"
                >
                  {truncateAddress(item.walletAddr)}
                </span>{" "}
                <span style={{ color: "#2D8E2F", fontSize: "14px", fontFamily: "Inter" }} className="w-max text-nowrap">
                  {"BUY " + decimalToEth(item.omaxAmount).toFixed(2) + " OMAX"}
                </span>
              </Typography>
            );
          })
        }
      </div>
    </Box>
  );
};

export default TopRanker;
