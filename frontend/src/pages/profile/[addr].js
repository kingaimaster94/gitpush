"use client"

import Image from 'next/image'
import { Rajdhani } from 'next/font/google'
import localFont from 'next/font/local'

import { useRef, useState, useEffect, useContext } from 'react';
import clsx from 'clsx';
import { toast } from "react-toastify"
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { useRouter } from 'next/router';
import Link from 'next/link';

import { useAccount, useChainId, WagmiContext } from 'wagmi';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';

import { getProfileInfo, updateProfile } from '@/api/user';
import { FEE_PRE_DIV, PUMPFUN_ADDRESS_TESTNET, PUMPFUN_ADDRESS, EXPLORER_URL, EXPLORER_URL_TESTNET } from '@/contexts/contracts/constants';
import { pumpfunabi } from '@/contexts/contracts/pumpfun';
import { getUserId } from '@/utils';
import { format } from 'date-fns';
import { Box } from '@mui/material';

const rajdhani = Rajdhani({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['devanagari']
})

const EurostileMNFont = localFont({ src: '../../assets/font/eurostile-mn-extended-bold.ttf' })


export default function MyProfile() {
  const { query } = useRouter();
  const { addr } = query;
  const wallet = useAccount();
  const chainID = useChainId();
  const config = useContext(WagmiContext);


  const [currentTab, setCurrentTab] = useState('Coins Held')
  const [walletAddress, setWalletAddress] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [ownerAddress, setOwnerAddress] = useState(null);
  // const [feeRecipient, setFeeRecipient] = useState(null)
  // const [tradingFee, setTradingFee] = useState(null)
  // const [devMaxBuy, setDevMaxBuy] = useState(null)
  // const [userMaxBuy, setUserMaxBuy] = useState(null)
  
  const [scanAddress, setScanAddress] = useState(EXPLORER_URL)
  const [pumpfunAddress, setPumpfunAddress] = useState(PUMPFUN_ADDRESS);

  useEffect(() => {
    if (chainID == 311) {
      setPumpfunAddress(PUMPFUN_ADDRESS);
      setScanAddress(EXPLORER_URL);
    }
    else if (chainID == 332) {
      setPumpfunAddress(PUMPFUN_ADDRESS_TESTNET);
      setScanAddress(EXPLORER_URL_TESTNET);
    }
    else {
      setPumpfunAddress('');
      setScanAddress("");
    }
  }, [chainID]);

  useEffect(() => {
    if (addr !== undefined && addr !== null)
      setProfileInfo()
    else
      setWalletAddress('')
  }, [addr, wallet])

  const setProfileInfo = async () => {
    setWalletAddress(addr)
    let userId = null
    if (addr === wallet.address)
      userId = getUserId()
    const result = await getProfileInfo(addr, userId);
    setProfileData(result);
  }

  const handleEditProfile = () => {
    if (addr === undefined) {
      toast.error('Please connect wallet!')
      return
    }
    setIsDialogOpen(true)
  }

  const refreshProfileInfo = async () => {
    let userId = null
    if (addr === wallet.address)
      userId = getUserId()
    const result = await getProfileInfo(addr, userId)
    setProfileData(result);
  }

  const onChangeOwner = async (e) => {
    setOwnerAddress(e.target.value);
  };

  // const onChangeFeeRecipient = async (e) => {
  //   setFeeRecipient(e.target.value);
  // };

  // const onChangeTradingFee = async (e) => {
  //   if (Number(e.target.value) < 0) return;
  //   setTradingFee(e.target.value);
  // };

  // const onChangeDevMaxBuy = async (e) => {
  //   if (Number(e.target.value) < 0) return;
  //   setDevMaxBuy(e.target.value);
  // };

  // const onChangeUserMaxBuy = async (e) => {
  //   if (Number(e.target.value) < 0) return;
  //   setUserMaxBuy(e.target.value);
  // };

  const handleDashboardSet = async () => {
    if (ownerAddress === '') {
      toast.warning('Invalid input values!');
      return;
    }

    const id = toast.loading('Updaitng...');

    try {
      const tx = await writeContract(config, {
        abi: pumpfunabi,
        address: pumpfunAddress,
        functionName: "transferOwnership",
        args: [ownerAddress]
      });
      const recipt = await waitForTransactionReceipt(config, { hash: tx });
      toast.dismiss(id);
      toast.success('Updated successfully!');
    } catch (err) {
      console.error(err);
      toast.dismiss(id);
      toast.error(err.message);
    }
  }

  return (
    <Box sx={{
      "& p,a,input,div": {
        fontFamily: "JostRegular",

      }
    }} className={`z-10 flex flex-col items-center gap-20 mx-auto pt-[80px] pb-20 ${rajdhani.className}`}>
      <div className="z-10 flex gap-10 items-center">
        {profileData?.avatar === null && (
          <Image
            src="/img5.png"
            width={200}
            height={200}
            alt=""
          />
        )}
        {profileData !== null && profileData?.avatar !== null && (
          <Image
            className='rounded-full'
            src={profileData?.avatar === null ? "/img3.png" : `${process.env.NEXT_PUBLIC_AVATAR_URL}/${profileData?.avatar}`}
            width={200}
            height={200}
            alt=""
          />
        )}
        <div className='flex flex-col gap-2'>
          <p className='text-[32px] text-white font-bold'>@{profileData?.username}</p>
          <div className='flex flex-col gap-1'>
            <p className='text-xl text-white'>{profileData?.followers} followers</p>
            {wallet.address === addr && (
              <button type='button' className='flex gap-[10px] items-center border border-white rounded-lg w-fit px-3 py-2' onClick={handleEditProfile} style={{
                background: "rgb(163 191 86 / 49%)",
                border: "2px solid rgb(240 255 66 / 64%)",
                fontSize: "16px",
                textTransform: "capitalize",
                fontFamily: "JostRegular",
              }}>
                <p className='text-xl text-white'>Edit Profile</p>
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.46001 21.74L21.25 6.95L17.55 3.25L2.75999 18.04L2.75 21.75L6.46001 21.74Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15.3496 6.63L17.8696 9.14999" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <div className='flex items-center gap-9'>
              <div className='flex items-center gap-2'>
                <p className='text-xl text-[#FF3131]'>Likes received: {profileData?.likes}</p>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.25 8.71997C21.25 9.87997 20.81 11.05 19.92 11.94L18.44 13.42L12.07 19.79C12.04 19.82 12.03 19.83 12 19.85C11.97 19.83 11.96 19.82 11.93 19.79L4.08 11.94C3.19 11.05 2.75 9.88997 2.75 8.71997C2.75 7.54997 3.19 6.37998 4.08 5.48998C5.86 3.71998 8.74 3.71998 10.52 5.48998L11.99 6.96997L13.47 5.48998C15.25 3.71998 18.12 3.71998 19.9 5.48998C20.81 6.37998 21.25 7.53997 21.25 8.71997Z" stroke="#FF3131" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className='flex items-center gap-2'>
                <p className='text-xl text-[#97FF73]'>Mentions received: {profileData?.mentions}</p>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.2203 16.62C20.2203 17.47 19.5303 18.16 18.6803 18.16H5.32028C4.47028 18.16 3.78027 17.47 3.78027 16.62C3.78027 15.77 4.47028 15.08 5.32028 15.08H5.83026V9.94002C5.83026 6.54002 8.59027 3.77002 12.0003 3.77002C13.7003 3.77002 15.2403 4.46002 16.3603 5.58002C17.4803 6.69002 18.1703 8.23002 18.1703 9.94002V15.08H18.6803C19.5303 15.08 20.2203 15.77 20.2203 16.62Z" stroke="#97FF73" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 3.78V2.75" stroke="#97FF73" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15.0799 18.17C15.0799 19.88 13.6999 21.25 11.9999 21.25C10.2999 21.25 8.91992 19.87 8.91992 18.17H15.0799Z" stroke="#97FF73" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <input type="text" style={{
              background: "rgba(0, 0, 0, 0.22)",
              fontSize: "16px"
            }} className='h-[50px] bg-black text-xl text-white border border-none p-3 rounded-xl' value={walletAddress} disabled />
            {addr !== undefined && (
              <a href={`${scanAddress}/address/${addr}`} style={{ opacity: "0.6", fontSize: "15px" }} target='_blank' className='text-xl text-white'>View on Omaxscan</a>
            )}
          </div>
        </div>
      </div>
      <div className='z-10 flex flex-col items-center gap-6 w-full'>
        <div className='flex gap-6'>
          <div className={clsx('text-base cursor-pointer', currentTab === 'Coins Held' ? 'font-bold text-white' : 'text-[#808080]')} onClick={() => setCurrentTab('Coins Held')}>Coins Held</div>
          <div className={clsx('text-base cursor-pointer', currentTab === 'Coin Created' ? 'font-bold text-white' : 'text-[#808080]')} onClick={() => setCurrentTab('Coin Created')}>Coin Created</div>
          {addr === wallet.address && (
            <div className='flex gap-6'>
              <div className={clsx('text-base cursor-pointer', currentTab === 'Replies' ? 'font-bold text-white' : 'text-[#808080]')} onClick={() => setCurrentTab('Replies')}>Replies</div>
              <div className={clsx('text-base cursor-pointer', currentTab === 'Notifications' ? 'font-bold text-white' : 'text-[#808080]')} onClick={() => setCurrentTab('Notifications')}>Notifications</div>
            </div>
          )}
          <div className={clsx('text-base cursor-pointer', currentTab === 'Followers' ? 'font-bold text-white' : 'text-[#808080]')} onClick={() => setCurrentTab('Followers')}>Followers</div>
          <div className={clsx('text-base cursor-pointer', currentTab === 'Following' ? 'font-bold text-white' : 'text-[#808080]')} onClick={() => setCurrentTab('Following')}>Following</div>
          {wallet.address === process.env.NEXT_PUBLIC_OWNER_ADDRESS && addr === wallet.address && (
            <div className={clsx('text-base cursor-pointer', currentTab === 'Dashboard' ? 'font-bold text-white' : 'text-[#808080]')} onClick={() => setCurrentTab('Dashboard')}>Dashboard</div>
          )}
        </div>
        {currentTab === 'Coins Held' && (
          <div className='flex flex-col items-center gap-6 max-w-md w-full'>
            {profileData?.coinsHeld.map((item, index) => {
              return (
                <div key={index} className='flex items-center gap-3 w-full'>
                  <Image
                    src={item.logo}
                    width={60}
                    height={60}
                    alt=""
                  />
                  <div className='flex flex-col w-full'>
                    <div className='flex justify-between'>
                      <p className='text-xl text-white'>{item.balance.toFixed(0)} {item.ticker}</p>
                      <div className='text-xl text-white cursor-pointer'>[Refresh]</div>
                    </div>
                    <div className='flex justify-between'>
                      <p className='text-xl text-[#97FF73]'>{item.lamports.toFixed(3)} OMAX</p>
                      <Link href={`/token/${item.tokenAddr}`} className='text-xl text-[#97FF73] cursor-pointer'>[View Coin]</Link>
                    </div>
                  </div>
                </div>
              )
            })}
            <div className='flex gap-6 justify-center'>
              <button type='button' className='text-xl text-white'>{'[<<]'}</button>
              <button type='button' className='text-xl text-white p-1'>1</button>
              <button type='button' className='text-xl text-white'>{'[>>]'}</button>
            </div>
          </div>
        )}
        {currentTab === 'Coin Created' && (
          <div className='flex flex-col items-center justify-center gap-6 max-w-md w-full'>
            {profileData?.coinsCreated.map((item, index) => {
              return (
                <div key={index} className='flex items-center gap-3 w-full'>
                  <Image
                    src={item.logo}
                    width={100}
                    height={100}
                    alt=""
                  />
                  <div className='flex flex-col'>
                    <div className='flex items-center gap-1'>
                      <p className='text-xl text-white'>Created by</p>
                      <Link href={`/profile/${item.walletAddr}`} className='flex items-center gap-1'>
                        <Image
                          src={item.avatar === null ? "/img3.png" : `${process.env.NEXT_PUBLIC_AVATAR_URL}/${item.avatar}`}
                          width={16}
                          height={16}
                          alt=""
                        />
                        <p className='text-xl text-white'>{item.username}</p>
                      </Link>
                    </div>
                    <p className='text-xl text-white'>market cap: {item.marketCap.toFixed(2)}K</p>
                    <p className='text-xl text-white'>replies: {item.replies}</p>
                    <p className='text-xl text-white'>{`${item.tokenName} (ticker: ${item.ticker}): ${item.desc}`}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {currentTab === 'Replies' && (
          <div className='flex flex-col gap-6 max-w-lg w-full'>
            {profileData?.replies.map((item, index) => {
              return (
                <div className='flex flex-col gap-2' key={index}>
                  <div className='flex gap-2 items-center'>
                    <p className='text-xl text-white'>{item.replierId.username}</p>
                    <p className='text-xl text-white'>{format(new Date(item.cdate), "MM/dd/yyyy, HH:mm:ss")}</p>
                    <p className='text-xl text-[#97FF73]'>{`# ${item.replierId._id}`}</p>
                  </div>
                  <div className='flex gap-2 items-center'>
                    <p className='text-xl text-[#97FF73]'>{`# ${item._id}`}</p>
                    <p className='text-xl text-white'>{item.comment}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {currentTab === 'Notifications' && (
          <div className='flex flex-col gap-6 max-w-md w-full'>
            {profileData?.notifications.likes.map((item, index) => {
              if (item.length !== 0) {
                return (
                  <div key={index} className='flex gap-2 items-center'>
                    <div class="text-red-500 mt-1"><svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.35248 4.90532C1.35248 2.94498 2.936 1.35248 4.89346 1.35248C6.25769 1.35248 6.86058 1.92336 7.50002 2.93545C8.13946 1.92336 8.74235 1.35248 10.1066 1.35248C12.064 1.35248 13.6476 2.94498 13.6476 4.90532C13.6476 6.74041 12.6013 8.50508 11.4008 9.96927C10.2636 11.3562 8.92194 12.5508 8.00601 13.3664C7.94645 13.4194 7.88869 13.4709 7.83291 13.5206C7.64324 13.6899 7.3568 13.6899 7.16713 13.5206C7.11135 13.4709 7.05359 13.4194 6.99403 13.3664C6.0781 12.5508 4.73641 11.3562 3.59926 9.96927C2.39872 8.50508 1.35248 6.74041 1.35248 4.90532Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg></div>
                    <p className='text-xl text-white'>{`${item[0]} liked your comment`}</p>
                  </div>
                )
              }
            })}
            {profileData?.notifications.mentions.map((item, index) => {
              return (
                <div key={index} className='flex gap-2'>
                  <div class="text-green-300 mt-1"><svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 3L2.5 3.00002C1.67157 3.00002 1 3.6716 1 4.50002V9.50003C1 10.3285 1.67157 11 2.5 11H7.50003C7.63264 11 7.75982 11.0527 7.85358 11.1465L10 13.2929V11.5C10 11.2239 10.2239 11 10.5 11H12.5C13.3284 11 14 10.3285 14 9.50003V4.5C14 3.67157 13.3284 3 12.5 3ZM2.49999 2.00002L12.5 2C13.8807 2 15 3.11929 15 4.5V9.50003C15 10.8807 13.8807 12 12.5 12H11V14.5C11 14.7022 10.8782 14.8845 10.6913 14.9619C10.5045 15.0393 10.2894 14.9965 10.1464 14.8536L7.29292 12H2.5C1.11929 12 0 10.8807 0 9.50003V4.50002C0 3.11931 1.11928 2.00003 2.49999 2.00002Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg></div>
                  <div className='flex flex-col'>
                    <p className='text-xl text-white'>{`${item.username} mentioned you in a comment`}</p>
                    <p className='text-xl text-white'>{`${item.comment}`}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {currentTab === 'Followers' && (
          <div className='flex flex-col items-center justify-center gap-6 max-w-md w-full'>
            {profileData?.followersList.map((item, index) => {
              return (
                <div key={index} className='flex items-center justify-center gap-8 w-full'>
                  <Link href={`/profile/${item.walletAddr}`} className='flex items-center gap-1'>
                    <Image
                      src={item.avatar === null ? "/img3.png" : `${process.env.NEXT_PUBLIC_AVATAR_URL}/${item.avatar}`}
                      width={16}
                      height={16}
                      alt=""
                    />
                    <p className='text-xl text-white'>{item.username}</p>
                  </Link>
                  <p className='text-xl text-white'>{`${item.followers} followers`}</p>
                </div>
              )
            })}
          </div>
        )}
        {currentTab === 'Following' && (
          <div className='flex flex-col items-center justify-center gap-6 max-w-sm w-full'>
            {profileData?.followingsList.map((item, index) => {
              return (
                <div key={index} className='flex items-center gap-8'>
                  <Link href={`/profile/${item.walletAddr}`} className='flex gap-2 items-center'>
                    <Image
                      src={item.avatar === null ? "/img3.png" : `${process.env.NEXT_PUBLIC_AVATAR_URL}/${item.avatar}`}
                      width={16}
                      height={16}
                      alt=""
                    />
                    <p className='text-xl text-white'>{item.username}</p>
                  </Link>
                  <p className='text-xl text-white'>{`${item.followers} followers`}</p>
                </div>
              )
            })}
          </div>
        )}
        {currentTab === 'Dashboard' && wallet.address === process.env.NEXT_PUBLIC_OWNER_ADDRESS && addr === wallet.address && (
          <div className='flex flex-col gap-4 w-full max-w-xl pb-4'>
            <div className="flex flex-col gap-2 w-full">
              <p className='text-2xl font-bold text-white'>Owner Address</p>
              <input value={ownerAddress} onChange={onChangeOwner} type="text" className={`w-full h-[69px] rounded-xl px-6 border border-white text-[#808080] bg-[#121212] text-base ${EurostileMNFont.className}`} />
            </div>
            {/* <div className="flex flex-col gap-2 w-full">
              <p className='text-2xl font-bold text-white'>Fee Recipent</p>
              <input value={feeRecipient} onChange={onChangeFeeRecipient} type="text" className={`w-full h-[69px] rounded-xl px-6 border border-white text-[#808080] bg-[#121212] text-base ${EurostileMNFont.className}`} />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <p className='text-2xl font-bold text-white'>Trading Fee (%)</p>
              <input value={tradingFee} onChange={onChangeTradingFee} type="number" className={`w-full h-[69px] rounded-xl px-6 border border-white text-[#808080] bg-[#121212] text-base ${EurostileMNFont.className}`} />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <p className='text-2xl font-bold text-white'>Dev Max Buy (%)</p>
              <input value={devMaxBuy} onChange={onChangeDevMaxBuy} type="number" className={`w-full h-[69px] rounded-xl px-6 border border-white text-[#808080] bg-[#121212] text-base ${EurostileMNFont.className}`} />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <p className='text-2xl font-bold text-white'>User Max Buy (%)</p>
              <input value={userMaxBuy} onChange={onChangeUserMaxBuy} type="number" className={`w-full h-[69px] rounded-xl px-6 border border-white text-[#808080] bg-[#121212] text-base ${EurostileMNFont.className}`} />
            </div> */}
            <button type="button" className={`bg-white rounded-full w-full h-14 text-base ${EurostileMNFont.className}`} onClick={handleDashboardSet}>Set</button>
          </div>
        )}
      </div>
      <EditProfileDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} profileData={profileData} refreshProfileInfo={refreshProfileInfo} />
    </Box>
  )
}

function EditProfileDialog({ isDialogOpen, setIsDialogOpen, profileData, refreshProfileInfo }) {
  const [profileImage, setProfileImage] = useState(null);
  const [uploadProfileImage, setUploadProfileImage] = useState(null)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    if (profileData !== null) {
      setUsername(profileData.username)
      setBio(profileData.bio)
    }
  }, [profileData])

  const handleUpdateProfile = async () => {
    if (uploadProfileImage === null) {
      toast.error('Please change photo!')
      return
    }
    if (username === '') {
      toast.error('Please input username!')
      return
    }

    const formData = new FormData()
    formData.append('avatar', uploadProfileImage)
    formData.append('username', username)
    formData.append('bio', bio)

    await updateProfile(formData)
    setIsDialogOpen(false)
    refreshProfileInfo()
  }

  return (
    <Transition appear show={isDialogOpen}>
      <Dialog as="div" className={`relative z-30 focus:outline-none ${rajdhani.className}`} onClose={() => setIsDialogOpen(false)}>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <Box
            sx={{
              "& p,textarea,input,button,div": {
                fontFamily: "JostRegular",
              },
              "& textarea, & input": {
                "&:focus": {
                  border: "none",
                  boxShadow: "none",
                },
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
                <p className="text-[28px] text-bold text-white">Edit Profile</p>
                <div className="flex flex-col gap-6 justify-center items-center">
                  <p className="text-xl text-white font-bold text-left w-full">
                    Profile photo
                  </p>
                  <div className="relative">
                    {profileData?.avatar !== null && profileImage === null && (
                      <Image
                        className="rounded-full"
                        src={
                          profileData?.avatar === null
                            ? "/img3.png"
                            : `${process.env.NEXT_PUBLIC_AVATAR_URL}/${profileData?.avatar}`
                        }
                        width={120}
                        height={120}
                        alt=""
                      />
                    )}
                    {(profileData?.avatar === null && profileImage === null) && (
                      <Image
                        className='rounded-full'
                        src="/img5.png"
                        width={120}
                        height={120}
                        alt=""
                      />
                    )}
                    {(profileImage !== null) && (
                      <Image
                        className='rounded-full'
                        src={profileImage}
                        width={120}
                        height={120}
                        alt=""
                      />
                    )}
                    <label htmlFor="profileImage" className=''>
                      <svg className='absolute -right-4 bottom-0 cursor-pointer' width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="40" height="40" rx="20" fill="white" />
                        <path d="M14.46 29.24L29.25 14.45L25.55 10.75L10.76 25.54L10.75 29.25L14.46 29.24Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M23.3496 14.13L25.8696 16.65" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <input id='profileImage' type='file' className='hidden' accept='image/*' onChange={(e) => {
                        let src = null
                        if (e.target.files.length > 0) {
                          src = URL.createObjectURL(e.target.files[0])
                          setProfileImage(src)
                          setUploadProfileImage(e.target.files[0])
                        }
                        else
                          setProfileImage('')
                      }} />
                    </label>
                  </div>
                </div>
                <div className='flex flex-col gap-2'>
                  <p className='text-2xl text-white font-bold'>Username</p>
                  <input type="text" className={`w-full h-[69px] bg-[#121212] pl-6 rounded-xl border border-white text-[#808080] text-base ${EurostileMNFont.className}`} placeholder='Your Name' onChange={(e) => setUsername(e.target.value)} value={username} />
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <p className='text-xl font-bold text-white'>Bio</p>
                  <textarea
                    className={`w-full h-[146px] rounded-xl px-6 py-4 border border-none text-[#808080] bg-[#121212] text-base resize-none`}
                    style={{
                      background: "rgba(0, 0, 0, 0.22)",
                    }}
                    placeholder="Bio"
                    onChange={(e) => setBio(e.target.value)}
                    value={bio}
                  ></textarea>
                </div>
                <div className='flex flex-col gap-3 items-center'>
                  <button
                    style={{
                      background: "#F0FF42",
                      color: "#000",
                      fontFamily: "JostBold",
                      height: "45px",
                    }}
                    type="button"
                    className="bg-white rounded-xl w-full h-[50px] text-xl font-bold"
                    onClick={handleUpdateProfile}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="rounded-xl w-full h-[50px] text-xl text-white underline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </Box>
        </div>
      </Dialog>
    </Transition>
  )
}