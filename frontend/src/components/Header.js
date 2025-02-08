"use client"

import Image from "next/image"
import Link from "next/link"
import { Rajdhani } from 'next/font/google'
import localFont from 'next/font/local'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { useRef, useState, useEffect } from "react"
import { UserCircleIcon } from '@heroicons/react/20/solid'
import { useLogin } from "@/hooks/auth/useLogin"
import { format } from "date-fns";
import { useLogout } from "@/hooks/auth/useLogout";
import logo from "../assets/images/logo.png";
import logos_telegram from "../assets/images/logos_telegram.png";
import prime_twitter from "../assets/images/prime_twitter.png";
import { useAccount } from "wagmi";
import {
  createWeb3Modal,
  useWeb3Modal,
  useWeb3ModalEvents,
  useWeb3ModalState,
  useWeb3ModalTheme,
} from '@web3modal/wagmi/react';

import useIsMounted from "./useIsMounted"
import {
  DATATYPE_LASTTOKEN,
  DATATYPE_LASTTRADE
} from "../engine/consts";
import { Box, Typography } from "@mui/material";
import { usePathname } from "next/navigation";
import MobileDrawer from "./MobileDrawer"


const EurostileMNFont = localFont({ src: '../assets/font/eurostile-mn-extended-bold.ttf' })

const rajdhani = Rajdhani({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['devanagari']
})

export default function Header() {
  const wallet = useAccount();
  const modal = useWeb3Modal();
  const state = useWeb3ModalState();
  const events = useWeb3ModalEvents();
  const { themeMode, themeVariables, setThemeMode } = useWeb3ModalTheme();

  const { login } = useLogin();
  const { logout } = useLogout();
  const pathname = usePathname();

  const mounted = useIsMounted();

  const [ws, setWs] = useState(undefined)
  const div1Ref = useRef(null)
  const div2Ref = useRef(null)
  const [lastTokenInfo, setLastTokenInfo] = useState(null)
  const [lastTradeInfo, setLastTradeInfo] = useState(null)
  const baseURL = `${process.env.NEXT_PUBLIC_SOCKET_URL}`;

  async function connectWallet() {
    modal.open();
  }

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen((prevState) => !prevState);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };


  useEffect(() => {
    if (wallet.status == "connected")
      login(wallet.address);
    if (wallet.status === "disconnected")
      logout();
  }, [wallet])

  useEffect(() => {
    const websocket = new WebSocket(baseURL)
    setWs(websocket)
    websocket.onopen = () => {
      console.log("websocket opened!")
    }

    websocket.onmessage = (event) => {
      console.log("websocket onmessage!")
      const data = JSON.parse(atob(event.data)).message;

      if (data.type === DATATYPE_LASTTOKEN)
        setLastTokenInfo(data.data)
      else if (data.type === DATATYPE_LASTTRADE) {
        setLastTradeInfo(data.data)
        getCheckoutStatus()
      }
    }
  }, [])

  const getCheckoutStatus = () => {
    if (div1Ref.current) {
      if (div1Ref.current.classList.contains('animate-shake') === true)
        div1Ref.current.classList.remove('animate-shake')
      else
        div1Ref.current.classList.add('animate-shake')

      if (div2Ref.current.classList.contains('animate-shake') === true)
        div2Ref.current.classList.remove('animate-shake')
      else
        div2Ref.current.classList.add('animate-shake')
    }
  }

  return (
    <header className="z-20 flex flex-col gap-2 items-center px-5 py-2" style={{
      background: "#4FCB4F",
      borderRadius: "50px",
      marginTop: "20px"
    }}>
      <div className="flex justify-between items-center w-full">
        <div className="flex gap-2 items-center">
          <Link href="/">
            <Typography
              component={"img"}
              className="rounded-full"
              src={logo.src}
              width={"146px"}
              alt=""
              priority={true}
            />
          </Link>

          {/* <div className="flex gap-4 items-center">
            {lastTradeInfo !== null && (
              <div ref={div1Ref} className="hidden sm:flex gap-1 p-4 items-center bg-[#FF3131] rounded-xl h-[58px]">
                <Link href={`/profile/${lastTradeInfo.walletAddr}`} className="flex items-center gap-1 hover:underline">
                  <Image
                    className="rounded-full"
                    src={lastTradeInfo.avatar === null ? "/img3.png" : `${process.env.NEXT_PUBLIC_AVATAR_URL}/${lastTradeInfo.avatar}`}
                    width={24}
                    height={24}
                    alt=""
                  />
                  <p className={`text-sm 2xl:text-xl ${rajdhani.className}`}>{lastTradeInfo.username}</p>
                </Link>
                <p className={`text-sm 2xl:text-xl ${rajdhani.className}`}>{lastTradeInfo.isBuy === true ? 'bought' : 'sold'} {lastTradeInfo.omaxAmount} OMAX of</p>
                <Link href={`/token/${lastTradeInfo.tokenAddr}`} className="flex items-center gap-1">
                  <p className={`text-sm 2xl:text-xl hover:underline ${rajdhani.className}`}>{lastTradeInfo.tokenName}</p>
                  <Image
                    className="rounded-full"
                    src={lastTradeInfo.logo}
                    width={24}
                    height={24}
                    alt=""
                  />
                </Link>
              </div>
            )}
            {lastTokenInfo !== null && (
              <div className="hidden lg:flex gap-1 p-4 items-center bg-[#FFCC48] rounded-xl h-[58px]">
                <Link href={`/profile/${lastTokenInfo.walletAddr}`} className="flex items-center gap-1 hover:underline">
                  <Image
                    className="rounded-full"
                    src={lastTokenInfo.avatar === null ? "/img3.png" : `${process.env.NEXT_PUBLIC_AVATAR_URL}/${lastTokenInfo.avatar}`}
                    width={24}
                    height={24}
                    alt=""
                  />
                  <p className={`text-sm 2xl:text-xl ${rajdhani.className}`}>{lastTokenInfo.username}</p>
                </Link>
                <p className={`text-sm 2xl:text-xl ${rajdhani.className}`}>created</p>
                <Link href={`/token/${lastTokenInfo.tokenAddr}`} className="flex items-center gap-1">
                  <p className={`text-sm 2xl:text-xl hover:underline ${rajdhani.className}`}>{lastTokenInfo.token}</p>
                  <Image
                    className="rounded-full"
                    src={lastTokenInfo.logo}
                    width={24}
                    height={24}
                    alt=""
                  />
                </Link>
                <p className={`text-sm 2xl:text-xl ${rajdhani.className}`}>on {format(new Date(lastTokenInfo.cdate || null), "MM/dd/yyyy")}</p>
              </div>
            )}
          </div> */}
        </div>
        
        <Box className="hidden xl:flex gap-5" sx={{
          "& a,p": {
            fontFamily: "JostBold",
            fontSize: "18px",
            color: "#fff",
            cursor: "pointer"
          }
        }}>
          <Link style={{ color: pathname == "/" ? "#1005cf" : "#ffffff", textDecoration: pathname == "/" ? "underline" : "none", textUnderlineOffset: "5px" }} href={"/"}>
            Home
          </Link>
          <Link style={{ color: pathname == "/create" ? "#1005cf" : "#ffffff", textDecoration: pathname == "/create" ? "underline" : "none", textUnderlineOffset: "5px" }} href={"/create"}>
            Launch
          </Link>
          <Link style={{ color: "#ffffff" }} href={"https://docs.omax.fun"} target={"_blank"}>
            Docs
          </Link>
        </Box>
        <div className="flex gap-4 items-center">
          <div className="hidden xl:flex gap-2 items-center">

            <a href="https://t.me/omaxfun" target="_blank">
              <Typography component={"img"} src={logos_telegram.src} width={"36px"} height={"36px"} />
            </a>
            <a href="https://x.com/omaxchain" target="_blank">
              <Typography component={"img"} src={prime_twitter.src} width={"36px"} height={"36px"} />
            </a>
          </div>
          <MobileDrawer  open={drawerOpen} onClose={closeDrawer} onOpen={toggleDrawer} />
          <Box sx={{
            "& .wallet-adapter-button": {
              backgroundColor: "#F0FF42",
              color: "#000",
              fontSize: "14px",
              fontFamily: "JostBold",
              borderRadius: "50px",
              height: "44px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
              "&:hover": {
                backgroundColor: "#F0FF42 !important",
              }
            }
          }} className="flex gap-2 items-center">
            {(wallet.status == "disconnected" || wallet.status == "connecting" || wallet.status == "reconnecting") && (
              <div className="text-md font-bold bg-[#F0FF42] shadow-2xl px-4 py-2 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-white hover:bg-white/10 transition"
                onClick={() => connectWallet()}
              >
                CONNECT
              </div>
            )}
            {(wallet.status == "connected") && (
              <Link href={wallet.isDisconnected ? "/#" : `/profile/${wallet.address}`}>
                <UserCircleIcon className="size-8 fill-white" style={{
                  width: "42px",
                  height: "42px"
                }}
                  onClick={() => connectWallet()}
                />
              </Link>
            )}
          </Box>
        </div>
      </div>
    </header>
  )
}