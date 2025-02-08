"use client";

import { Rajdhani } from "next/font/google";
import localFont from "next/font/local";
import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import clsx from "clsx";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { getFollowings, setFollow, setUnFollow } from "@/api/user";
import { findTokens, getKing } from "@/api/token";
import { getUserId } from "@/utils";
import { Box, Button, Grid, Typography } from "@mui/material";
import crown_frame from "../../assets/images/crown_frame.png";
import image_bg from "../../assets/images/image_bg.png";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useAccount } from "wagmi";


const EurostileMNFont = localFont({
  src: "../../assets/font/eurostile-mn-extended-bold.ttf",
});

const rajdhani = Rajdhani({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["devanagari"],
});

const sortType = [
  { id: 1, name: "sort: bump order" },
  { id: 2, name: "sort: last reply" },
  { id: 3, name: "sort: reply count" },
  { id: 4, name: "sort: market cap" },
  { id: 5, name: "sort: creation time" },
];

const orderType = [
  { id: 1, name: "sort: desc" },
  { id: 2, name: "sort: asc" },
];

export default function BoardPage() {
  const wallet = useAccount();

  const tokenDiv = useRef(null);
  const [currentTab, setCurrentTab] = useState("Terminal");
  const searchTokenName = useRef("");
  const [sortSelected, setSortSelected] = useState(sortType[0]);
  const [orderSelected, setOrderSelected] = useState(orderType[0]);
  const [showAnimations, setShowAnimations] = useState(false);
  const showAnimationsRef = useRef(showAnimations);
  const [includeNSFW, setIncludeNSFW] = useState(true);
  const [followingList, setFollowingList] = useState(null);
  const [tokenList, setTokenList] = useState(null);
  const [kingToken, setKingToken] = useState(null);

  useEffect(() => {
    getTokenList(
      searchTokenName.current.value,
      sortSelected.name,
      orderSelected.name,
      includeNSFW
    );
    getKingToken();

    const interval = setInterval(() => {
      if (tokenDiv.current && showAnimationsRef.current === true) {
        if (tokenDiv.current.classList.contains("animate-shake") === true)
          tokenDiv.current.classList.remove("animate-shake");
        else tokenDiv.current.classList.add("animate-shake");
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    showAnimationsRef.current = showAnimations;
  }, [showAnimations]);

  useEffect(() => {
    getFollowingData();
  }, []);

  const getKingToken = async () => {
    const result = await getKing();
    console.log(result)
    setKingToken(result);
  };

  const getTokenList = async (tokenName, sort, order, nsfw) => {
    const result = await findTokens(
      tokenName,
      sort,
      order,
      nsfw === true ? 1 : 0
    );
    // console.log(result)
    setTokenList(result);
  };

  const getFollowingData = async () => {
    const userId = getUserId();
    const result = await getFollowings(userId);
    setFollowingList(result);
  };

  const handleFollow = async (_id) => {
    await setFollow(_id);
    getFollowingData();
  };

  const handleUnFollow = async (_id) => {
    await setUnFollow(_id);
    getFollowingData();
  };

  return (
    <section
      className={`z-10 flex flex-col pt-10 sm:pt-[80px] gap-[60px] justify-center px-4 pb-20 ${rajdhani.className}`}
    >
      <div>
        <Grid container spacing={2}>
          <Grid item md={6.5} xs={12} justifyContent={"center"}>
            <Typography
              sx={{
                fontFamily: "JostBold",
                color: "#5FE461",
                fontSize: { sm: "63.47px", xs: "30px" },
                textAlign: { sm: "left", xs: "center" },
              }}
            >
              Where Degens Unite
              <br />
              and Charts Ignite!
            </Typography>
            <Button
              component={Link}
              href="/create"
              sx={{
                mt: '1rem',
                background:
                  "linear-gradient(0deg, rgba(88,96,99,1) 0%, rgba(238,243,245,1) 52%, rgba(102,102,102,1) 100%)",
                width: "160px",
                color: "#fff",
                p: "4px",
                borderRadius: "50px",
              }}
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                  textTransform: "capitalize",
                  fontFamily: "JostBold",
                  fontSize: "20px",
                  background:
                    "linear-gradient(180deg, rgba(233,233,233,1) 0%, rgba(31,72,113,1) 30%, rgba(78,231,237,1) 100%)",
                  width: "100%",
                  textAlign: "center",
                  borderRadius: "50px",
                  py: "10px",
                }}
              >
                Launch
              </Typography>
            </Button>
            {/* <Link href="/create" className="flex mx-auto">Launch</Link> */}
          </Grid>
          <Grid
            item
            md={5.5}
            xs={12}
            sx={{
              justifyContent: { lg: "flex-end" },
              display: "flex",
            }}
          >
            {kingToken !== null && (
              <Box
                sx={{
                  backgroundImage: `url(${crown_frame.src})`, // Corrected syntax
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "100% 100%",
                  backgroundPosition: "center",
                  p: "1.5rem 1rem",
                  // height:"300px"
                  width: { lg: "568px", xs: "100%" },
                  // minWidth: { md: "550px", xs: "300px" },
                }}
              >
                <Link
                  href={`/token/${kingToken?.tokenAddr}`}
                  className="flex justify-end"
                >
                  <div className="flex flex-col gap-4 w-full p-2">
                    <Box
                      sx={{
                        fontSize: "25px",
                        color: "#D9F489",
                        fontFamily: "JostBold",
                        background:
                          "linear-gradient(144deg, rgba(1,113,0,0.6) 0%, rgba(1,1,1,0.5) 100%)",
                        p: "5px",
                        borderRadius: "10px",
                        border: "1px solid #90FC6A",
                        textAlign: "center",
                      }}
                    >
                      King of the FUN
                    </Box>
                    <Box
                      className="flex gap-[10px]"
                      sx={{
                        "& p": {
                          color: "#fff",
                          fontFamily: "JostRegular",
                        },
                      }}
                    >
                      <Typography
                        component={"img"}
                        src={kingToken?.logo}
                        width={110}
                        alt=""
                      />
                      <div className="flex flex-col gap-1">
                        <p
                          style={{
                            fontFamily: "JostBold",
                            color: "#fff",
                            fontSize: "18px",
                          }}
                        >
                          {kingToken?.name} [ticker: {kingToken?.ticker}]
                        </p>
                        <div className="flex flex-col gap-1">
                          <p
                            className={`text-base`}
                            style={{ fontSize: "16px" }}
                          >
                            <span className="hidden sm:block">Created by:{" "}</span>
                            <span style={{ color: "#000" }}>
                              {kingToken?.username}
                            </span>
                          </p>

                          {/* <p className={`text-base`}>Replies: {kingToken?.replies}</p> */}
                          <Typography component={"p"} sx={{ fontSize: "14px", display: { sm: "block", xs: "none" } }}>
                            {kingToken?.ticker} is making waves in the meme
                            token space, bringing the moon to your wallet. With
                            a powerful community and viral marketing, it’s
                            quickly become a favorite for meme lovers and crypto
                            traders alike. No presale, no team allocation—just
                            pure meme energy!
                          </Typography>
                          <Typography component={"p"} sx={{ fontSize: "14px", display: { sm: "none", xs: "block" } }}>
                            {kingToken?.ticker}
                          </Typography>
                        </div>
                      </div>
                    </Box>
                    <p
                      style={{
                        fontSize: "16px",
                        color: "#fff",
                        fontFamily: "JostRegular",
                      }}
                    >
                      Market cap: <b>{kingToken?.marketCap.toFixed(2)}k</b>
                    </p>
                  </div>
                </Link>
              </Box>
            )}
          </Grid>
        </Grid>
      </div>

      {/* <div className="z-[9] flex flex-col gap-8">
       
      </div> */}
      <div className="z-10 flex flex-col gap-12">

        <div className="flex flex-col gap-6">
          {/* <div className="flex gap-6">
            <div
              className={clsx(
                `text-2xl cursor-pointer`,
                currentTab === "Following"
                  ? "font-bold text-white"
                  : "font-normal text-[#808080]"
              )}
              onClick={() => setCurrentTab("Following")}
              style={{
                fontFamily:"JostBold"
              }}
            >
              Following
            </div>
            <div
              className={clsx(
                `text-2xl cursor-pointer`,
                currentTab === "Terminal"
                  ? "font-bold text-white"
                  : "font-normal text-[#808080]"
              )}
              onClick={() => setCurrentTab("Terminal")}
               style={{
                fontFamily:"JostBold"
              }}
            >
              Terminal
            </div>
          </div> */}
          {currentTab === "Following" ? (
            <div className="flex flex-col gap-6">
              <p className={`text-xl text-white`}>
                Follow some of your friends to start curating your feed
              </p>
              {wallet.status == "connected" && (
                <div className="flex gap-6">
                  <p className={`text-xl text-white`}>People you may know</p>
                  <button
                    type="button"
                    className={`text-xl text-[#808080]`}
                    onClick={getFollowingData}
                  >
                    [Refresh]
                  </button>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-6">
                {followingList !== null &&
                  followingList.map((item, index) => {
                    return (
                      <div key={index} className="flex flex-col gap-2">
                        <div className="flex gap-2 items-center">
                          <Image
                            className="rounded-full"
                            src={
                              item.avatar === null
                                ? "/img3.png"
                                : `${process.env.NEXT_PUBLIC_AVATAR_URL}/${item.avatar}`
                            }
                            width={24}
                            height={24}
                            alt=""
                          />
                          <p className={`text-xl text-white`}>
                            {item.username}
                          </p>
                        </div>
                        <p className={`text-xl text-[#808080]`}>
                          {item.numFollowers} Followers
                        </p>
                        {item.followed === true ? (
                          <button
                            type="button"
                            className="bg-white rounded-lg text-base w-[200px] h-[37px]"
                            onClick={() => handleUnFollow(item._id)}
                          >
                            UnFollow
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="bg-white rounded-lg text-base w-[200px] h-[37px]"
                            onClick={() => handleFollow(item._id)}
                          >
                            Follow
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Box sx={{
                  "& button": {
                    border: "1px solid #F0FF42",
                    fontFamily: "JostRegular",
                    fontSize: "18px"
                  }
                }} className="flex gap-3">
                  <Listbox value={sortSelected} onChange={setSortSelected}>
                    <ListboxButton
                      className={clsx(
                        `group flex gap-2 justify-between items-center rounded-full px-4 py-[10px] text-sm text-white`,
                        `focus:outline-none data-[focus]:outline-none`
                      )}
                    >
                      {sortSelected.name}
                      <MdOutlineKeyboardArrowDown style={{ fontSize: "1.5rem" }} />

                    </ListboxButton>
                    <Transition
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <ListboxOptions
                        anchor="bottom"
                        className="w-[var(--button-width)] rounded-xl border border-white/5 bg-[#1A1A1A] p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none z-10"
                      >
                        {sortType.map((sort) => (
                          <ListboxOption
                            key={sort.name}
                            value={sort}
                            className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
                            onClick={() =>
                              getTokenList(
                                searchTokenName.current.value,
                                sort.name,
                                orderSelected.name,
                                includeNSFW
                              )
                            }
                          >
                            <CheckIcon className="invisible size-4 fill-white group-data-[selected]:visible" />
                            <div className={`text-sm text-white`} style={{ fontFamily: "JostRegular" }}>
                              {sort.name}
                            </div>
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </Transition>
                  </Listbox>
                  <Listbox value={orderSelected} onChange={setOrderSelected}>
                    <ListboxButton
                      className={clsx(
                        `group flex gap-2 justify-between items-center rounded-full px-4 py-[10px] text-sm text-white`,
                        `focus:outline-none data-[focus]:outline-none`
                      )}
                    >
                      {orderSelected.name}
                      <MdOutlineKeyboardArrowDown style={{ fontSize: "1.5rem" }} />
                    </ListboxButton>
                    <Transition
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <ListboxOptions
                        anchor="bottom"
                        className="w-[var(--button-width)] rounded-xl border border-white/5 bg-[#1A1A1A] p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none z-10"
                      >
                        {orderType.map((order) => (
                          <ListboxOption
                            key={order.name}
                            value={order}
                            className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
                            onClick={() =>
                              getTokenList(
                                searchTokenName.current.value,
                                sortSelected.name,
                                order.name,
                                includeNSFW
                              )
                            }
                          >
                            <CheckIcon className="invisible size-4 fill-white group-data-[selected]:visible" />
                            <div className={`text-sm text-white`} style={{
                              fontFamily: "JostRegular"
                            }}>
                              {order.name}
                            </div>
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </Transition>
                  </Listbox>
                </Box>
                {/* <Box sx={{
                  "& p,button":{
                    fontFamily:"JostRegular",
                    // fontSize:"12px"
                  }
                }} className="flex sm:flex-col gap-4 sm:gap-1">
                  <div className="flex gap-1">
                    <p className={`text-xs text-white`} style={{fontFamily:"JostRegular"}}>Show animations:</p>
                    <div className="flex gap-1 items-center">
                      <button
                        type="button"
                        className={clsx(
                          "rounded-[4px] px-2 text-xs",
                          showAnimations === true
                            ? "bg-white text-black"
                            : "bg-none text-white"
                        )}
                        onClick={() => setShowAnimations(true)}
                      >
                        On
                      </button>
                      <button
                        type="button"
                        className={clsx(
                          "rounded-[4px] px-2 text-xs",
                          showAnimations === true
                            ? "bg-none text-white"
                            : "bg-white text-black"
                        )}
                        onClick={() => setShowAnimations(false)}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <p className={`text-xs text-white`}>Include nsfw:</p>
                    <div className="flex gap-1 items-center">
                      <button
                        type="button"
                        className={clsx(
                          "rounded-[4px] px-2 text-xs",
                          includeNSFW === true
                            ? "bg-white text-black"
                            : "bg-none text-white"
                        )}
                        onClick={() => {
                          setIncludeNSFW(true);
                          getTokenList(
                            searchTokenName.current.value,
                            sortSelected.name,
                            orderSelected.name,
                            true
                          );
                        }}
                      >
                        On
                      </button>
                      <button
                        type="button"
                        className={clsx(
                          "rounded-[4px] px-2 text-xs",
                          includeNSFW === true
                            ? "bg-none text-white"
                            : "bg-white text-black"
                        )}
                        onClick={() => {
                          setIncludeNSFW(false);
                          getTokenList(
                            searchTokenName.current.value,
                            sortSelected.name,
                            orderSelected.name,
                            false
                          );
                        }}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                </Box> */}

                <Box sx={{
                  display: { sm: "flex" },
                  flex: 1,
                  justifyContent: { sm: "flex-end" },

                  "& input": {
                    "&::focus-visble": {
                      outline: "0 !important",
                    },
                    "&:focus": {
                      boxShadow: "none !important",
                    },
                  }
                }}>
                  <div className="relative w-full md:w-1/2">
                    <svg
                      className="absolute right-3 inset-y-[22%] cursor-pointer"
                      width="25"
                      height="25"
                      viewBox="0 0 37 36"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      onClick={() =>
                        getTokenList(
                          searchTokenName.current.value,
                          sortSelected.name,
                          orderSelected.name,
                          includeNSFW
                        )
                      }
                    >
                      <g clipPath="url(#clip0_1_90)">
                        <path
                          d="M27.1461 24.9255L33.5706 31.3485L31.4481 33.471L25.0251 27.0465C22.6352 28.9623 19.6626 30.0044 16.5996 30C9.14761 30 3.09961 23.952 3.09961 16.5C3.09961 9.048 9.14761 3 16.5996 3C24.0516 3 30.0996 9.048 30.0996 16.5C30.104 19.563 29.0619 22.5356 27.1461 24.9255ZM24.1371 23.8125C26.0408 21.8548 27.1039 19.2306 27.0996 16.5C27.0996 10.698 22.4001 6 16.5996 6C10.7976 6 6.09961 10.698 6.09961 16.5C6.09961 22.3005 10.7976 27 16.5996 27C19.3303 27.0043 21.9544 25.9412 23.9121 24.0375L24.1371 23.8125Z"
                          fill="white"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_1_90">
                          <rect
                            width="36"
                            height="36"
                            fill="white"
                            transform="translate(0.0996094)"
                          />
                        </clipPath>
                      </defs>
                    </svg>
                    <input
                      ref={searchTokenName}
                      type="text"
                      className={`w-full pl-3 md:pl-8 pr-10 rounded-full border border-white text-[#808080] text-xl ${EurostileMNFont.className}`}
                      style={{
                        borderColor: "#F0FF42",
                        fontFamily: "JostRegular",
                        fontSize: "16px",
                        color: "#fff",
                        background: "transparent"
                      }}
                      placeholder="Search (name/ticker/address)"
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          getTokenList(
                            searchTokenName.current.value,
                            sortSelected.name,
                            orderSelected.name,
                            includeNSFW
                          );
                      }}
                    />
                  </div>
                </Box>
              </div>
              <Grid container spacing={4} className="mt-2">
                {tokenList !== null &&
                  tokenList.map((item, index) => {
                    return (
                      <Grid item lg={4} sm={6} xs={12} key={index}>
                        <Box height={"100%"} sx={{
                          display: "flex",
                          pt: "10px",
                          position: "relative"
                        }}>


                          <Box>
                            <Typography
                              component={"img"}
                              src={item.logo}
                              sx={{
                                position: "absolute",
                                left: "9px",
                                top: "10px",
                                width: "107px",
                                height: "107px",
                                borderRadius: "50%",
                                zIndex: "2",
                              }}
                              alt=""
                            />
                            <Typography
                              component={"img"}
                              src={image_bg.src}
                              sx={{
                                position: "absolute",
                                bottom: "-4px",
                                // bottom:"0",
                                left: "-5px",
                                // width:"180px",
                                // height:"132px"
                              }}
                              // width={"120px"}
                              // height={"100%"}
                              alt=""
                            />
                          </Box>
                          <Box sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "flex-end",
                          }}>
                            <Box sx={{
                              pl: { md: "4.5rem !important", xs: "5.5rem !important" },
                              background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(153,153,153,1) 100%)",
                              borderRadius: "10px",
                              // position:"relative",
                              height: "120px",
                              width: "85%",
                              "& p,button": {
                                fontFamily: "JostRegular",
                                lineHeight: "normal"
                              }
                            }}>

                              <Link
                                key={index}
                                ref={index === 0 ? tokenDiv : null}
                                href={`/token/${item.tokenAddr}`}
                                className="flex gap-2 items-start p-2"
                              >
                                <Box>
                                  <div className="flex flex-col">
                                    <div className="flex gap-2 items-center">
                                      <p className={`text-xl text-black`} style={{ fontSize: "14px" }}>Created by</p>
                                      <div className="flex gap-1 items-center">
                                        <Image
                                          src={
                                            item.avatar === null
                                              ? "/img3.png"
                                              : `${process.env.NEXT_PUBLIC_AVATAR_URL}/${item.avatar}`
                                          }
                                          width={20}
                                          height={20}
                                          alt=""
                                        />
                                        <Link
                                          href={`/profile/${item.walletAddr}`}
                                          className={`text-xl text-black hover:underline`}
                                          style={{ fontSize: "14px" }}
                                        >
                                          {item.username}
                                        </Link>
                                      </div>
                                    </div>
                                    <p className={`text-xl text-[#339E33]`} style={{ fontSize: "14px" }}>
                                      Market cap: {item.marketCap.toFixed(2)}K
                                    </p>
                                    <p className={`text-xl text-[#000]`} style={{ fontSize: "14px" }}>
                                      Reply: {item.replies}
                                    </p>
                                    <p className={`text-base text-[#000]`} style={{ fontSize: "12px", opacity: "50%", lineHeight: "normal" }}>
                                      {/* <span className="font-bold" style={{fontSize:"10px"}}>{`${item.name} (ticker: ${item.ticker}): `}</span> */}
                                      {item?.desc.slice(0, 50)}...
                                    </p>
                                  </div>
                                </Box>

                              </Link>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    );
                  })}
              </Grid>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
