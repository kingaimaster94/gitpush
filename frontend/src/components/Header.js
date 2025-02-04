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

  const mounted = useIsMounted();

  const [ws, setWs] = useState(undefined)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const div1Ref = useRef(null)
  const div2Ref = useRef(null)
  const [lastTokenInfo, setLastTokenInfo] = useState(null)
  const [lastTradeInfo, setLastTradeInfo] = useState(null)
  const baseURL = `${process.env.NEXT_PUBLIC_SOCKET_URL}`;

  async function connectWallet() {
    modal.open();
  }

  async function disconnectWallet() {
    modal.open();
  }

  useEffect(() => {
    if (wallet.address !== null && wallet.isConnected === false)
      login(wallet.address);
    if (wallet.isDisconnected === true)
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
        // console.log(data)
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
    <header className="z-20 flex flex-col gap-2 items-center px-5 py-7" style={{
      background: "#4FCB4F",
      borderRadius: "50px"
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

          <div className="flex gap-4 items-center">
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
                <p className={`text-sm 2xl:text-xl ${rajdhani.className}`}>{lastTradeInfo.isBuy === true ? 'bought' : 'sold'} {lastTradeInfo.quoteAmount} OMAX of</p>
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
          </div>
        </div>
        <Box className="hidden xl:flex gap-5" sx={{
          "& a,p": {
            fontFamily: "JostBold",
            fontSize: "18px",
            color: "#fff",
            cursor: "pointer"
          }
        }}>
          <Link href={"/"}>
            Home
          </Link>
          <Link href={"/create"}>
            Launch
          </Link>
          <Typography onClick={() => setIsDialogOpen(true)}>
            Docs
          </Typography>
        </Box>
        <div className="flex gap-4 items-center">
          <div className="hidden xl:flex gap-2 items-center">

            <a href="https://nextjs.org" target="_blank">
              <Typography component={"img"} src={logos_telegram.src} width={"36px"} height={"36px"} />
            </a>
            <a href="https://nextjs.org" target="_blank">
              <Typography component={"img"} src={prime_twitter.src} width={"36px"} height={"36px"} />
            </a>
          </div>

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
          }} className="flex gap-2 items-center"
            onClick={
              wallet.address
                ? () => disconnectWallet()
                : () => connectWallet()
            }
          >
            {wallet.address !== null && (
              <Link href={`/profile/${wallet.address}`}>
                <UserCircleIcon className="size-8 fill-white" style={{
                  width: "42px",
                  height: "42px"
                }} />
              </Link>
            )}
          </Box>
        </div>
      </div>
      {lastTradeInfo !== null && (
        <div ref={div2Ref} className="flex sm:hidden gap-1 p-4 items-center bg-[#FF3131] rounded-xl h-[58px]">
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
          <p className={`text-sm 2xl:text-xl ${rajdhani.className}`}>{lastTradeInfo.isBuy === true ? 'bought' : 'sold'} {lastTradeInfo.quoteAmount} OMAX of</p>
          <Link href={`/${lastTradeInfo.tokenAddr}`} className="flex items-center gap-1">
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
      <HowItWorksDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
    </header>
  )
}

function HowItWorksDialog({ isDialogOpen, setIsDialogOpen }) {
  return (
    <Transition appear show={isDialogOpen}>
      <Dialog as="div" className={`relative z-30 focus:outline-none ${rajdhani.className}`} onClose={() => setIsDialogOpen(false)}>
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
              <DialogPanel className="flex flex-col gap-8 p-10 w-full max-w-xl rounded-3xl bg-[#0B1821] border-none backdrop-blur-2xl">
                <p className='text-[32px] text-bold text-white text-center' style={{ fontFamily: "JostRegular", fontSize: "20px", fontWeight: "bold" }}>How it works</p>
                <p className='text-xl text-white text-center' style={{ fontFamily: "JostRegular", }}>Pump prevents rugs by making sure that all created tokens are safe. Each coin on pump is a <span className='text-[#5FE461]'>fair-launch</span> with no presale and <span className='text-[#F0FF42]'>no team allocation.</span></p>
                <Box sx={{
                  "& p,div,button": {
                    fontFamily: "JostRegular",
                    fontSize: "16px"
                  }
                }} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <div className="px-3 py-1 border border-none rounded-lg text-xl text-black w-fit bg-[#5FE461]">
                      Step 01
                    </div>
                    <p className="text-xl text-white">Pick a coin that you like</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="px-3 py-1 border border-none rounded-lg text-xl text-black w-fit bg-[#5FE461]">
                      Step 02
                    </div>
                    <p className="text-xl text-white">Buy the coin on the bonding curve</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="px-3 py-1 border border-none rounded-lg text-xl text-black w-fit bg-[#5FE461]">
                      Step 03
                    </div>
                    <p className="text-xl text-white">Sell at any time to lock in your profits or losses</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="px-3 py-1 border border-none rounded-lg text-xl text-black w-fit bg-[#5FE461]">
                      Step 04
                    </div>
                    <p className="text-xl text-white">When enough people buy on the bonding curve it reaches a market cap of $69k</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="px-3 py-1 border border-none rounded-lg text-xl text-black w-fit bg-[#5FE461]">
                      Step 05
                    </div>
                    <p className="text-xl text-white">$12k of liquidity is then deposited in Omax protocol and burned</p>
                  </div>
                </Box>
                <button style={{
                  background: "#F0FF42",
                  fontFamily: "JostRegular",
                  fontSize: "16px",
                  fontWeight: "600"
                }} type="button" className="bg-white rounded-xl text-xl font-bold p-3" onClick={() => setIsDialogOpen(false)}>I&apos;m ready to pump</button>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}