import fetchInstance from "../fetchInstance";
import { TRANSFER_CHRLE_TO_USER } from "../apis";

export const transferCHRLEToUser = async (
  txId: string,
  hash: string,
  timestamp: number,
  receiptAddress: string,
  userId: string
) => {
  return await fetchInstance(TRANSFER_CHRLE_TO_USER, {
    method: "POST",
    body: JSON.stringify({ txId, hash, timestamp, receiptAddress, userId }),
  });
};
