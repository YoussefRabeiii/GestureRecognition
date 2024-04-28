// 0. Install fingerpose npm install fingerpose
// 1. Add Use State
// 2. Import emojis and finger pose import * as fp from "fingerpose";
// 3. Setup hook and emoji object
// 4. Update detect function for gesture handling
// 5. Add emoji display to the screen

///////// NEW STUFF ADDED USE STATE
import React, { useRef, useState, useEffect } from "react";
///////// NEW STUFF ADDED USE STATE

// import logo from './logo.svg';
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import "./App.css";
import { drawHand } from "./utilities";

///////// NEW STUFF IMPORTS
import * as fp from "fingerpose";
import victory from "./victory.png";
import thumbs_up from "./thumbs_up.png";
///////// NEW NEW STUFF IMPORTS
import * as fpg from "fingerpose-gestures";
import thumbs_down from "./thumbs_down.png";
import raised_hand from "./raised_hand.png";
import ok from "./ok.png";
import fist from "./fist.png";
import cats from "./cats.mp4";

function App() {
	const webcamRef = useRef(null);
	const canvasRef = useRef(null);
	const videoRef = useRef(null);
	const videoTag = document.getElementById("video");

	///////// NEW STUFF ADDED STATE HOOK
	const [emoji, setEmoji] = useState(null);
	const [isReloadable, setIsReloadable] = useState(true);

	const images = {
		thumbs_up: thumbs_up,
		victory: victory,
		thumbs_down: thumbs_down,
		raised_hand: raised_hand,
		ok: ok,
		fist: fist,
	};
	///////// NEW STUFF ADDED STATE HOOK

	const runHandpose = async () => {
		const net = await handpose.load();
		console.log("Handpose model loaded.");
		//  Loop and detect hands
		setInterval(() => {
			detect(net);
		}, 10);
	};

	const detect = async (net) => {
		// Check data is available
		if (
			typeof webcamRef.current !== "undefined" &&
			webcamRef.current !== null &&
			webcamRef.current.video.readyState === 4
		) {
			// Get Video Properties
			const video = webcamRef.current.video;
			const videoWidth = webcamRef.current.video.videoWidth;
			const videoHeight = webcamRef.current.video.videoHeight;

			// Set video width
			webcamRef.current.video.width = videoWidth;
			webcamRef.current.video.height = videoHeight;

			// Set canvas height and width
			canvasRef.current.width = videoWidth;
			canvasRef.current.height = videoHeight;

			// Make Detections
			const hand = await net.estimateHands(video);
			// console.log(hand);

			// console.log("🚀", fp.Gestures);

			///////// NEW STUFF ADDED GESTURE HANDLING
			if (hand.length > 0) {
				const GE = new fp.GestureEstimator([
					fp.Gestures.VictoryGesture,
					fp.Gestures.ThumbsUpGesture,
					// // add other gestures by fingerpose-gestures
					fpg.Gestures.thumbsDownGesture,
					fpg.Gestures.raisedHandGesture,
					fpg.Gestures.okGesture,
					fpg.Gestures.fistGesture,
				]);

				const gesture = GE.estimate(hand[0]?.landmarks, 8);

				if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
					// console.log(gesture.gestures);

					const confidence = gesture.gestures.map(
						(prediction) => prediction.confidence
					);
					const maxConfidence = confidence.indexOf(
						Math.max.apply(null, confidence)
					);
					// console.log(
					// 	gesture.gestures[maxConfidence].name,
					// 	gesture.gestures[maxConfidence].confidence
					// );
					setEmoji(gesture.gestures[maxConfidence].name);

					switch (gesture.gestures[maxConfidence].name) {
						case "thumbs_up":
							let videoTag2 = document.getElementById("video");
							videoTag2.volume = 1;
							console.log("volume up");
							break;

						case "thumbs_down":
							let videoTag3 = document.getElementById("video");
							videoTag3.volume = 0;
							console.log("volume down");
							break;
						case "raised_hand":
							videoRef.current.pause();
							console.log("pause");
							break;
						case "fist":
							videoRef.current.play();
							console.log("play");
							break;
						case "ok":
							console.log("ok");
							setIsReloadable(true);

							break;

						case "victory":
							console.log("vicotry ");

							isReloadable && videoRef.current.load();

							setIsReloadable(false);

							break;

						default:
							break;
					}
				}
			}

			///////// NEW STUFF ADDED GESTURE HANDLING

			// Draw mesh
			const ctx = canvasRef.current.getContext("2d");
			drawHand(hand, ctx);
		}
	};

	useEffect(() => {
		runHandpose();
	}, []);

	return (
		<div className="app">
			<h1 className="title">Hand Gesture</h1>
			<div className="container">
				<div className="camera">
					<Webcam
						ref={webcamRef}
						style={{
							textAlign: "center",
							zindex: 9,
							width: 640,
							height: 480,
							borderRadius: 20,
						}}
					/>

					<canvas ref={canvasRef} className="canvas" />

					<img className="emoji" src={images[emoji]} />
				</div>

				<div className="video">
					<video ref={videoRef} id="video" src={cats}></video>
				</div>
			</div>

			<button
				onClick={() => {
					const videoTag = document.getElementById("video");
					videoTag.volume = 1;
				}}>
				volume up
			</button>
			<button
				onClick={() => {
					const videoTag = document.getElementById("video");
					videoTag.volume = 0;
				}}>
				volume down
			</button>
			<button onClick={() => videoRef.current.play()}>play</button>
			<button onClick={() => videoRef.current.pause()}>stop</button>
			<button onClick={() => videoRef.current.load()}>load</button>
		</div>
	);
}

export default App;
