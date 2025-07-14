import { CHRLE_ABI } from "@/contract";
import { useAppKitNetwork, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, ethers } from "ethers";
import { useToast } from "./use-toast";

export const useWeb3 = () => {
  const { walletProvider } = useAppKitProvider("eip155");
  const { chainId } = useAppKitNetwork();

  const { toast } = useToast();

  const CHRLE_ADDRESS =
    process.env.CHRLE_ADDRESS || "0xb9c337151178cf0ec9a6b13a121c661065a80f36";

  const getProvider = () => {
    if (!walletProvider || !chainId) return null;
    return new BrowserProvider(walletProvider as any, chainId);
  };

  const getCHRLEBalance = async (signer: any, address: string) => {
    try {
      const chrleContract = new ethers.Contract(
        CHRLE_ADDRESS,
        CHRLE_ABI,
        signer
      );

      return await chrleContract.balanceOf(address);
    } catch (error) {
      console.error("get chrle balance error: ", error);
      return 0;
    }
  };

  const sendCHRLEToUserWalletAddress = async (
    amountCHRLE: string,
    address: string,
    receiptAddress: string
  ) => {
    const provider = getProvider();

    if (!provider) return null;

    try {
      const signer = await provider.getSigner();
      const chrleContract = new ethers.Contract(
        CHRLE_ADDRESS,
        CHRLE_ABI,
        signer
      );

      const ownerCHRLEBalance = await getCHRLEBalance(signer, address);

      const amountInWei = ethers.parseUnits(amountCHRLE.toString(), 18);

      if (ownerCHRLEBalance < amountInWei) {
        toast({
          title: "Transaction failed",
          description: "Not enough CHRLE tokens in your wallet!",
        });
        return null;
      }

      // const gasEstimate = await chrleContract.transfer.estimateGas(
      //   address,
      //   amountInWei
      // );

      // const gasPriceHex = await provider.send("eth_gasPrice", []);
      // const gasPrice = BigInt(gasPriceHex);

      // const gasFee = gasEstimate * gasPrice;

      const ownerBnbBalance = await provider.getBalance(address);

      if (ownerBnbBalance <= 0) {
        toast({
          title: "Transaction failed",
          description: "Not enough BNB for gas fee!",
        });
        return null;
      }

      const tx = await chrleContract.transfer(receiptAddress, amountInWei);

      const receipt = await tx.wait();

      const block = await provider.getBlock(receipt.blockNumber);

      return {
        hash: tx.hash,
        timestamp: block.timestamp,
      };
    } catch (error) {
      console.error("send CHRLE to user wallet address error: ", error);
      toast({
        title: "Transaction failed",
        description: "Blockchain has issue",
        color: "red",
      });
      return null;
    }
  };

  return { getCHRLEBalance, sendCHRLEToUserWalletAddress };
};
