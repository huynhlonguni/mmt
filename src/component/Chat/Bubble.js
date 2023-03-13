import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import SpeakerIcon from '../../icons/SpeakerIcon.js'
import CopyIcon from '../../icons/CopyIcon.js'
import CopyCheckIcon from '../../icons/CopyCheckIcon.js'
import CircleIcon from '../../icons/CircleIcon.js'

export default function Bubble(props) {
	const removeMd = require('remove-markdown');
	const LanguageDetect = require('languagedetect');
	const lngDetector = new LanguageDetect();
	const [copyClicked, setCopyClicked] = useState(false);
	function onSpeak(message) {
		const text = removeMd(message);
		const language = lngDetector.detect(text, 1)[0][0];
		if (language == "vietnamese")
			window.responsiveVoice.speak(text, "Vietnamese Female");
		else
			window.responsiveVoice.speak(text);
	}
	function copyCode(code) {
		navigator.clipboard.writeText(code);
		setCopyClicked(true);
	}

	useEffect(() => {
		if (copyClicked) {
			setTimeout(() => {
				setCopyClicked(false);
			}, 1000)
		}
	}, [copyClicked])
	var chatClass = "chat";
	var bubbleClass = "chat-bubble whitespace-pre-wrap group-one text-base";
	if (props.type === 'user') {
		chatClass += " chat-end";
		bubbleClass += " bg-[#0C84FE] text-white";
	}
	else if (props.type === 'assistant' || props.type === 'error' || props.type === 'typing') {
		chatClass += " chat-start";
		bubbleClass += " w-auto relative";
		if (props.type === 'error') {
			bubbleClass += " bg-red-400 dark:bg-red-500 text-white"
		}
		else if (props.type === 'assistant') {
			bubbleClass += " bg-white text-black dark:bg-neutral-800 dark:text-white "
		}
		else if (props.type === 'typing') {
			bubbleClass += " bg-white text-black dark:bg-neutral-800 dark:text-white "
		}
	}
	return (
		<div className={chatClass}>
			<div className={bubbleClass}>
				{props.type !== "assistant" ?
					props.type === 'typing' ?
						<div className='flex flex-row relative h-full my-2 animate-pulse'>
							<CircleIcon className="fill-black dark:fill-white h-3 w-3 " cx="10" cy="10" r="10" />
							<CircleIcon className="fill-black dark:fill-white h-3 w-3 " cx="10" cy="10" r="10" />
							<CircleIcon className="fill-black dark:fill-white h-3 w-3 " cx="10" cy="10" r="10" />
						</div> :
						props.message :
					<ReactMarkdown
						className='w-full'
						children={props.message}
						components={{
							code({ node, inline, className, children, ...props }) {
								const match = /language-(\w+)/.exec(className || '')
								return (
									<div className='relative group-two'>
										<SyntaxHighlighter
											children={String(children).replace(/\n$/, '')}
											style={oneDark}
											wrapLines={true}
											language={match ? match[1] : ""}
											codeTagProps={{ style: { display: "inline-block", paddingRight: "16px" } }}
											{...props}
										/>
										<div className='dark:bg-zinc-700 transition-opacity ease-in-out bg-white bg-opacity-60 py-1 px-3 rounded-md cursor-pointer -top-2 -right-2 opacity-0 group-two-hover:opacity-100 absolute drop-shadow-lg backdrop-blur-md z-[5]'
											onClick={() => copyCode(children)}>
											{
												copyClicked ?
													<CopyCheckIcon className="fill-zinc-600 dark:fill-white h-4 w-4" /> :
													<CopyIcon className="fill-zinc-600 dark:fill-white h-4 w-4" />
											}
										</div>
									</div>
								)
							}
						}}
					/>
				}
				{props.type == "assistant" ?
					<div className='dark:bg-zinc-700 transition-opacity ease-in-out bg-white bg-opacity-60 py-1 px-3 rounded-md cursor-pointer -bottom-3 -right-2 opacity-0 group-one-hover:opacity-100 absolute drop-shadow-lg backdrop-blur-md z-[5]'
						onClick={() => onSpeak(props.message)}>
						<SpeakerIcon className="fill-zinc-600 dark:fill-white h-4 w-4" />
					</div>
					: null
				}
			</div>
		</div>
	)
}
