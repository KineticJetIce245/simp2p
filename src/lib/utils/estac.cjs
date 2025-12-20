/**
 * This module provides functions to establish connections
 */

export async function obtainValideSDPPath(is_invite, timestamp) {
  if (is_invite) {
    let sdp_results = null;
    try {
      sdp_results = await generateSDPAndICE();
      window.logger.logMessage("[estac.cjs]: SDP generation successful.");
      // one timestamp corresponds to multiple connection objects (rtcpeerconnection + bootstrap channel)
      // or (rtcpeerconnection + media channels)
      window.connection_table.addConnection(timestamp, { rtcpc: sdp_results.rtcpc, btch: sdp_results.btch });
      return sdp_results;
    } catch (error) {
      window.logger.logMessage("[estac.cjs]: Error generating SDP: " + error);
      throw error;
    }

  }
}

async function gatherIceCandidates(timeout, peerConnection, candidates) {

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
      window.logger.logMessage("[estac.cjs]: ICE candidate gathering timed out.");
      reject(new Error(`Promise timed out after ${timeout} ms`));
    }, timeout);
  });
}

async function generateSDPAndICE() {
  window.logger.logMessage("[estac.cjs]: Starting SDP Offer generation...");
  let ice_server_url = "stun:stun.l.google.com:19302"
  let candidates = [];

  const local = new RTCPeerConnection({ iceServers: [{ urls: ice_server_url }] });

  let ch_bootstrap = local.createDataChannel("bootstrap");
  const offer = await local.createOffer();
  await local.setLocalDescription(offer);

  try {
    await gatherIceCandidates(100, local, candidates);
  } catch (error) {
    window.logger.logMessage("[estac.cjs]: ICE candidate gathering error: " + error);
  }

  if (candidates.length === 0) {
    throw new Error("No ICE candidates gathered.");
  }

  return {
    rtcpc: local, // RTCPeerConnection object
    btch: ch_bootstrap, // Bootstrap channel
    sdp: local.localDescription.sdp,
    ices: candidates
  };
}
