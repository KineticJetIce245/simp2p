/**
 * This module provides functions to establish connections
 */

export async function obtainValideSDPPath(is_invite, timestamp, offer) {
  if (is_invite) {
    let sdp_results = null;
    try {
      sdp_results = await offerGenSdpAndIce();
      window.logger.logMessage("[estac.cjs]: SDP generation successful.");
      // one timestamp corresponds to multiple connection objects (rtcpeerconnection + bootstrap channel)
      // or (rtcpeerconnection + media channels)
      window["connection-table"].addConnection(timestamp, { bootstrap: sdp_results.rtcpc });
      try {
        let estac_file_path = await window.estac.createEstacFile(sdp_results, timestamp);
        window.logger.logMessage(`[estac.cjs]: ESTAC file created at path: ${estac_file_path}`);
        return estac_file_path;
      } catch (error) {
        window.logger.errorMessage(`[estac.cjs]: Error creating ESTAC file (${error})`);
        throw error;
      }
    } catch (error) {
      window.logger.errorMessage(`[estac.cjs]: Error generating SDP (${error})`);
      throw error;
    }

  }
}

async function gatherIces(timeout, peerConnection, candidates) {
  window.logger.logMessage("[estac.cjs]: Gathering ICE candidates...");
  return new Promise((resolve, reject) => {
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        window.logger.logMessage("[estac.cjs]: New ICE candidate gathered:" + event.candidate.candidate);
        candidates.push(event.candidate);
      } else {
        window.logger.logMessage("[estac.cjs]: ICE candidate gathering complete.");
      }
    };

    const timer = setTimeout(() => {
      window.logger.errorMessage("[estac.cjs]: ICE candidate gathering timed out.");
      reject(new Error(`Promise timed out after ${timeout} ms`));
    }, timeout);
  });
}

async function offerGenSdpAndIce() {
  let candidates = [];
  window.logger.logMessage("[estac.cjs]: Starting SDP Offer generation...");
  let ice_server_url = "stun:stun.l.google.com:19302"

  const local = new RTCPeerConnection({ iceServers: [{ urls: ice_server_url }] });

  local.createDataChannel("bootstrap"); // channel for signaling
  const offer = await local.createOffer();
  await local.setLocalDescription(offer);

  try {
    await gatherIces(100, local, candidates);
  } catch (error) {
    window.logger.errorMessage("[estac.cjs]: ICE candidate gathering error: " + error);
  }

  if (candidates.length === 0) {
    window.logger.errorMessage("[estac.cjs]: No ICE candidates gathered.");
    throw new Error("No ICE candidates gathered.");
  }

  return {
    rtcpc: local, // RTCPeerConnection object
    sdp: local.localDescription.sdp,
    ices: candidates
  };
}

async function answerGenSdpAndIce(offer_sdp, offer_ices) {
  let candidates = [];
  window.logger.logMessage("[estac.cjs]: Starting SDP Answer generation...");
  let ice_server_url = "stun:stun.l.google.com:19302"

  const local = new RTCPeerConnection({ iceServers: [{ urls: ice_server_url }] });

  await local.setRemoteDescription(new RTCSessionDescription(offer.sdp));
  for (offer_ice of offer_ices) {
    await local.addIceCandidate(new RTCIceCandidate(offer_ice));
  }

  const answer = await local.createAnswer();
  await local.setLocalDescription(answer);

  try {
    await gatherIces(100, local, candidates);
  } catch (error) {
    window.logger.errorMessage("[estac.cjs]: ICE candidate gathering error: " + error);
  }

  if (candidates.length === 0) {
    window.logger.errorMessage("[estac.cjs]: No ICE candidates gathered.");
    throw new Error("No ICE candidates gathered.");
  }

  return {
    rtcpc: local, // RTCPeerConnection object
    sdp: local.localDescription.sdp,
    ices: candidates
  }
}
