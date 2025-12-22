window.logger.logMessage("[RTC Host]: rtc_host module loaded.");
let conv_table = {}; // Stores active conversations

/**
  * Generate an Estac offer for the bootstrap connection.
  */
async function bstrapConv() {
  let conv_id = Date.now();
  try {
    let estac_result = await genOfferSdpAndIce(["bootstrap"]);
    conv_table[conv_id] = { bootstrap: estac_result.rtcpc };
    window.logger.logMessage(`[RTC Host]: Offer ESTAC generation successful for connection ID ${conv_id}.`);
    return {
      conv_id: conv_id,
      estac_path: await genEstacFile({ tmsp: conv_id, sdp: estac_result.sdp, ices: estac_result.ices }),
    };
  } catch (error) {
    window.logger.errorMessage(`[RTC Host]: Error generating offer ESTAC (${error}).`);
    throw error;
  }
}

async function answerBstrapConv(estac) {
  let conv_id = estac.tmsp;
  try {
    let estac_result = await genAnswerSdpAndIce({ sdp: estac.sdp, ices: estac.ices });
    conv_table[conv_id] = { bootstrap: estac_result.rtcpc };
    window.logger.logMessage(`[RTC Host]: Answer ESTAC generation successful for connection ID ${conv_id}.`);
    return {
      conv_id: conv_id,
      estac_path: await genEstacFile({ tmsp: conv_id, sdp: estac_result.sdp, ices: estac_result.ices }),
    };
  } catch (error) {
    window.logger.errorMessage(`[RTC Host]: Error generating answer ESTAC (${error}).`);
    throw error;
  }
}

/**
  * Generate a temp Estac file for the bootstrap connection.
  */
async function genEstacFile(conv_info) {
  try {
    let estac_file_path = await window.estac.createEstacFile(conv_info);
    window.logger.logMessage(`[RTC Host]: ESTAC file created at path: ${estac_file_path}.`);
    return estac_file_path;
  } catch (error) {
    window.logger.errorMessage(`[RTC Host]: Error generating ESTAC file (${error}).`);
  }
}

/**
  * Generate SDP offer and ICE candidates for RTC Peer Connection.
  */
async function genOfferSdpAndIce(channel_names) {
  let candidates = [];
  window.logger.logMessage("[RTC Host]: Starting SDP Offer generation...");
  let ice_server_url = "stun:stun.l.google.com:19302"

  const conn = new RTCPeerConnection({ iceServers: [{ urls: ice_server_url }] });

  channel_names.forEach((name) => {
    conn.createDataChannel(name);
  });

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

  return {
    rtcpc: conn,
    sdp: conn.localDescription.sdp,
    ices: candidates
  };
}

/**
  * Generate SDP answer and ICE candidates for RTC Peer Connection.
  */
async function genAnswerSdpAndIce(offer) {
  let candidates = [];
  window.logger.logMessage("[RTC Host]: Starting SDP Answer generation...");
  let ice_server_url = "stun:stun.l.google.com:19302"

  const conn = new RTCPeerConnection({ iceServers: [{ urls: ice_server_url }] });

  await conn.setRemoteDescription(new RTCSessionDescription(offer.sdp));
  offer.ices.forEach(async (ice) =>
    await conn.addIceCandidate(new RTCIceCandidate(ice)))

  const answer = await conn.createAnswer();
  await conn.setLocalDescription(answer);

  try {
    await gatherIces(100, conn, candidates);
  } catch (error) {
    window.logger.errorMessage(`[RTC Host]: ICE candidate gathering error (${error}).`);
  }

  if (candidates.length === 0) {
    window.logger.errorMessage("[RTC Host]: No ICE candidates gathered.");
    throw new Error("No ICE candidates gathered.");
  }

  return {
    rtcpc: conn, // RTCPeerConnection object
    sdp: conn.localDescription.sdp,
    ices: candidates
  }
}

/**
  * Gather ICE candidates for a given RTCPeerConnection within a timeout period.
  */
async function gatherIces(timeout, rtcpc, candidates) {
  window.logger.logMessage("[RTC Host]: Gathering ICE candidates...");
  return new Promise((resolve, reject) => {
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
      reject(new Error(`Promise timed out after ${timeout} ms.`));
    }, timeout);
  });
}

/**
  * Load remote SDP and ICE candidates into a given RTCPeerConnection.
  */
async function loadSdpAndIces(conn_info) {
  const rtcpc = conv_table[conn_info.tmsp][conn_info.name];
  rtcpc.setRemoteDescription(new RTCSessionDescription({ sdp: conn_info.sdp }));
  conn_info.ices.forEach(async (ice) =>
    await rtcpc.addIceCandidate(new RTCIceCandidate(ice)));
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
