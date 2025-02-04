"use client";

import Link from "next/link";
import { Rajdhani } from "next/font/google";
import localFont from "next/font/local";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Progress } from "flowbite-react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Chart from "@/components/tradingview";
import { useMedia } from "react-use";
import { format } from "date-fns";
import { AiOutlineExport } from "react-icons/ai";
import logos_telegram from "../../assets/images/logos_telegram.png";
import logo_ from "../../assets/images/logo_.svg";
import prime_twitter from "../../assets/images/prime_twitter.png";
import web from "../../assets/images/web.svg";

import { useAccount } from "wagmi";

import { TOKEN_DECIMALS } from "@/engine/consts";
import {
  getToken,
  getThreadData,
  reply,
  likeReply,
  dislikeReply,
  mentionReply,
  trade,
  getTradeHistory,
  getMarketId,
} from "@/api/token";
import { getUserId, truncateAddress } from "@/utils";
import { Box, Grid, Typography } from "@mui/material";
import CopyTextWithTooltip from "@/components/CopyTextWithTooltip";
import img_bg from "../../assets/images/img_bg.png";

const rajdhani = Rajdhani({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["devanagari"],
});

const EurostileMNFont = localFont({
  src: "../../assets/font/eurostile-mn-extended-bold.ttf",
});

const ProgressTheme = {
  base: "bg-[#141414] rounded-full",
  size: {
    sm: "h-2",
  },
  color: {
    white: "bg-white",
  },
};

export default function TokenPage() {
  const { query } = useRouter();
  const { addr } = query;

  const { isConnected } = useAccount();
  const walletCtx = useWallet();

  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false);
  const [isSlippageDialogOpen, setIsSlippageDialogOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState("buy");
  const [currentTab, setCurrentTab] = useState("Thread");
  const [amount, setAmount] = useState("");
  const [tokenInfo, setTokenInfo] = useState(null);
  const [currentCoin, setCurrentCoin] = useState("omax");
  const [threadData, setThreadData] = useState(null);
  const [tradeHistory, setTradeHistory] = useState(null);
  const [postType, setPostType] = useState("normal");
  const [mentionReplyId, setMentionReplyId] = useState("");
  const [chartType, setChartType] = useState("pump chart");
  const [isMobile, setIsMobile] = useState(false);
  const [isBook, setIsBook] = useState(false);
  const below600 = useMedia("(max-width: 600px)");
  const below800 = useMedia("(max-width: 800px)");
  const [isPoolComplete, setIsPoolComplete] = useState(false);

  const chartHeight = isMobile ? 400 : 600;

  useEffect(() => {
    const interval = setInterval(() => {
      if (addr !== undefined) {
        getTokenInfo();
        getThreadInfo();
        getTradeHistoryInfo();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (walletCtx.publicKey !== null) checkCompleted();
  }, [walletCtx]);

  useEffect(() => {
    setIsMobile(below600);
  }, [below600]);
  useEffect(() => {
    setIsBook(below800);
  }, [below800]);

  useEffect(() => {
    if (addr !== undefined) {
      getTokenInfo();
      if (currentTab === "Thread") getThreadInfo();
      else getTradeHistoryInfo();
      checkCompleted();
    }
  }, [addr, currentTab]);

  const checkCompleted = async () => {
    // if (walletCtx.publicKey !== null && addr !== undefined) {
    //   // console.log("================")
    //   const result = await isPoolCompleted(addr, NATIVE_MINT);
    //   setIsPoolComplete(result);
    //   // console.log(result)
    // }
  };

  const getTradeHistoryInfo = async () => {
    const result = await getTradeHistory(addr);
    setTradeHistory(result);
  };

  const getTokenInfo = async () => {
    const userId = getUserId();
    const result = await getToken(addr, userId);
    // console.log(result)
    setTokenInfo(result);
  };
  console.log(tokenInfo);

  const getThreadInfo = async () => {
    if (isConnected) {
      const userId = getUserId();
      const result = await getThreadData(addr, userId);
      // console.log(result)
      setThreadData(result);
    }
  };

  const onChangeAmount = (e) => {
    if (Number(e.target.value) < 0) return;
    setAmount(e.target.value);
  };

  const onTrade = (e) => {
    if (!isConnected) {
      toast.error("Not connected wallet!");
      return;
    }

    if (amount === "") {
      toast.warning("Please input amount");
      return;
    }

    if (currentMode === "buy") {
      if (tokenInfo?.omaxBalance < amount) {
        toast.error("Insufficient balance!");
        return;
      }
    } else {
      if (tokenInfo?.tokenBalance < amount) {
        toast.error("Insufficient balance!");
        return;
      }
    }

    setIsTradeDialogOpen(true);
  };

  const handleReply = async (comment, imageFile) => {
    if (walletCtx.connected === false) {
      toast.error("Please connect wallet!");
      return;
    }
    if (comment.current.value === "") {
      toast.error("Please add a comment!");
      return;
    }

    await reply(addr, comment.current.value, imageFile);
    getThreadInfo();
    setIsPostDialogOpen(false);
  };

  const handleMentionReply = async (replyMentionId, comment, imageFile) => {
    if (walletCtx.connected === false) {
      toast.error("Please connect wallet!");
      return;
    }
    if (comment.current.value === "") {
      toast.error("Please add a comment!");
      return;
    }

    await mentionReply(replyMentionId, comment.current.value, imageFile);
    getThreadInfo();
    setIsPostDialogOpen(false);
  };
  function formatDuration(timestamp) {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);

    if (diffInSeconds < 60) {
      // Less than a minute ago
      return `${diffInSeconds}s ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      // Less than an hour ago
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      // Less than a day ago
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
  return (
    <Grid container spacing={2} className={`z-10 mt-10`}>
      <Grid item md={9} sm={12} xs={12}>
        <div className="z-10 flex flex-col w-full px-1">
          {isPoolComplete === true && (
            <div className="flex items-center gap-2 bg-[#86efac] p-4 rounded-md w-fit">
              <p className="text-black text-xl">
                Omax pool seeded! view the coin on Omax protocol
              </p>
              <a
                href={`https://dexscreener.com/${addr}`}
                target="_blank"
                className="text-xl font-medium hover:underline text-[#6cc9c6]"
              >
                here
              </a>
            </div>
          )}
          <Box
            mb={2}
            sx={{
              background: "hsl(0deg 0% 100% / 6%)",
              border: "1px solid #353535",
              borderRadius: "40px",
              p: "1rem 1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1.5rem",
              "& p": {
                fontSize: "13px",
                fontWeight: "600",
                fontFamily: "Inter",
                // color:"#fff",
              },
              "& .text_,a": {
                display: "flex",
                gap: "5px",
                alignItems: "center",
                fontFamily: "Inter",
              },
              "& .text_": {
                fontSize: "13px",
                fontFamily: "Inter",
                color: "#fff",
              },
              "& a": {
                color: "#5F6165",
                fontSize: "12px",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: "0.8rem",
              }}
            >
              <Typography
                sx={{
                  color: "#91959A",
                }}
              >
                Token created
              </Typography>
              <Typography
                sx={{
                  fontWeight: "600",
                  color: "#fff",
                }}
              >
                {tokenInfo?.cdate
                  ? formatDuration(new Date(tokenInfo?.cdate).getTime())
                  : "N/A"}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: "0.8rem",
              }}
            >
              <Typography
                sx={{
                  color: "#91959A",
                }}
              >
                Creator
              </Typography>
              <Typography sx={{ fontWeight: "600" }} className="text_">
                <CopyTextWithTooltip textToCopy={""} />{" "}
                {truncateAddress(tokenInfo?.walletAddr || "")}
                <a
                  href={`https://omaxscan.com/address/${tokenInfo?.walletAddr}`}
                  target="_blank"
                >
                  EXP <AiOutlineExport size={15} />
                </a>
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: "0.8rem",
              }}
            >
              <Typography
                sx={{
                  color: "#91959A",
                  textTransform: "uppercase",
                }}
              >
                {tokenInfo?.ticker}
              </Typography>
              <Typography sx={{ fontWeight: "600" }} className="text_">
                <CopyTextWithTooltip textToCopy={""} />{" "}
                {truncateAddress(addr || "")}{" "}
                <a href={`https://solscan.io/account/${addr}`} target="_blank">
                  EXP <AiOutlineExport size={15} />
                </a>
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: "0.8rem",
              }}
            >
              <Typography
                sx={{
                  color: "#91959A",
                }}
              >
                Bonding curve
              </Typography>
              <Typography sx={{ fontWeight: "600" }} className="text_">
                <CopyTextWithTooltip textToCopy={""} />{" "}
                {truncateAddress(addr || "")}{" "}
                <a href={`https://omaxscan.com/address/${addr}`} target="_blank">
                  EXP <AiOutlineExport size={15} />
                </a>
              </Typography>
            </Box>
          </Box>
          {isPoolComplete === true && (
            <div className="flex gap-2 pb-2">
              <div
                className={clsx(
                  "rounded-md text-base px-2 py-1 cursor-pointer",
                  chartType === "pump chart"
                    ? "bg-[#86efac] text-black"
                    : "text-white"
                )}
                onClick={() => setChartType("pump chart")}
              >
                Pump chart
              </div>
              <div
                className={clsx(
                  "rounded-md text-base px-2 py-1 cursor-pointer",
                  chartType === "current chart"
                    ? "bg-[#86efac] text-black "
                    : "text-white"
                )}
                onClick={() => setChartType("current chart")}
              >
                Current chart
              </div>
            </div>
          )}
          {addr !== undefined &&
            tokenInfo !== null &&
            chartType === "pump chart" && (
              <Chart
                stock={"Stock"}
                interval="60"
                width="100%"
                height="100%"
                tokenId={addr}
                symbol={tokenInfo?.ticker + "/Pump"}
              />
            )}
          {chartType === "current chart" && (
            <iframe
              className={`w-full h-[600px]`}
              src="https://dexscreener.com/omax/GH8Ers4yzKR3UKDvgVu8cqJfGzU4cU62mTeg9bcJ7ug6?embed=1&theme=dark&trades=0&info=0"
            ></iframe>
          )}
          <div className="flex flex-col gap-[10px] pt-6">
            <div className="flex gap-6">
              <button
                type="button"
                className={clsx(
                  "text-base",
                  currentTab === "Thread"
                    ? "font-bold text-white"
                    : "text-[#9F9F9F]"
                )}
                style={{ fontFamily: "JostRegular" }}
                onClick={() => setCurrentTab("Thread")}
              >
                Thread
              </button>
              <button
                type="button"
                className={clsx(
                  "text-base",
                  currentTab === "Trades"
                    ? "font-bold text-white"
                    : "text-[#9F9F9F]"
                )}
                style={{ fontFamily: "JostRegular" }}
                onClick={() => setCurrentTab("Trades")}
              >
                Trades
              </button>
            </div>
            {currentTab === "Thread" ? (
              <div
                className="flex flex-col gap-2"
                style={{
                  background: "hsl(0deg 0% 100% / 6%)",
                  border: "1px solid #353535",
                  borderRadius: "10px",
                  padding: "16px",
                }}
              >
                <div
                  className="flex flex-col gap-[10px] p-4 rounded-xl"
                  style={{ background: "rgba(0, 0, 0, 0.12)" }}
                >
                  <div className="flex gap-1 items-center gap-2">
                    <Image
                      src={
                        tokenInfo?.avatar !== null &&
                        tokenInfo?.avatar !== undefined
                          ? `${process.env.NEXT_PUBLIC_AVATAR_URL}/${tokenInfo?.avatar}`
                          : "/img6.png"
                      }
                      width={40}
                      height={40}
                      alt=""
                    />
                    <Box>
                      <p
                        className="text-base font-bold text-white"
                        style={{ fontFamily: "JostRegular", fontSize: "16px" }}
                      >{`${tokenInfo?.name} (ticker: ${tokenInfo?.ticker})`}</p>
                      <Link
                        href={`/profile/${tokenInfo?.walletAddr}`}
                        style={{ color: "#797987", fontFamily: "JostRegular" }}
                        className=" rounded-[4px] text-sm hover:underline"
                      >
                        {truncateAddress(tokenInfo?.walletAddr)}
                      </Link>
                    </Box>
                    {/* <p className='text-xs text-[#9F9F9F]'>{format(new Date(tokenInfo?.cdate), "MM/dd/yyyy, HH:mm:ss")}</p> */}
                  </div>
                  <div className="flex gap-[22px]">
                    {tokenInfo?.logo !== null && (
                      <Image
                        className="h-fit rounded-xl"
                        src={tokenInfo?.logo}
                        width={100}
                        height={100}
                        alt=""
                      />
                    )}

                    {/* <p className='text-base font-bold text-white'>{tokenInfo?.comment}</p> */}
                  </div>
                </div>
                {threadData !== null &&
                  threadData.map((item, index) => {
                    return (
                      <div
                        key={index}
                        className="flex flex-col gap-[10px] p-4 bg-[#121212] rounded-xl"
                      >
                        <div className="flex gap-1 items-center">
                          <Image
                            src={
                              item.avatar !== null && item.avatar !== undefined
                                ? `${process.env.NEXT_PUBLIC_AVATAR_URL}/${item.avatar}`
                                : "/img6.png"
                            }
                            width={16}
                            height={16}
                            alt=""
                          />
                          <Link
                            href={`/profile/${item.walletAddr}`}
                            className="bg-white rounded-[4px] text-sm px-1 hover:underline"
                          >
                            {item.username}
                          </Link>
                          <p className="text-xs text-[#9F9F9F]">
                            {format(
                              new Date(item.cdate),
                              "MM/dd/yyyy, HH:mm:ss"
                            )}
                          </p>
                          <div className="flex gap-2 items-center">
                            <div
                              className="cursor-pointer"
                              onClick={async () => {
                                if (item.liked === true)
                                  await dislikeReply(item.replyMentionId);
                                else await likeReply(item.replyMentionId);
                                getThreadInfo();
                              }}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 15 15"
                                fill="#ef4444"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M1.35248 4.90532C1.35248 2.94498 2.936 1.35248 4.89346 1.35248C6.25769 1.35248 6.86058 1.92336 7.50002 2.93545C8.13946 1.92336 8.74235 1.35248 10.1066 1.35248C12.064 1.35248 13.6476 2.94498 13.6476 4.90532C13.6476 6.74041 12.6013 8.50508 11.4008 9.96927C10.2636 11.3562 8.92194 12.5508 8.00601 13.3664C7.94645 13.4194 7.88869 13.4709 7.83291 13.5206C7.64324 13.6899 7.3568 13.6899 7.16713 13.5206C7.11135 13.4709 7.05359 13.4194 6.99403 13.3664C6.0781 12.5508 4.73641 11.3562 3.59926 9.96927C2.39872 8.50508 1.35248 6.74041 1.35248 4.90532Z"
                                  fill={
                                    item.liked === true ? "#ef4444" : "white"
                                  }
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                ></path>
                              </svg>
                            </div>
                            <p className="text-xs text-[#9F9F9F]">
                              {item.likes}
                            </p>
                            <p
                              className="text-xs text-[#9F9F9F] cursor-pointer hover:underline"
                              onClick={() => {
                                setMentionReplyId(item.replyMentionId);
                                setIsPostDialogOpen(true);
                              }}
                            >
                              #{item.replyMentionId}
                            </p>
                          </div>
                          {item.buySell === 1 && (
                            <p className="flex gap-1 items-center text-[#3FDC4F]">
                              {`bought ${item.quoteAmount} OMAX`}
                            </p>
                          )}
                          {item.buySell === 2 && (
                            <p className="flex gap-1 items-center text-red-600">
                              {`sold ${item.baseAmount}${tokenInfo?.ticker}`}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-[22px]">
                          {item.image !== null && (
                            <Image
                              className="h-fit rounded-xl"
                              src={`${process.env.NEXT_PUBLIC_AVATAR_URL}/images/${item.image}`}
                              width={100}
                              height={100}
                              alt=""
                            />
                          )}
                          <p className="text-base font-bold text-white">
                            {item.comment}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                <button
                  type="button"
                  style={{
                    fontFamily: "JostRegular",
                  }}
                  className="bg-[#F0FF42] rounded-full text-base  font-bold w-fit mx-auto px-6 py-2 mt-2"
                  onClick={() => {
                    setMentionReplyId("");
                    setIsPostDialogOpen(true);
                  }}
                >
                  Post a reply
                </button>
              </div>
            ) : (
              <div
                className="flex flex-col gap-1"
                style={{
                  background: "hsl(0deg 0% 100% / 6%)",
                  border: "1px solid #353535",
                  borderRadius: "10px",
                  padding: "16px",
                }}
              >
                <div
                  className="flex p-3 justify-between border border-[#282828] rounded-lg"
                  style={{ background: "rgba(0, 0, 0, 0.12)" }}
                >
                  <div className="flex w-[80%]">
                    <p className="text-sm font-medium text-[#9F9F9F] w-[30%]">
                      account
                    </p>
                    <p className="text-sm font-medium text-[#9F9F9F] w-[15%] text-center">
                      type
                    </p>
                    <p className="text-sm font-medium text-[#9F9F9F] w-[20%] text-center">
                      OMAX
                    </p>
                    <p className="text-sm font-medium text-[#9F9F9F] w-[15%] text-center">
                      {tokenInfo?.ticker}
                    </p>
                    <p className="text-sm font-medium text-[#9F9F9F] w-[20%] text-center">
                      date
                    </p>
                  </div>
                  <p className="text-sm font-medium text-[#9F9F9F]">
                    transaction
                  </p>
                </div>
                {tradeHistory === null && (
                  <div className="flex p-3 justify-center rounded-lg text-center text-white w-full">
                    No data
                  </div>
                )}
                {tradeHistory !== null && tradeHistory.length === 0 && (
                  <div className="flex p-3 justify-center rounded-lg text-center text-white w-full">
                    No data
                  </div>
                )}
                {tradeHistory !== null &&
                  tradeHistory.length !== 0 &&
                  tradeHistory.map((item, index) => {
                    return (
                      <Box
                        sx={{
                          "& p": {
                            fontFamily: "JostRegular",
                          },
                        }}
                        key={index}
                        className="flex p-3 justify-between rounded-lg bg-[#121212]"
                      >
                        <div className="flex w-[80%]">
                          <div className="flex items-center gap-1 w-[30%]">
                            {item.avatar !== null &&
                            item.avatar !== undefined ? (
                              <Image
                                src={
                                  item.avatar === null
                                    ? "/img3.png"
                                    : `${process.env.NEXT_PUBLIC_AVATAR_URL}/${item.avatar}`
                                }
                                width={16}
                                height={16}
                                alt=""
                              />
                            ) : (
                              <Image
                                src="/img6.png"
                                width={16}
                                height={16}
                                alt=""
                              />
                            )}
                            <Link
                              href={`/profile/${item.walletAddr}`}
                              className="px-1 bg-white rounded-[4px] text-sm"
                            >
                              {item.username}
                            </Link>
                          </div>
                          <p
                            className={clsx(
                              "text-sm font-medium w-[15%] text-center",
                              item.isBuy === true
                                ? "text-[#3FDC4F]"
                                : "text-red-600"
                            )}
                          >
                            {item.isBuy === true ? "buy" : "sell"}
                          </p>
                          <p className="text-sm font-medium text-[#9F9F9F] w-[20%] text-center">
                            {item.quoteAmount}
                          </p>
                          <p className="text-sm font-medium text-[#9F9F9F] w-[15%] text-center">
                            {item.baseAmount}
                          </p>
                          <p className="text-sm font-medium text-[#9F9F9F] w-[20%] text-center">
                            {format(
                              new Date(item.date),
                              "MM/dd/yyyy, HH:mm:ss"
                            )}
                          </p>
                        </div>
                        <a
                          href={`https://omaxscan.com/tx/${item.txhash}`}
                          target="_blank"
                          className="text-sm font-medium text-[#9F9F9F] hover:underline"
                        >
                          {item.txhash.substr(0, 6)}
                        </a>
                      </Box>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </Grid>
      <Grid
        item
        md={3}
        sm={12}
        xs={12}
        sx={{
          "& p": {
            fontFamily: "JostRegular",
          },
        }}
      >
        <Box
          mb={2}
          sx={{
            background: "hsl(0deg 0% 100% / 6%)",
            border: "1px solid #353535",
            borderRadius: "40px",
            p: "5px",
          }}
        >
          <Grid container spacing={2}>
            <Grid item md={6} xs={6} alignSelf={"center"}>
              <Typography color={"#fff"} textAlign={"center"}>
                Follow us
              </Typography>
            </Grid>
            <Grid item md={6} xs={6}>
              <Box>
                <Box
                  sx={{
                    p: "10px",
                    borderRadius: "50px",
                    background: "#000",
                    display: "flex",
                    justifyContent: "space-between",
                    "& img": {
                      width: "24px",
                      height: "24px",
                    },
                  }}
                >
                  <a href={tokenInfo?.website} target="_blank">
                    <Typography component={"img"} src={web.src} />
                  </a>
                  <a href={tokenInfo?.twitter} target="_blank">
                    <Typography component={"img"} src={prime_twitter.src} />
                  </a>
                  <a href={tokenInfo?.telegram} target="_blank">
                    <Typography component={"img"} src={logos_telegram.src} />
                  </a>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <div className="z-10 flex flex-col sm:max-w-sm w-full pb-20">
          <Box
            sx={{
              border: "1px solid #353535",
              borderRadius: "10px",
            }}
          >
            <div className="flex">
              <div className="relative w-full">
                <button
                  type="button"
                  className={clsx(
                    "text-xl text-center py-3 uppercase w-full",
                    currentMode === "buy"
                      ? "text-white font-bold bg-[#242C3E]"
                      : "text-[#9F9F9F]"
                  )}
                  style={{
                    borderTopLeftRadius: "10px",
                    textTransform: "capitalize",
                    color: "#A6A9AD",
                    fontSize: "14px",
                    fontFamily: "Inter",
                  }}
                  onClick={() => setCurrentMode("buy")}
                >
                  buy
                </button>
                {currentMode === "buy" && (
                  <div className="absolute bottom-0 w-full h-[2px] bg-[#39ED6F]"></div>
                )}
              </div>
              <div className="relative w-full">
                <button
                  type="button"
                  style={{
                    borderTopRightRadius: "10px",
                    textTransform: "capitalize",
                    color: "#A6A9AD",
                    fontSize: "14px",
                    fontFamily: "Inter",
                  }}
                  className={clsx(
                    "text-xl text-center py-3 uppercase w-full",
                    currentMode === "sell"
                      ? "text-white font-bold bg-[#242C3E]"
                      : "text-[#9F9F9F]"
                  )}
                  onClick={() => setCurrentMode("sell")}
                >
                  sell
                </button>
                {currentMode === "sell" && (
                  <div className="absolute bottom-0 w-full h-[2px] bg-[#39ED6F]"></div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 p-4">
              <Box
                sx={{
                  "& button": {
                    border: "1px solid rgba(148, 163, 184, 0.1)",
                    background: "rgba(0, 0, 0, 0.1)",
                    color: "#58636E",
                  },
                }}
                className="flex justify-between"
              >
                <button
                  type="button"
                  className={clsx(
                    "bg-[#1A1A1A] px-4 py-[10px] text-sm text-white",
                    currentMode === "buy" ? "visible" : "invisible"
                  )}
                  onClick={() => {
                    if (currentCoin === "omax")
                      setCurrentCoin(tokenInfo?.ticker);
                    else setCurrentCoin("omax");
                  }}
                >
                  Switch to {currentCoin === "omax" ? tokenInfo?.ticker : "OMAX"}
                </button>
                <button
                  type="button"
                  className="bg-[#1A1A1A] px-4 py-[10px] text-sm text-white"
                  onClick={() => setIsSlippageDialogOpen(true)}
                >
                  Set max slippage
                </button>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: "10px",
                }}
                className="relative"
              >
                {currentMode === "buy" ? (
                  <div
                    className="inset-y-4 flex items-center justify-center gap-[5px]"
                    style={{
                      border: "1px solid rgba(148, 163, 184, 0.1)",
                      width: "110px",
                      background: "rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Image
                      className="rounded-full"
                      src={
                        currentCoin === "omax" ? logo_.src : tokenInfo?.logo
                      }
                      width={20}
                      height={20}
                      style={{borderRadius:"50%"}}
                      alt="omax"
                    />
                    <p
                      className="text-sm text-white uppercase"
                      style={{ fontSize: "14px", color: "#58636E" }}
                    >
                      {currentCoin === "omax" ? "OMAX" : tokenInfo?.ticker}
                    </p>
                  </div>
                ) : (
                  <div
                    className="inset-y-4 flex items-center justify-center gap-[5px] "
                    style={{
                      width: "110px",
                      border: "1px solid rgba(148, 163, 184, 0.1)",
                      background: "rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Image
                      className="rounded-full"
                      src={tokenInfo?.logo}
                      width={18}
                      height={18}
                      alt="coin"
                    />
                    <p
                      className="text-sm text-white uppercase"
                      style={{ fontSize: "14px", color: "#58636E" }}
                    >
                      {tokenInfo?.ticker}
                    </p>
                  </div>
                )}
                <input
                  value={amount}
                  onChange={onChangeAmount}
                  type="number"
                  className="px-6 py-4 bg-[#121212] h-[40px] text-sm border text-[#9F9F9F] w-full"
                  placeholder="0.0"
                  style={{
                    borderColor: "rgba(148, 163, 184, 0.1)",
                    background: "#242C3E",
                  }}
                />
              </Box>
              <Box
                sx={{
                  "& button": {
                    border: "1px solid rgba(148, 163, 184, 0.1)",
                    background: "rgba(0, 0, 0, 0.1)",
                    p: "5px",
                    color: "#58636E",
                    fontFamily: "Inter",
                    fontSize: "12px",
                    width: "100%",
                  },
                }}
              >
                {currentMode === "buy" ? (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="bg-[#1A1A1A] px-4 py-1 text-sm text-white"
                      onClick={() => setAmount(0)}
                    >
                      reset
                    </button>
                    <button
                      type="button"
                      className="bg-[#1A1A1A] px-4 py-1 text-sm text-white"
                      onClick={() => setAmount(1)}
                    >
                      1 OMAX
                    </button>
                    <button
                      type="button"
                      className="bg-[#1A1A1A] px-4 py-1 text-sm text-white"
                      onClick={() => setAmount(5)}
                    >
                      5 OMAX
                    </button>
                    <button
                      type="button"
                      className="bg-[#1A1A1A] px-4 py-1 text-sm text-white"
                      onClick={() => setAmount(10)}
                    >
                      10 OMAX
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="bg-[#1A1A1A] px-4 py-1 text-sm text-white"
                      onClick={() => setAmount(0)}
                    >
                      reset
                    </button>
                    <button
                      type="button"
                      className="bg-[#1A1A1A] px-4 py-1 text-sm text-white"
                      onClick={() => setAmount(tokenInfo?.tokenBalance / 4)}
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      className="bg-[#1A1A1A] px-4 py-1 text-sm text-white"
                      onClick={() => setAmount(tokenInfo?.tokenBalance / 2)}
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      className="bg-[#1A1A1A] px-4 py-1 text-sm text-white"
                      onClick={() =>
                        setAmount((tokenInfo?.tokenBalance / 4) * 3)
                      }
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      className="bg-[#1A1A1A] px-4 py-1 text-sm text-white"
                      onClick={() => setAmount(tokenInfo?.tokenBalance)}
                    >
                      100%
                    </button>
                  </div>
                )}
              </Box>
              <button
                type="button"
                style={{
                  width: "100%",
                  fontFamily: "JostRegular",
                }}
                className="bg-[#F0FF42] rounded-full text-base  font-bold w-fit mx-auto px-6 py-2 my-3"
                onClick={onTrade}
              >
                Place trade
              </button>
            </div>
          </Box>
          <div className="flex flex-col gap-4 mt-4" style={{
              border: "1px solid #353535",
              borderRadius: "10px",
          }}>
            <div className="flex gap-[22px] items-center p-4" style={{
              background:"rgba(255, 255, 255, 0.04)"
            }}>
            <Box position={"relative"} lineHeight={0}>
            <Typography component={"img"} src={img_bg.src} sx={{
              width:"90px",
              height:"90px",
            }}/>
            <Typography component={"img"} src={tokenInfo?.logo} sx={{
              width:"77px",
              height:"77px",
              borderRadius:"50%",
              position:"absolute",
              left:"50%",
              top:"50%",
              transform:"translate(-50%,-50%)"
            }}/>
         
            </Box>
              <Box sx={{
                "& p":{
                  fontFamily:"JostRegular",
                  fontSize:"14px"
                }
              }} className="flex flex-col gap-2">
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-[#9F9F9F]">
                    Name:{" "}
                    <span className="text-[white]">
                      {tokenInfo?.name}
                    </span>
                  </p>
                  <p className="text-sm text-[#9F9F9F]">
                    Created By:{" "}
                    <span className="text-[white]">
                      {tokenInfo?.username}
                    </span>
                  </p>
                  <p className="text-sm text-[#9F9F9F]">
                    Market cap:{" "}
                    <span className="text-[white]">
                      {(tokenInfo?.marketCap / 1000).toFixed(2)}k
                    </span>
                  </p>
                  <p className="text-sm text-[#9F9F9F]">
                    Replies:{" "}
                    <span className="text-[white]">{tokenInfo?.replies}</span>
                  </p>
                </div>
              </Box>
            </div>
          <Box sx={{
            "& p":{
              fontFamily:"JostRegular !important"
            }
          }}
          className="px-4 pb-4">
          <div className="flex flex-col gap-2">
              <p className="text-sm text-white font-medium">
                bonding curve progress:{" "}
                {tokenInfo?.bondingCurveProgress.toFixed(1)}%
              </p>
              <Progress
                progress={tokenInfo?.bondingCurveProgress}
                size="sm"
                color="white"
                theme={ProgressTheme}
              />
            </div>
            <p className="text-sm font-medium text-[#9F9F9F] pt-4">
              when the market cap reaches $50,000 all the liquidity from the
              bonding curve will be deposited into Omax protocol and burned.
              progression increases as the price goes up.
              <br />
              <br />
              there are{" "}
              {tokenInfo?.tokensAvailableForSale !== null
                ? tokenInfo?.tokensAvailableForSale.toFixed(0)
                : "751,404,142"}{" "}
              tokens still available for sale in the bonding curve and there is{" "}
              {tokenInfo?.realQuoteReserve !== null
                ? tokenInfo?.realQuoteReserve.toFixed(2)
                : "1,213"}{" "}
              OMAX in the bonding curve.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              {tokenInfo?.crownDate ? (
                <p className="text-sm text-[#ffff00] font-medium">
                  Crowned king of the hill on {tokenInfo?.crownDate}
                </p>
              ) : (
                <>
                  <p className="text-sm text-white font-medium">
                    king of the hill progress:{" "}
                    {tokenInfo?.kingOfTheHillProgress.toFixed(1)}%
                  </p>
                  <Progress
                    progress={tokenInfo?.kingOfTheHillProgress}
                    size="sm"
                    color="white"
                    theme={ProgressTheme}
                  />
                </>
              )}
            </div>
            {/* <div className='text-base font-bold text-white border-b border-dotted border-[#282828] w-fit'>Crowned king of the hill on 17:19:57 15/05/2024</div> */}
            <div className="flex flex-col gap-3 pt-3">
              <p className="text-base font-semibold text-white">
                Holder distribution
              </p>
              <div className="flex flex-col gap-2 text-sm text-white/[.80]">
                {tokenInfo?.tokenHolderDistribution.map((item, index) => {
                  return (
                    <div key={index} className="flex justify-between">
                      <a
                        href={`https://omaxscacn.com/address/${item.walletAddr}`}
                        target="_blank"
                        className="hover:underline"
                      >
                        {index + 1}. {item.username}{" "}
                        {item.bio === null ? "" : `(${item.bio})`}
                      </a>
                      <p>{item.holdPercent.toFixed(2)}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Box>
          </div>
        </div>
      </Grid>
      <PostDialog
        isPostDialogOpen={isPostDialogOpen}
        setIsPostDialogOpen={setIsPostDialogOpen}
        handleReply={handleReply}
        mentionReplyId={mentionReplyId}
        handleMentionReply={handleMentionReply}
      />
      <TradeDialog
        isTradeDialogOpen={isTradeDialogOpen}
        setIsTradeDialogOpen={setIsTradeDialogOpen}
        tokenMint={addr}
        ticker={tokenInfo?.ticker}
        amount={amount}
        isBuy={currentMode === "buy"}
      />
      <SlippageDialog
        isSlippageDialogOpen={isSlippageDialogOpen}
        setIsSlippageDialogOpen={setIsSlippageDialogOpen}
      />
    </Grid>
  );
}

function PostDialog({
  isPostDialogOpen,
  setIsPostDialogOpen,
  handleReply,
  mentionReplyId,
  handleMentionReply,
}) {
  const comment = useRef("");
  const [imageName, setImageName] = useState("");
  const [imageFile, setImageFile] = useState(null);

  return (
    <Transition appear show={isPostDialogOpen}>
      <Dialog
        as="div"
        className={`relative z-30 focus:outline-none ${rajdhani.className}`}
        onClose={() => setIsPostDialogOpen(false)}
      >
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <Box
            sx={{
              "& p,textarea,input,button,div": {
                fontFamily: "JostRegular",
              },
            }}
            className="flex min-h-full items-center justify-center p-4 bg-black/80"
          >
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 transform-[scale(95%)]"
              enterTo="opacity-100 transform-[scale(100%)]"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 transform-[scale(100%)]"
              leaveTo="opacity-0 transform-[scale(95%)]"
            >
              <DialogPanel className="flex flex-col gap-10 p-10 w-full max-w-xl rounded-3xl bg-[#0B1821] border border-none backdrop-blur-2xl">
                <div className="flex flex-col gap-2 w-full">
                  <p className="text-xl font-bold text-white">Add a comment</p>
                  <textarea
                    ref={comment}
                    className={`w-full h-[160px] rounded-xl px-6 py-4 border border-none text-[#9F9F9F] text-base resize-none`}
                    style={{
                      background: "rgba(0, 0, 0, 0.22)",
                    }}
                    placeholder="Comment"
                  ></textarea>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <p className="text-xl font-bold text-white">
                    Image (Optional)
                  </p>
                  <div className="relative">
                    <label
                      htmlFor="postImage"
                      className="absolute right-4 inset-y-3.5"
                    >
                      <div
                        className={`rounded-xl p-3 text-xs cursor-pointer`}
                        style={{
                          background: "rgb(163 191 86 / 49%)",
                          border: "2px solid rgb(240 255 66 / 64%)",
                          color: "#fff",
                          fontSize: "16px",
                        }}
                      >
                        Choose Image
                      </div>
                      <input
                        id="postImage"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files.length > 0) {
                            setImageName(e.target.files[0].name);
                            setImageFile(e.target.files[0]);
                          } else {
                            setImageName("");
                            setImageFile(null);
                          }
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      className={`w-full h-[69px] rounded-xl px-6 border border-none text-[#9F9F9F]`}
                      placeholder="Choose Image"
                      value={imageName}
                      disabled
                      style={{
                        background: "rgba(0, 0, 0, 0.22)",
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3 items-center">
                  <button
                    type="button"
                    style={{
                      fontFamily: "JostRegular",
                    }}
                    className="bg-[#F0FF42] rounded-xl w-full h-[50px] text-lg font-bold"
                    onClick={() => {
                      if (mentionReplyId === "")
                        handleReply(comment, imageFile);
                      else
                        handleMentionReply(mentionReplyId, comment, imageFile);
                    }}
                  >
                    Post Reply
                  </button>
                  <button
                    type="button"
                    className="rounded-xl w-full h-[50px] text-lg text-white underline"
                    onClick={() => setIsPostDialogOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </Box>
        </div>
      </Dialog>
    </Transition>
  );
}

function TradeDialog({
  isTradeDialogOpen,
  setIsTradeDialogOpen,
  tokenMint,
  ticker,
  amount,
  isBuy,
}) {
  const comment = useRef("");
  const walletCtx = useAccount();

  const onTrade = async () => {
    if (!walletCtx.isConnected) {
      toast.error("Not connected wallet!");
      return;
    }

    // const isPoolCompleted = await isPoolComplete(tokenMint, NATIVE_MINT);
    // if (isPoolCompleted) {
    //   // swap on Omax protocol
    //   const id = toast.loading(`Trading ${ticker}...`);

    //   try {
    //     let inputTokenAmount;
    //     let outputToken;

    //     if (isBuy) {
    //       inputTokenAmount = new TokenAmount(
    //         Token.WSOL,
    //         BigInt(Math.trunc(Number(amount) * LAMPORTS_PER_SOL))
    //       );
    //       outputToken = new Token(TOKEN_PROGRAM_ID, tokenMint, TOKEN_DECIMALS);
    //     } else {
    //       inputTokenAmount = new TokenAmount(
    //         new Token(TOKEN_PROGRAM_ID, tokenMint, TOKEN_DECIMALS),
    //         BigInt(Math.trunc(Number(amount) * 10 ** TOKEN_DECIMALS))
    //       );
    //       outputToken = Token.WSOL;
    //     }

    //     const marketId = await getMarketId(
    //       tokenMint,
    //       Token.WSOL.mint.toBase58()
    //     );
    //     // console.log('marketId:', marketId);
    //     const txHashes = await swap(
    //       walletCtx,
    //       inputTokenAmount,
    //       outputToken,
    //       new PublicKey(marketId),
    //       isBuy
    //     );
    //     console.log("  trade txHashes:", txHashes);

    //     toast.dismiss(id);
    //     toast.success("Swap complete!");

    //     // await trade(tokenMint, isBuy,
    //     //   isBuy ? 0 : Number(amount), // To do - cryptoprince
    //     //   isBuy ? Number(amount) : 0, // To do - cryptoprince
    //     //   txHashes[0],
    //     //   comment.current.value
    //     // );

    //     setIsTradeDialogOpen(false);
    //   } catch (err) {
    //     console.error(err);
    //     toast.dismiss(id);
    //     toast.error(err.message);
    //   }

    //   return;
    // }

    // const created = await isPoolCreated(tokenMint, NATIVE_MINT);
    // if (!created) {
    //   toast.error(`Pool not created for token '${tokenMint}'`);
    //   return;
    // }

    // const id = toast.loading(`Trading ${ticker}...`);

    // try {
    //   let tx = null;

    //   if (isBuy)
    //     tx = new Transaction().add(await getBuyTx(tokenMint, Number(amount)));
    //   else
    //     tx = new Transaction().add(await getSellTx(tokenMint, Number(amount)));
    //   // console.log('tx:', tx);

    //   const txHash = await send(connection, walletCtx, tx);
    //   console.log("  trade txHash:", txHash);

    //   toast.dismiss(id);
    //   toast.success("Trade complete!");

    //   await trade(
    //     tokenMint,
    //     isBuy,
    //     isBuy ? 0 : Number(amount), // To do - cryptoprince
    //     isBuy ? Number(amount) : 0, // To do - cryptoprince
    //     txHash,
    //     comment.current.value
    //   );

    //   setIsTradeDialogOpen(false);
    // } catch (err) {
    //   console.error(err);
    //   toast.dismiss(id);
    //   toast.error(err.message);
    // }
  };

  return (
    <Transition appear show={isTradeDialogOpen}>
      <Dialog
        as="div"
        className={`relative z-30 focus:outline-none ${rajdhani.className}`}
        onClose={() => setIsTradeDialogOpen(false)}
      >
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 bg-black/80">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 transform-[scale(95%)]"
              enterTo="opacity-100 transform-[scale(100%)]"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 transform-[scale(100%)]"
              leaveTo="opacity-0 transform-[scale(95%)]"
            >
              <DialogPanel className="flex flex-col gap-10 p-10 w-full max-w-xl rounded-3xl bg-[#030303] border border-white backdrop-blur-2xl">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <p className="text-2xl font-bold text-white">
                      Add a comment
                    </p>
                    <textarea
                      ref={comment}
                      className={`w-full h-[160px] rounded-xl px-6 py-4 border border-white text-[#9F9F9F] bg-[#121212] text-base resize-none ${EurostileMNFont.className}`}
                      placeholder="Comment"
                    ></textarea>
                  </div>
                  <p className="text-xl text-white">
                    {isBuy
                      ? `Buy ${ticker} with ${amount} OMAX`
                      : `Sell ${amount} ${ticker}`}
                  </p>
                </div>
                <div className="flex flex-col gap-3 items-center">
                  <button
                    type="button"
                    className="bg-white rounded-xl w-full h-[50px] text-xl font-bold"
                    onClick={onTrade}
                  >
                    Place Trade
                  </button>
                  <button
                    type="button"
                    className="rounded-xl w-full h-[50px] text-xl text-white underline"
                    onClick={() => setIsTradeDialogOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function SlippageDialog({ isSlippageDialogOpen, setIsSlippageDialogOpen }) {
  const slippage = useRef("");

  return (
    <Transition appear show={isSlippageDialogOpen}>
      <Dialog
        as="div"
        className={`relative z-30 focus:outline-none ${rajdhani.className}`}
        onClose={() => setIsSlippageDialogOpen(false)}
      >
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <Box
            sx={{
              "& p,textarea,input,button,div": {
                fontFamily: "JostRegular",
              },
            }}
            className="flex min-h-full items-center justify-center p-4 bg-black/80"
          >
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 transform-[scale(95%)]"
              enterTo="opacity-100 transform-[scale(100%)]"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 transform-[scale(100%)]"
              leaveTo="opacity-0 transform-[scale(95%)]"
            >
              <DialogPanel className="flex flex-col gap-10 p-10 w-full max-w-xl rounded-3xl bg-[#0B1821] border border-none backdrop-blur-2xl">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <p className="text-xl font-bold text-white">
                      Set max slippage (%)
                    </p>
                    <input
                      ref={slippage}
                      type="number"
                      className={`w-full h-[58px] rounded-xl px-6 py-4 border border-none text-[#9F9F9F] text-base resize-none`}
                      style={{
                        background: "rgba(0, 0, 0, 0.22)",
                      }}
                    />
                  </div>
                  <p className="text-lg text-white">
                    This is the maximum amount of slippage you are willing to
                    accept when placing trades
                  </p>
                </div>
                <div className="flex flex-col gap-3 items-center">
                  <button
                    style={{
                      fontFamily: "JostRegular",
                    }}
                    className="bg-[#F0FF42] rounded-xl w-full h-[50px] text-lg font-bold"
                    type="button"
                    onClick={() => setIsSlippageDialogOpen(false)}
                  >
                    Place Trade
                  </button>
                  <button
                    type="button"
                    className="rounded-xl w-full h-[50px] text-xl text-white underline"
                    onClick={() => setIsSlippageDialogOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </Box>
        </div>
      </Dialog>
    </Transition>
  );
}
