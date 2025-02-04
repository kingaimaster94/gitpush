import { axiosPrivate } from "../axiosPrivate"
import { axiosPublic } from "../axiosPublic"

export async function uploadMetadata(logoFile, metadata) {
  const formData = new FormData()
  formData.append('logo', logoFile)
  formData.append('metadata', metadata)

  const response = await axiosPublic.post('/token/upload_metadata', formData);
  return await response.data;
}

export async function updateToken(name, ticker, desc, logo, twitter, telegram, website, mintAddr) {
  const result = await axiosPrivate.post(`/token/update_token`, {
    name, ticker, desc, logo, twitter, telegram, website, mintAddr
  });
  return result.data;
}

export async function findTokens(name, sort_condition, sort_order, nsfw) {
  const result = await axiosPublic.get(`/token/find_tokens?name=${name}&sort_condition=${sort_condition.replace('sort: ', '')}&sort_order=${sort_order.replace('sort: ', '')}&include_nsfw=${nsfw}`)
  return result.data
}

export async function getKing() {
  const result = await axiosPublic.get('/token/get_king_of_the_hill')
  return result.data
}

export async function getToken(mintAddr, userId) {
  const userIdStr = encodeURIComponent(JSON.stringify(userId))
  const result = await axiosPublic.get(`/token/get_token_info?mintAddr=${mintAddr}&userId=${userIdStr}`)
  return result.data
}

export async function getThreadData(mintAddr, userId) {
  const userIdStr = encodeURIComponent(JSON.stringify(userId))
  const result = await axiosPublic.get(`/token/get_thread_data?mintAddr=${mintAddr}&userId=${userIdStr}`)
  return result.data
}

export async function reply(mintAddr, comment, imageFile) {
  const formData = new FormData()
  formData.append('image', imageFile)
  formData.append('mintAddr', mintAddr)
  formData.append('comment', comment)

  const result = await axiosPrivate.post('/token/reply', formData)
  return result
}

export async function likeReply(replyMentionId) {
  const result = await axiosPrivate.post('/token/reply_like', { replyMentionId })
  return result
}

export async function dislikeReply(replyMentionId) {
  const result = await axiosPrivate.post('/token/reply_dislike', { replyMentionId })
  return result
}

export async function mentionReply(replyMentionId, message, imageFile) {
  const formData = new FormData()
  formData.append('image', imageFile)
  formData.append('replyMentionId', replyMentionId)
  formData.append('message', message)

  const result = await axiosPrivate.post('/token/reply_mention', formData)
  return result
}

export async function trade(mintAddr, isBuy, baseAmount, quoteAmount, txhash, comment) {
  const result = await axiosPrivate.post(`/token/trade`, {
    mintAddr, isBuy, baseAmount, quoteAmount, txhash, comment
  });
  return result.data;
}

export async function getTradeHistory(mintAddr) {
  const result = await axiosPublic.get(`/token/get_trade_hist?mintAddr=${mintAddr}`)
  return result.data
}

export async function getMarketId(baseMint, quoteMint) {
  const result = await axiosPublic.get(`/token/get_marketid?baseMint=${baseMint}&quoteMint=${quoteMint}`)
  return result.data
}
