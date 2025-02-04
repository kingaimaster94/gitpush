import { axiosPrivate } from "../axiosPrivate"
import { axiosPublic } from "../axiosPublic"

export async function getProfileInfo(walletAddr, userId) {
  const userIdStr = encodeURIComponent(JSON.stringify(userId))
  const result = await axiosPublic.get(`/user/get_profile?walletAddr=${walletAddr}&userId=${userIdStr}`)
  return result.data
}

export async function updateProfile(formData) {
  const result = await axiosPrivate.post('/user/update_profile', formData)
  return result.data
}

export async function getFollowings(userId) {
  const userIdStr = encodeURIComponent(JSON.stringify(userId))
  const result = await axiosPublic.get(`/user/get_followings?userId=${userIdStr}`)
  return result.data
}

export async function setFollow(_id) {
  const result = await axiosPrivate.post(`/user/follow`, { followingId: _id })
  return result.data
}

export async function setUnFollow(_id) {
  const result = await axiosPrivate.post(`/user/unfollow`, { followingId: _id })
  return result.data
}
