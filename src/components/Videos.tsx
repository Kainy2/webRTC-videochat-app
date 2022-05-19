import { useRef, useState } from "react";
import { firestore } from "../utils/Firebase";
import { servers } from "../utils/StunServers";


import HangupIcon from "../icons/hangup.svg";
import MoreIcon from "../icons/more-vertical.svg";
import CopyIcon from "../icons/copy.svg";

const pc = new RTCPeerConnection( servers );

const Videos = ( { mode, callId, setPage }: any ) => {
  const [ webcamActive, setWebcamActive ] = useState( false );
  const [ roomId, setRoomId ] = useState( callId );

  const localRef = useRef<any>( null );
  const remoteRef = useRef<any>( null );

  const setupSources = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia( {
      video: true,
      audio: true,
    } );
    const remoteStream = new MediaStream();

    localStream.getTracks().forEach( ( track ) => {
      pc.addTrack( track, localStream );
    } );

    pc.ontrack = ( event: any ) => {
      event.streams[ 0 ].getTracks().forEach( ( track: any ) => {
        remoteStream.addTrack( track );
      } );
    };
    localRef.current.srcObject = localStream;
    remoteRef.current.srcObject = remoteStream;

    setWebcamActive( true );

    if ( mode === "create" ) {
      const callDoc = firestore.collection( "calls" ).doc();
      const offerCandidates = callDoc.collection( "offerCandidates" );
      const answerCandidates = callDoc.collection( "answerCandidates" );

      setRoomId( callDoc.id );

      pc.onicecandidate = ( event: any ) => {
        event.candidate &&
          offerCandidates.add( event.candidate.toJSON() );
      };

      const offerDescription = await pc.createOffer();
      await pc.setLocalDescription( offerDescription );

      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      };

      await callDoc.set( { offer } );

      callDoc.onSnapshot( ( snapshot ) => {
        const data = snapshot.data();
        if ( !pc.currentRemoteDescription && data?.answer ) {
          const answerDescription = new RTCSessionDescription(
            data.answer
          );
          pc.setRemoteDescription( answerDescription );
        }
      } );

      answerCandidates.onSnapshot( ( snapshot ) => {
        snapshot.docChanges().forEach( ( change ) => {
          if ( change.type === "added" ) {
            const candidate = new RTCIceCandidate(
              change.doc.data()
            );
            pc.addIceCandidate( candidate );
          }
        } );
      } );
    } else if ( mode === "join" ) {
      const callDoc = firestore.collection( "calls" ).doc( callId );
      const answerCandidates = callDoc.collection( "answerCandidates" );
      const offerCandidates = callDoc.collection( "offerCandidates" );

      pc.onicecandidate = ( event: any ) => {
        event.candidate &&
          answerCandidates.add( event.candidate.toJSON() );
      };

      const callData = ( await callDoc.get() ).data();

      const offerDescription = callData?.offer;
      await pc.setRemoteDescription(
        new RTCSessionDescription( offerDescription )
      );

      const answerDescription = await pc.createAnswer();
      await pc.setLocalDescription( answerDescription );

      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      };

      await callDoc.update( { answer } );

      offerCandidates.onSnapshot( ( snapshot ) => {
        snapshot.docChanges().forEach( ( change ) => {
          if ( change.type === "added" ) {
            let data = change.doc.data();
            pc.addIceCandidate( new RTCIceCandidate( data ) );
          }
        } );
      } );
    }

    pc.onconnectionstatechange = ( event: any ) => {
      if ( pc.connectionState === "disconnected" ) {
        hangUp();
      }
    };
  };

  const hangUp = async () => {
    pc.close();

    if ( roomId ) {
      let roomRef = firestore.collection( "calls" ).doc( roomId );
      await roomRef
        .collection( "answerCandidates" )
        .get()
        .then( ( querySnapshot ) => {
          querySnapshot.forEach( ( doc ) => {
            doc.ref.delete();
          } );
        } );
      await roomRef
        .collection( "offerCandidates" )
        .get()
        .then( ( querySnapshot ) => {
          querySnapshot.forEach( ( doc ) => {
            doc.ref.delete();
          } );
        } );

      await roomRef.delete();
    }

    window.location.reload();
  };


  return (
    <div className="videos">
      <video
        ref={ localRef }
        autoPlay
        playsInline
        className="local"
        muted
      />
      <video ref={ remoteRef } autoPlay playsInline className="remote" />

      <div className="buttonsContainer">
        <button
          onClick={ hangUp }
          disabled={ !webcamActive }
          className="hangup button"
        >
          <img src={ HangupIcon } alt='' />
        </button>
        <div tabIndex={ 0 } role="button" className="more button">
          <img src={ MoreIcon } alt='' />
          <div className="popover">
            <button
              onClick={ () => {
                navigator.clipboard.writeText( roomId );
                alert( 'copied' )
              } }
            >
              <img src={ CopyIcon } alt='' />
              Copy joining code
            </button>
          </div>
        </div>
      </div>

      { !webcamActive && (
        <div className="modalContainer">
          <div className="modal">
            <h3>
              Turn on your camera and microphone and start the
              call
            </h3>
            <div className="container">
              <button
                onClick={ () => setPage( "home" ) }
                className="secondary"
              >

                Cancel
              </button>
              <button onClick={ setupSources }>Start</button>
            </div>
          </div>
        </div>
      ) }
    </div>
  );
}

export default Videos;