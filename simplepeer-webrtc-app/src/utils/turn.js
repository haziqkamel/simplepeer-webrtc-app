import * as api from "./api";

let TURNIceServers = null;

export const fetchTURNCredentials = async () => {
  console.log("fetchTurnCredentials");
  await api.getTURNCredentials().then((data) => {
    if (data.token?.iceServers) {
      TURNIceServers = data.token.iceServers;
    }
    console.log(data.token?.iceServers);
  });
};

export const getTURNIceServers = () => {
  return TURNIceServers;
};
