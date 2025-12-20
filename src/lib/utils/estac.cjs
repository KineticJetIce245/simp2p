/**
 * This module provides functions to establish connections
 */

export async function obtainValideSDPPath(is_invite) {
  if (is_invite) {
    return generateSDP();
  }
}

async function gatherIceCandidates(peerConnection) {
  window.logger.logMessage("Gathering ICE candidates...");
  const candidates = [];

  return new Promise((resolve, reject) => {
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        window.logger.logMessage("New ICE candidate gathered:" + event.candidate.candidate);
        candidates.push(event.candidate);
      } else {
        window.logger.logMessage("ICE candidate gathering complete.");
        resolve(candidates);
      }
    };
  });
}

async function generateSDP() {
  window.logger.logMessage("Starting SDP Offer generation...");
  let ice_server_url = "stun:stun.l.google.com:19302"
  const local = new RTCPeerConnection({ iceServers: [{ urls: ice_server_url }] });

  let ch_bootstrap = local.createDataChannel("bootstrap");
  const offer = await local.createOffer();
  await local.setLocalDescription(offer);
  let local_ice_candidates = await gatherIceCandidates(local);

  return [local, ch_bootstrap, local.localDescription.sdp, local_ice_candidates];
}
