import discordDefaultAvatar from "$lib/images/discord_default_avatar.png";
import _ from "lodash";

export const usernames: Record<string, Promise<userData>> = {};

export const unknownUser = {
  id: "",
  created_at: "",
  tag: "",
  global_name: "",
  badges: [],
  avatar: {
    id: "",
    link: discordDefaultAvatar,
    is_animated: false
  },
  banner: {
    id: null,
    link: null,
    is_animated: false,
    color: null
  }
}

export type userData = typeof unknownUser;

export async function getUserData(userId: string): Promise<userData> {
  if (usernames[userId] !== undefined) {
    return usernames[userId];
  }
  usernames[userId] = fetch(
    "https://discordlookup.mesavirep.xyz/v1/user/" + userId
  )
    .then((res) => res.json())
    .then((data) => data).catch(() => _.cloneDeep(unknownUser));

  return usernames[userId];
}