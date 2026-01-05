window.logger.logMessage("[RTC Host]: rtc_host module loaded.");
/**
 * General Strucutre of conversation and 
 * conv_table: {
 *   conv_id1: conversation1,
 *   conv_id2: conversation2,
 *   ...
 * }
 *
 * conversation: {
 *   name: name,
 *   connections: {
 *     connection1_name: connection1,
 *     connection2_name: connection2,
 *    ...
 *   }
 * }
 *
 * connection: {
 *   rtcpc: RTCPeerConnection,
 *   sdp: sdp,
 *   ices: [ice1, ice2, ...],
 *   channels: {
 *     channel1_name: channel1, 
 *     channel2_name: channel2,
 *     ...
 *   }
 * }
 *
 */

const ICESERVERURLS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun.l.google.com:5349" },
  { urls: "stun:stun1.l.google.com:3478" },
  { urls: "stun:stun1.l.google.com:5349" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:5349" },
  { urls: "stun:stun3.l.google.com:3478" },
  { urls: "stun:stun3.l.google.com:5349" },
  { urls: "stun:stun4.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:5349" }
];
let conv_table = {}; // Stores active conversations

function setupNewBootstrapChannel(channel, conv_id) {
  window.logger.logMessage(`[RTC Host]: Setting up RTC Channel "bootstrap" for connection ID ${conv_id}.`);
  channel.onopen = () => {
    window.logger.logMessage(`[RTC Host]: RTC Channel "bootstrap" opened for connection ID ${conv_id}.`);
  };
  channel.onmessage = (event) => {
    window.logger.logMessage(`[RTC Host]: RTC Channel "bootstrap" message for connection ID ${conv_id}: ${event.data}`);
  };
}

function setupNewChatChannel(channel, conv_id) {
  window.logger.logMessage(`[RTC Host]: Setting up new chat RTC Channel for connection ID ${conv_id}.`);
  channel.onopen = () => {
    window.logger.logMessage(`[RTC Host]: RTC Chat Channel opened for connection ID ${conv_id}.`);
  };
  channel.onmessage = (event) => { return; }
}

function setupNewDataChannel(channel, conv_id) {
  window.logger.logMessage(`[RTC Host]: Setting up new data RTC Channel for connection ID ${conv_id}.`);
  channel.onopen = () => {
    window.logger.logMessage(`[RTC Host]: RTC Data Channel opened for connection ID ${conv_id}.`);
  };
  channel.onmessage = (event) => { return; }
}

function assignChannelSetup(channel_name) {
  if (channel_name.includes("bootstrap")) {
    return setupNewBootstrapChannel;
  } else if (channel_name.includes("chat")) {
    return setupNewChatChannel;
  } else {
    return setupNewDataChannel;
  }
}

/**
 * Bootstraps a new RTC data channel conversation as the host.
 * Generates an SDP offer and ICE candidates, sets up a "bootstrap" data channel,
 * logs channel events, and stores the connection in the conversation table.
 * Returns the conversation ID and the path to the generated ESTAC file.
 *
 * @returns {Promise<{conv_id: number, estac_path: string}>} - Conversation details.
 * @throws Will throw an error if offer or ICE generation fails.
 */
async function bstrapConv() {
  let conv_id = Date.now();
  try {
    conv_table[conv_id] = { name: "", connections: {} };
    await genOfferSdpAndIce(conv_id, "bootstrap", ["bootstrap"]); // writes directly into conv_table
    window.logger.logMessage(`[RTC Host]: Offer ESTAC generation successful for connection ID ${conv_id}.`);
    return {
      conv_id: conv_id,
      estac_path: await genEstacFile(conv_id),
    };
  } catch (error) {
    window.logger.errorMessage(`[RTC Host]: Error generating offer ESTAC (${error}).`);
    throw error;
  }
}


/**
 * Answers a bootstrap RTC connection request as the host.
 * Generates an SDP answer and ICE candidates for the incoming ESTAC,
 * stores the resulting RTCPeerConnection in the conversation table,
 * and returns the conversation ID and the path to the generated ESTAC file.
 *
 * @param {Object} estac - The incoming ESTAC object containing SDP and ICE info.
 * @returns {Promise<{conv_id: number, estac_path: string}>} - Answer details.
 * @throws Will throw an error if answer generation fails.
 */
async function answerBstrapConv(estac) {
  let conv_id = estac.conv_id;
  window.logger.logMessage(`[RTC Host]: Answering bootstrap connection for ID ${conv_id}...`);
  try {
    conv_table[conv_id] = { name: "", connections: {} };
    await genAnswerSdpAndIce(estac);
    window.logger.logMessage(`[RTC Host]: Answer ESTAC generation successful for connection ID ${conv_id}.`);
    return {
      conv_id: conv_id,
      estac_path: await genEstacFile(conv_id),
    };
  } catch (error) {
    window.logger.errorMessage(`[RTC Host]: Error generating answer ESTAC (${error}).`);
    throw error;
  }
}

/**
 * Generates an ESTAC file for the given conversation information.
 * Calls the window.estac API to create the file and logs the result.
 *
 * @param {Object} conv_info - The conversation information to include in the ESTAC file.
 * @returns {Promise<string>} - The path to the created ESTAC file.
 * @throws Will log an error if ESTAC file generation fails.
 */
async function genEstacFile(conv_id) {
  let serializable_conns = {}
  for (const conn_name in conv_table[conv_id].connections) {
    if (!(conv_table[conv_id].connections[conn_name].rtcpc.connectionState === "connecting")) {
      continue; // skip connections that are not in connecting state
    }
    const conn = conv_table[conv_id].connections[conn_name];
    let channel_names = Object.keys(conn.channels);
    serializable_conns[conn_name] = {
      sdp: conn.sdp,
      ices: conn.ices,
      channels: channel_names
    }
  }
  let serializable_conv = {
    conv_id: conv_id,
    connections: serializable_conns
  }

  window.logger.logMessage(`[RTC Host]: Generating ESTAC file for conversation ID ${conv_id}:${serializable_conv}.`);

  try {
    let estac_file_path = await window.estac.createEstacFile(serializable_conv);
    window.logger.logMessage(`[RTC Host]: ESTAC file created at path: ${estac_file_path}.`);
    return estac_file_path;
  } catch (error) {
    window.logger.errorMessage(`[RTC Host]: Error generating ESTAC file (${error}).`);
  }
}

// new function for serializing connection request for new channels
async function serializeConnRequest(conv_id, channel_type) { }

async function requestNewConns(conv_id, channel_type) {
  try {
    let conn_name = "";
    switch (channel_type) {
      case "chat":
        conn_name = `chat_${Date.now()}`;
        break;
      case "data":
        conn_name = `data_${Date.now()}`;
        break;
      default:
        throw new Error(`Unknown channel type: ${channel_type}`);
    }
    await genOfferSdpAndIce(conv_id, conn_name, [channel_type]); // writes directly into conv_table
  } catch (error) {
    window.logger.errorMessage(`[RTC Host]: Error generating offer ESTAC (${error}).`);
    throw error;
  }
}

/**
  * Generate SDP offer and ICE candidates for RTC Peer Connection.
  */
async function genOfferSdpAndIce(conv_id, conn_name, channels) {
  let candidates = [];
  window.logger.logMessage("[RTC Host]: Starting SDP Offer generation...");

  const conn = new RTCPeerConnection({ iceServers: ICESERVERURLS });
  conv_table[conv_id].connections[conn_name] = { rtcpc: conn, };

  conv_table[conv_id].connections[conn_name].channels = {}
  channels.forEach((channel) => {
    window.logger.logMessage(`[RTC Host]: Creating RTC Channel "${channel}" for connection ID ${conv_id}.`);
    let ch = conn.createDataChannel(channel); // Data channel creation for offer side
    assignChannelSetup(channel)(ch, conv_id);
    conv_table[conv_id].connections[conn_name].channels[channel] = ch;
  });

  conn.onconnectionstatechange = () => {
    window.logger.logMessage(`[RTC Host]: Connection state changed to ${conn.connectionState} for connection ${conv_id}.`);
    if (conn.connectionState === "connected") {
      window.logger.logMessage(`[RTC Host]: Peer connection established for connection ${conv_id}!`);
      // send the request for chat connection
      requestNewConns(conv_id, "chat");
    }
    if (conn.connectionState === "failed" || conn.connectionState === "disconnected") {
      window.logger.warnMessage(`[RTC Host]: Peer connection failed/disconnected for connection ${conv_id}.`);
    }
  };
  await conn.setLocalDescription(await conn.createOffer());

  try {
    await gatherIces(100, conn, candidates);
  } catch (error) {
    window.logger.errorMessage(`[RTC Host]: ICE candidate gathering error (${error}).`);
  }

  if (candidates.length === 0) {
    window.logger.errorMessage("[RTC Host]: No ICE candidates gathered.");
    throw new Error("No ICE candidates gathered.");
  }

  window.logger.logMessage("[RTC Host]: SDP Offer generation complete.");
  conv_table[conv_id].connections[conn_name].sdp = conn.localDescription.sdp;
  conv_table[conv_id].connections[conn_name].ices = candidates;
}

/**
  * Generate SDP answer and ICE candidates for RTC Peer Connection.
  */
async function genAnswerSdpAndIce(offer) {
  window.logger.logMessage("[RTC Host]: Starting SDP Answer generation...");
  let newConns = [];
  for (const conn_name in offer.connections) {
    if (!(conn_name in conv_table[offer.conv_id].connections)) {
      newConns.push(conn_name);
    }
  }
  if (newConns.length === 0) return; // Nothing to do

  for (const newConn of newConns) {
    let candidates = [];
    const conn = new RTCPeerConnection({ iceServers: ICESERVERURLS });
    conv_table[offer.conv_id].connections[newConn] = { rtcpc: conn, };
    await conn.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: offer.connections[newConn].sdp }));
    window.logger.logMessage(`[RTC Host]: Remote SDP offer set for ${newConn} of connection ID ${offer.conv_id}.`);

    conv_table[offer.conv_id].connections[newConn].channels = {}
    offer.connections[newConn].ices.forEach(async (ice) =>
      await conn.addIceCandidate(new RTCIceCandidate(ice)))

    conn.ondatachannel = (event) => {
      assignChannelSetup(event.channel.label)(event.channel, offer.conv_id);
      conv_table[offer.conv_id].connections[newConn].channels[event.channel.label] = event.channel;
    };

    const answer = await conn.createAnswer();
    await conn.setLocalDescription(answer);
    try {
      await gatherIces(100, conn, candidates);
    } catch (error) {
      window.logger.errorMessage(`[RTC Host]: ICE candidate gathering error (${error}) for ${newConn}`);
    }

    if (candidates.length === 0) {
      window.logger.errorMessage("[RTC Host]: No ICE candidates gathered.");
      throw new Error("No ICE candidates gathered.");
    }

    window.logger.logMessage("[RTC Host]: SDP Offer generation complete.");
    conv_table[offer.conv_id].connections[newConn].sdp = conn.localDescription.sdp;
    conv_table[offer.conv_id].connections[newConn].ices = candidates;
  }
}

/**
 * Gathers ICE candidates for a given RTCPeerConnection within a specified timeout.
 * Logs each candidate as it is found and collects them into the provided array.
 * Resolves with the collected candidates when gathering is complete or times out.
 *
 * @param {number} timeout - The maximum time (in ms) to wait for ICE gathering.
 * @param {RTCPeerConnection} rtcpc - The peer connection to gather candidates from.
 * @param {Array} candidates - The array to store gathered ICE candidates.
 * @returns {Promise<Array>} - Resolves with the array of gathered candidates.
 */
async function gatherIces(timeout, rtcpc, candidates) {
  window.logger.logMessage("[RTC Host]: Gathering ICE candidates...");
  return new Promise((resolve) => {
    rtcpc.onicecandidate = (event) => {
      if (event.candidate) {
        window.logger.logMessage(`[RTC Host]: New ICE candidate gathered: (${event.candidate.candidate}).`);
        candidates.push({
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
        });
      } else {
        window.logger.logMessage("[RTC Host]: ICE candidate gathering complete.");
      }
    };

    setTimeout(() => {
      window.logger.errorMessage("[RTC Host]: ICE candidate gathering timed out.");
      resolve(candidates);
    }, timeout);
  });
}

/**
  * Load remote SDP and ICE candidates into a given RTCPeerConnection.
  */
async function loadSdpAndIces(conn_info) {
  window.logger.logMessage(`[RTC Host]: Loading remote SDP and ICE candidates for connection ID ${conn_info.conv_id}...`);
  for (const conn_name in conn_info.connections) {
    if (!(conn_name in conv_table[conn_info.conv_id].connections)) {
      throw new Error(`Connection name ${conn_name} not found in conversation ID ${conn_info.conv_id}.`);
    }
    let rtcpc = conv_table[conn_info.conv_id].connections[conn_name].rtcpc;
    rtcpc.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: conn_info.sdp }));
    conn_info.ices.forEach(async (ice) =>
      await rtcpc.addIceCandidate(new RTCIceCandidate(ice)));
    window.logger.logMessage(`[RTC Host]: Remote SDP and ICE candidates loaded for connection ID ${conn_info.conv_id}.`);
  }
}

window.rtchost.onBstrapConvRequest(async () => {
  return await bstrapConv();
});

window.rtchost.onBstrapConvAnswerRequest(async (estac) => {
  return await answerBstrapConv(estac);
});

window.rtchost.onLoadSdpAndIcesRequest(async (conn_info) => {
  return await loadSdpAndIces(conn_info);
});
