import Bubble from "./Bubble";
import '../../App.css';
import { useState, memo, useEffect, useContext, useRef } from 'react';
import { globalContext } from "../../App";
import agent from "../../agent";
import { isMobile } from 'react-device-detect';
import SendIcon from "../../icons/SendIcon";
import MicrophoneIcon from "../../icons/MicrophoneIcon";
import SpinIcon from "../../icons/SpinIcon";
import DarkToggle from "../DarkToggle";
import LanguageIcon from "../../icons/LanguageIcon";
import ChevronIcon from "../../icons/ChevronIcon";
import GitHubIcon from "../../icons/GitHubIcon";
import HamburgerIcon from "../../icons/HamburgerIcon";
import languages from '../../common/languages';

import mp3RecorderWorker from 'workerize-loader!../../worker'; // eslint-disable-line import/no-webpack-loader-syntax
import { Mp3MediaRecorder } from 'mp3-mediarecorder';

function Chat({ onSendMessage, showModal }) {
	const recorderRef = useRef(null);
	const worker = useRef(null);

	useEffect(() => {
		worker.current = mp3RecorderWorker();
	}, []);

	const [recorderState, setRecorderState] = useState('inactive');
	const { status, current, conversations, language, setLanguage } = useContext(globalContext)
	// const [current, setCurrent] = useState(currentId);
	// useEffect(() => {
	//   setCurrent(currentId)
	//   setInput('')
	// }, [currentId])

	const onRecord = () => {
		window.navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
			const recorder = new Mp3MediaRecorder(stream, { worker: worker.current });
			recorderRef.current = recorder;
			recorder.ondataavailable = (event) => {
				getTextFromSpeech(event.data);
			};
			recorder.onstart = () => {
				console.log('Recording started');
				setRecorderState('recording');
			};
			recorder.onstop = () => {
				console.log('Recording stopped');
				setRecorderState('stopped');
			};
			recorder.onpause = () => { console.log('onpause'); setRecorderState('paused'); };
			recorder.onresume = () => { console.log('onresume'); setRecorderState('recording'); };
			recorder.start();
		});
	};

	const onStop = () => {
		recorderRef.current.stop();
	};

	const [input, setInput] = useState("");
	useEffect(() => {
		let numberOfLineBreaks = (input.match(/\n/g) || []).length;
		document.getElementById("textInput").rows = Math.min(numberOfLineBreaks + 1, 5);
	}, [input]);

	const onInputChange = (event) => { setInput(event.target.value); };

	const onEnterPress = (e) => {
		if (e.keyCode == 13 && e.shiftKey == false && !isMobile) {
			e.preventDefault();
			const newEvent = new Event("submit", { cancelable: true });
			onSubmit(newEvent);
		}
	}

	function dropDownClick() {
		document.getElementById("dropDownBox").classList.toggle("hidden");
	}

	const onSubmit = async (e) => {
		e.preventDefault()
		onSendMessage(input)
		setInput('')
	}
	async function getTextFromSpeech(blob) {
		try {
			console.log(blob);
			const response = await agent.Message.sendAudio(blob)
			setInput(response.text)
			setRecorderState('inactive');
		} catch (error) {
			console.log(error)
		}
	}
	return (
		<div className="relative h-full top-0 bg-slate-200 dark:bg-zinc-950">
			<nav class="absolute w-full px-4 z-20 top-0 bg-white dark:bg-zinc-750 bg-opacity-80 dark:bg-opacity-60 backdrop-blur-xl">
				<div class="container flex flex-wrap items-center justify-between">
					<div className="flex items-center  lg:select-none cursor-pointer">
						<div onClick={showModal}>
							<HamburgerIcon className="h-8 w-8 fill-zinc-600 dark:fill-white lg:fill-transparent lg:dark:fill-transparent" />
						</div>
						<h1 className="p-5 text-lg font-bold bg-gradient-to-r lg:from-transparent lg:to-transparent inline-block from-green-500 to-blue-500 bg-clip-text text-transparent">
							3ChangDev
						</h1>
					</div>
					<div className="absolute right-24 my-4">
						<button type="button"
							className="inline-flex hover:bg-slate-200 dark:hover:bg-zinc-500 w-full justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white ring-1 ring-inset ring-gray-400 dark:ring-gray-600 "
							id="menu-button"
							aria-expanded="true"
							aria-haspopup="true"
							onClick={dropDownClick}
						>
							<LanguageIcon className="fill-zinc-600 dark:fill-white h-5 w-5 my-auto" />
							<span className="hidden sm:inline">{language.languages}</span>
							<ChevronIcon className="-mr-1 h-5 w-5 fill-zinc-600 dark:fill-white" />
						</button>
						<div id="dropDownBox" className="absolute hidden z-10 w-56 origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex="-1">
							<div>
								<a className="text-gray-700 dark:text-white block px-4 py-2 text-sm cursor-pointer bg-white dark:bg-zinc-800 rounded-t-md hover:bg-slate-200 dark:hover:bg-zinc-500" onClick={(e) => { setLanguage(languages["en"]); dropDownClick(); localStorage.language = "en" }}>English</a>
								<a className="text-gray-700 dark:text-white block px-4 py-2 text-sm cursor-pointer bg-white dark:bg-zinc-800 rounded-b-md hover:bg-slate-200 dark:hover:bg-zinc-500" onClick={(e) => { setLanguage(languages["vn"]); dropDownClick(); localStorage.language = "vn" }}>Tiếng Việt</a>
							</div>
						</div>
					</div>
					<button className="absolute right-14 inset-y-0" >
						<DarkToggle/>
					</button>
					<a target="_blank" href="https://github.com/huynhlonguni/mmt2023" >
						<button className="absolute right-4 inset-y-0">
							<GitHubIcon className="h-6 w-6 fill-zinc-600 dark:fill-white" />
						</button>
					</a>
				</div>
			</nav>
			<div id="messages" className="mx-2 lg:mx-6 pt-20 pb-44 h-full overflow-y-auto no-scrollbar">
				<Bubble type='assistant' message={language.greetings} />
				{conversations[current] &&
					conversations[current].messages.map((message, i) => (
						message.role === 'error' ? <Bubble type={message.role} message={language.error} key={i} /> :
							<Bubble type={message.role} message={message.content} key={i} />
					))
				}
				{status === 'loading' &&
					<Bubble type='typing' message="•••" />
				}
			</div>
			<div className="absolute z-10 inset-x-0 bottom-0 m-5 no-scrollbar">
				<form onSubmit={onSubmit} className="" >
					<div className="flex flex-col w-full py-2 relative rounded-xl bg-white dark:bg-zinc-700 bg-opacity-80 dark:bg-opacity-70 backdrop-blur-xl drop-shadow-xl">
						<button type="button" className="absolute left-4 inset-y-0" onClick={recorderState == 'stopped' ? null : recorderState !== 'recording' ? onRecord : onStop}>
							<div className="h-6 w-6 ">
								{recorderState == 'stopped' ?
									<SpinIcon className="fill-zinc-600 dark:fill-white" /> :
									<MicrophoneIcon className={recorderState === 'recording' ? "fill-red-500 animate-pulse" : "fill-zinc-600 dark:fill-white"} />
								}
							</div>
						</button>
						<textarea
							id="textInput"
							autoComplete="off"
							className="no-scrollbar resize-none m-0 w-full py-2 text-base lg:text-lg px-14 outline-none bg-transparent text-black dark:text-white"
							type="text"
							placeholder={language.examples}
							value={input}
							onChange={onInputChange}
							rows="1"
							onKeyDown={onEnterPress}
						/>
						<button className="absolute right-4 inset-y-0" type='submit' >
							<div className="h-8 w-8">
								<SendIcon className="fill-zinc-600 dark:fill-white hover:fill-blue-500 dark:hover:fill-blue-500" />
							</div>
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default memo(Chat);

