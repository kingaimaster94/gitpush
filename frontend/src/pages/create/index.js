"use client";

import { Rajdhani } from "next/font/google";
import localFont from "next/font/local";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { useRef, useState, useContext, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useAccount, useChainId, WagmiContext } from "wagmi";
import { writeContract, readContracts, waitForTransactionReceipt, getBlock } from "@wagmi/core";
import { parseEther } from "viem";
import { pumpfunabi } from "@/contexts/contracts/pumpfun";
import { PUMPFUN_ADDRESS, PUMPFUN_ADDRESS_TESTNET, EXPLORER_URL, EXPLORER_URL_TESTNET } from "@/contexts/contracts/constants";
import { decimalToEth } from "@/engine/utils";

import { createMetadata } from "../../engine/createMetadata";
import { updateToken } from "@/api/token";
import { Box, Button, Checkbox, Grid, Typography } from "@mui/material";
import telegram from "../../assets/images/telegram.svg";
import web from "../../assets/images/web.svg";
import x from "../../assets/images/x.svg";
import upload from "../../assets/images/upload.svg";
import img_1 from "../../assets/images/img_1.svg";
import img_2 from "../../assets/images/img_2.svg";
import img_3 from "../../assets/images/img_3.svg";

const rajdhani = Rajdhani({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["devanagari"],
});

const EurostileMNFont = localFont({
  src: "../../assets/font/eurostile-mn-extended-bold.ttf",
});

export default function CreateCoin() {
  const wallet = useAccount();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const coinName = useRef(null);
  const ticker = useRef(null);
  const description = useRef(null);
  const [coinImage, setCoinImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imgBuffer, setImageBuffer] = useState();
  const twitterLink = useRef(null);
  const telegramLink = useRef(null);
  const website = useRef(null);

  const handleCreateCoin = () => {
    if (coinName.current?.value === "") {
      toast.error("No name!");
      return;
    }
    if (imageName === "") {
      toast.error("No image uploaded!");
      return;
    }
    if (ticker.current?.value === "") {
      toast.error("No ticker!");
      return;
    }
    if (wallet.status == "disconnected") {
      toast.error("Not connected wallet!");
      return;
    }

    setIsDialogOpen(true);
  };

  const handleFileRead = (event) => {
    const imageBuffer = event.target.result;
    // console.log('imageBuffer:', imageBuffer);
    setImageBuffer(imageBuffer);
  };

  return (
    <Box
      component={"section"}
      sx={{
        "& p,input,div,button,span,label,textarea": {
          fontFamily: "JostRegular",
        },
        "& input,textarea": {
          background: "rgba(148, 163, 184, 0.1)",
          border: "none !important",
          color: "#fff",
          fontSize: "16px",
          height: "55px",
          borderRadius: "5px",
          "&::placeholder": {
            // fontFamily:"Afacad",
            color: "#fff",
          },
          "&::focus-visble": {
            outline: "0 !important",
          },
          "&:focus": {
            background: "rgba(148, 163, 184, 0.1)",
            boxShadow: "none !important",
          },
        },
        "& textarea": {
          height: "179px",
        },
      }}
      className={`flex flex-col gap-1 sm:max-w-[930px] w-full mx-auto pt-10 sm:pt-[80px] px-4 pb-20 ${rajdhani.className}`}
    >
      <Typography
        sx={{
          fontFamily: "JostBold !important",
          fontSize: "32px",
          color: "#5FE461",
          textAlign: "center",
          mb: "1.5rem",
        }}
      >
        Start Your Coin Journey!
      </Typography>
      <Grid container spacing={2}>
        <Grid item md={12} xs={12}>
          <Box
            sx={{
              mt: "5px",
              height: "170px",
              border: "1px dashed #A3BF56",
              borderRadius: "10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              position: "relative",
              gap: "10px",
            }}
          >
            {/* Hidden file input */}
            <input
              type="file"
              id="file-input"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files.length > 0) {
                  const src = URL.createObjectURL(e.target.files[0]);
                  setCoinImage(src);
                  setImageName(e.target.files[0].name);
                  setImageFile(e.target.files[0]);

                  let reader = new FileReader();
                  reader.onload = handleFileRead;
                  reader.readAsArrayBuffer(e.target.files[0]);
                } else {
                  setImageName("");
                  setImageFile(null);
                }
              }}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <Typography component={"img"} src={img_1.src} ml={"5px"} />
              <Typography component={"img"} src={img_2.src} ml={"5px"} />
              <Typography component={"img"} src={img_3.src} ml={"5px"} />
            </Box>
            <Typography component={"img"} src={upload.src} ml={"5px"} />
            {/* Choose file button */}
            <Button
              sx={{
                background: "rgb(163 191 86 / 49%)",
                border: "2px solid rgb(240 255 66 / 64%)",
                fontSize: "16px",
                textTransform: "capitalize",
                fontFamily: "JostRegular",
                borderRadius: "10px",
                width: "129px",
                height: "35px",
                color: "#fff",
              }}
              disableRipple
              onClick={() => document.getElementById("file-input")?.click()} // Trigger file input when button is clicked
            >
              Choose file
            </Button>

            {imageName && (
              <Box sx={{ color: "#CACACA" }}>
                <Typography
                  sx={{
                    fontSize: "12px",
                  }}
                >
                  {imageName}
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>

        <Grid item md={6} xs={12}>
          <div className="flex flex-col w-full">
            <p className="text-2xl text-white" style={{ fontSize: "16px" }}>
              Name
            </p>
            <input
              ref={coinName}
              type="text"
              className={`w-full h-[69px] rounded-xl px-6 border border-white text-[#808080] bg-[#121212] text-base ${EurostileMNFont.className}`}
            />
          </div>
        </Grid>
        <Grid item md={6} xs={12}>
          <div className="flex flex-col w-full">
            <p className="text-2xl text-white" style={{ fontSize: "16px" }}>
              Ticker
            </p>
            <input
              ref={ticker}
              type="text"
              className={`w-full h-[69px] rounded-xl px-6 border border-white text-[#808080] bg-[#121212] text-base ${EurostileMNFont.className}`}
            />
          </div>
        </Grid>
        <Grid item md={4} xs={12}>
          <div className="flex flex-col w-full">
            <p
              className="text-2xl font-bold text-white flex"
              style={{ fontSize: "16px" }}
            >
              Twitter Link
              <Typography component={"img"} src={x.src} ml={"5px"} />
            </p>
            <input
              ref={twitterLink}
              type="text"
              className={`w-full h-[69px] rounded-xl px-6 border border-white text-[#808080] bg-[#121212] text-base ${EurostileMNFont.className}`}
            />
          </div>
        </Grid>
        <Grid item md={4} xs={12}>
          <div className="flex flex-col w-full">
            <p
              className="text-2xl text-white flex"
              style={{ fontSize: "16px" }}
            >
              Telegram Link
              <Typography component={"img"} src={telegram.src} ml={"5px"} />
            </p>
            <input
              ref={telegramLink}
              type="text"
              className={`w-full h-[69px] rounded-xl px-6 border border-white text-[#808080] bg-[#121212] text-base ${EurostileMNFont.className}`}
            />
          </div>
        </Grid>
        <Grid item md={4} xs={12}>
          <div className="flex flex-col w-full">
            <p
              className="text-2xl text-white flex"
              style={{ fontSize: "16px" }}
            >
              Website
              <Typography component={"img"} src={web.src} ml={"5px"} />
            </p>
            <input
              ref={website}
              type="text"
              className={`w-full h-[69px] rounded-xl px-6 border border-white text-[#808080] bg-[#121212] text-base ${EurostileMNFont.className}`}
            />
          </div>
        </Grid>
        <Grid item md={12} xs={12}>
          <div className="flex flex-col w-full">
            <p className="text-2xl text-white" style={{ fontSize: "16px" }}>
              Description
            </p>
            <textarea
              ref={description}
              className={`w-full h-[179px] rounded-xl px-6 border border-white text-[#808080] bg-[#121212] text-base resize-none ${EurostileMNFont.className}`}
            ></textarea>
          </div>
        </Grid>
      </Grid>

      <div className="flex items-center my-4">
        <Checkbox
          disableRipple
          sx={{
            color: "#CACACA",
            p: "0",
            borderRadius: "3px !important",
          }}
          id="terms"
        // checked={agreed}
        // onCheckedChange={(value) => setAgreed(value as boolean)}
        />
        <label htmlFor="terms" className="label text-white ml-1">
          I agree to the OMAX Terms and Conditions and Token Profile Policy.
        </label>
      </div>

      <p className={`text-xl text-white mb-4`} style={{ fontSize: "16px" }}>
        Cost to deploy: ~1000 OMAX
      </p>

      <button
        type="button"
        className={`bg-white rounded-full h-10 text-base`}
        onClick={handleCreateCoin}
        style={{
          background: "#F0FF42",
          color: "#000",
          fontFamily: "JostBold",
          width: "300px",
          height: "45px",
        }}
      >
        Create Coin
      </button>
      <CreateCoinDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        name={coinName.current?.value}
        ticker={ticker.current?.value}
        description={description.current?.value}
        coinImage={coinImage}
        imgFile={imageFile}
        imgBuffer={imgBuffer}
        twitterLink={twitterLink.current?.value}
        telegramLink={telegramLink.current?.value}
        websiteLink={website.current?.value}
      />
    </Box>
  );
}

function CreateCoinDialog({
  isDialogOpen,
  setIsDialogOpen,
  name,
  ticker,
  description,
  imgFile,
  imgBuffer,
  twitterLink,
  telegramLink,
  websiteLink,
}) {
  const wallet = useAccount();
  const chainID = useChainId();
  const config = useContext(WagmiContext);

  const [mode, setMode] = useState("omax");
  const [amount, setAmount] = useState('0');
  const [scanAddress, setScanAddress] = useState(EXPLORER_URL)
  const [pumpfunAddress, setPumpfunAddress] = useState(PUMPFUN_ADDRESS);
  const [createFee, setCreateFee] = useState('0');
  const [vx, setVx] = useState('0');
  const [vy, setVy] = useState('0');

  useEffect(() => {
    async function fetchData() {
      const results = await readContracts(config, {
        contracts: [
          {
            abi: pumpfunabi,
            address: pumpfunAddress,
            functionName: "CREATE_FEE",
            args: []
          },
          {
            abi: pumpfunabi,
            address: pumpfunAddress,
            functionName: "vX",
            args: []
          },
          {
            abi: pumpfunabi,
            address: pumpfunAddress,
            functionName: "vY",
            args: []
          }
        ]
      });
      if (results[0].status == "success") {
        setCreateFee(decimalToEth(results[0].result.toString()));
        setVx(decimalToEth(results[1].result.toString()));
        setVy(decimalToEth(results[2].result.toString()));
      } else {
        console.error("read contract error");
      }
    }
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
    if (pumpfunAddress != '') {
      fetchData();
    }
  }, [chainID]);

  const onChangeAmount = (e) => {
    if (Number(e.target.value) < 0) return;
    setAmount(e.target.value);
  };

  async function getTimestampFromBlock(blockNumber) {
    const block = await getBlock(config, {
      blockNumber: blockNumber
    });
    return block.timestamp;
  }

  const handleCreateCoin = async () => {
    if (wallet.status == "disconnected") {
      toast.error("Not connected wallet!");
      return;
    }

    const id = toast.loading(`Creating '${name}' token...`);

    try {
      const { imageUrl } = await createMetadata(imgFile);
      let value;

      if (mode == 'omax') {
        value = Number(createFee) + Number(amount);
      } else {
        value = (Number(vx) * Number(amount) / (Number(vy) - Number(amount))) + Number(createFee);
      }

      const tx = await writeContract(config, {
        abi: pumpfunabi,
        address: pumpfunAddress,
        functionName: "createCurve",
        args: [
          name,
          ticker,
          imageUrl,
          0,
          description,
          twitterLink,
          telegramLink,
          websiteLink,
        ],
        chainId: chainID,
        value: parseEther(value.toString())
      });

      const recipt = await waitForTransactionReceipt(config, { hash: tx });
      console.log('txHash:', recipt);
      const timestamp = await getTimestampFromBlock(recipt.logs[0].blockNumber);
      const result = await updateToken(
        name,
        ticker,
        description,
        imageUrl,
        twitterLink,
        telegramLink,
        websiteLink,
        recipt.logs[0].address,
        timestamp
      );
      if (!result) {
        toast.dismiss(id);
        toast.error("Failed to update token info!");
        setIsDialogOpen(false);
        return;
      }

      toast.dismiss(id);
      toast.success(`Created a new bonding curve with token '${name}'`);

      setIsDialogOpen(false);
    } catch (err) {
      console.error("handleCreateCoin err:", err);
      toast.dismiss(id);
      toast.error(err.message);
    }
  };

  return (
    <Transition appear show={isDialogOpen}>
      <Dialog
        as="div"
        className={`relative z-30 focus:outline-none ${rajdhani.className}`}
        onClose={() => setIsDialogOpen(false)}
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
                <p className="text-[32px] text-bold text-white">
                  Choose how many [{ticker}] you want to buy (Optional)
                </p>
                <p className="text-xl text-white">
                  Tip: Its optional but buying a small amount of coins helps
                  protect your coin from snipers
                </p>
                <div className="flex flex-col gap-2 items-end">
                  <button
                    type="button"
                    className="text-xl text-white text-bold cursor-pointer"
                    onClick={() => {
                      if (mode === "omax") setMode("coin");
                      else setMode("omax");
                    }}
                  >
                    Switch to {ticker}
                  </button>
                  <div className="relative w-full">
                    {mode === "omax" ? (
                      <div className="absolute right-6 inset-y-4 flex gap-1 items-center">
                        <p
                          className={`text-xl text-white ${EurostileMNFont.className}`}
                        >
                          OMAX
                        </p>
                        <Image
                          src="/omax.png"
                          width={32}
                          height={32}
                          alt="omax"
                        />
                      </div>
                    ) : (
                      <div className="absolute right-6 inset-y-4 flex gap-1 items-center">
                        <p
                          className={`text-xl text-white ${EurostileMNFont.className}`}
                        >
                          {ticker}
                        </p>
                        <Image
                          className="rounded-full"
                          src={coinImage}
                          width={32}
                          height={32}
                          alt="coin"
                        />
                      </div>
                    )}
                    <input
                      value={amount}
                      onChange={onChangeAmount}
                      type="number"
                      className={`w-full h-[74px] bg-[#121212] pl-6 rounded-xl border border-white text-[#808080] text-base ${EurostileMNFont.className}`}
                      placeholder="0.0 (optional)"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3 items-center">
                  <button
                    type="button"
                    className="bg-white rounded-xl w-full h-[50px] text-xl text-bold"
                    onClick={handleCreateCoin}
                  >
                    Create Coin
                  </button>
                  <p
                    className={`text-xl text-white ${EurostileMNFont.className}`}
                  >
                    Cost to deploy: ~1000 OMAX
                  </p>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
