import './App.css';
import Chat from './component/Chat';
import { useState, useEffect, createContext } from 'react'
import agent from './agent'
import TrashIcon from './icons/TrashIcon';
import languages from './common/languages'
import ElementMaker from './component/ElementMaker';
import CircleIcon from './icons/CircleIcon';
import XIcon from './icons/XIcon';
import {Chatbot} from './component/Chatbot';
export const globalContext = createContext()

export default function App() {

	const [language, setLanguage] = useState(localStorage.language ? languages[localStorage.language] : languages.en)
	const [conversations, setConversations] = useState([
		{
			title: undefined,
			messages: []
		}
	])
	const [current, setCurrent] = useState(0)
	const [status, setStatus] = useState("idle")
	const [isButtonClick, setIsButtonClick] = useState(false)
	useEffect(() => {
		const oldConversations = JSON.parse(window.localStorage.getItem("conversations"))
		if (oldConversations) {
			setConversations(oldConversations)
		}
	}, [])


	function onSendMessage(input) {
		if (input !== '' && input != undefined && input != {}) {
			let newArr = [...conversations]
			newArr[current].messages.push({ role: 'user', content: input })
			setConversations(newArr);
			setIsButtonClick(true)
		}
	}

	const showModal = () => {
		document.getElementById("infoPanel").classList.remove('hidden');
		document.getElementById("infoPanel").classList.add('w-full');
		document.getElementById("messagePanel").classList.add('hidden');
	}

	const hideModal = () => {
		document.getElementById("messagePanel").classList.remove('hidden');
		document.getElementById("infoPanel").classList.remove('w-full');
		document.getElementById("infoPanel").classList.add('hidden');
	}

	useEffect(() => {
		window.localStorage.setItem("conversations", JSON.stringify(conversations))
		// messageAudio.play()
		if (!isButtonClick) return
		// console.log(conversations)
		const fetchApi = async () => {
			try {
				document.getElementById('messageAudio').play()
				setStatus("loading")
				const response = await agent.Message.sendMessage(conversations[current].messages)
				let newArr = [...conversations]
				newArr[current].messages.push(response)
				setConversations(newArr);
				setStatus("success")
				document.getElementById('messageAudio').play()
			}
			catch (e) {
				console.log(e)
				setStatus("failed")
			}
			if (!conversations[current].title) {
				try {
					let requestBody = {}
					if (conversations[current].messages[conversations[current].messages.length - 1]["role"] == "user")
						requestBody.message = conversations[current].messages[conversations[current].messages.length - 1]["content"];
					else
						requestBody.message = conversations[current].messages[conversations[current].messages.length - 2]["content"];
					const response = await agent.Message.getTitle(JSON.stringify(requestBody))
					let con = [...conversations]
					con[current].title = response.title
					setConversations(con)
				} catch (e) {
					console.log(e)
				}
			}
		}
		fetchApi()
		setIsButtonClick(false)
	}, [conversations])

	return (
		<globalContext.Provider value={{ conversations, language, current, status, setLanguage }}>
			<div className="flex flex-row h-full gap-0 text-sm lg:text-base">
				<audio id='messageAudio' src="/audio/message.mp3" />
				<div className="hidden lg:flex lg:w-auto" id="infoPanel">
					<div className="bg-white dark:bg-zinc-750 bg-opacity-80 dark:bg-opacity-60 backdrop-blur-xl h-full overflow-y-auto no-scrollbar">
						<div className='absolute right-10 top-10 cursor-pointer lg:hidden' onClick={hideModal}>
							<XIcon className="h-8 w-8 fill-zinc-600 dark:fill-white"/>
						</div>
						<div className="px-10">
							<div className='flex flex-col justify-center' id="nameBox">
								<div id="spine" className='flex justify-center'>
									<Chatbot />
								</div>
								<div className='flex justify-center'>
									<div className="text-[2rem] lg:text-[4rem] px-5 leading-none pb-5 font-bold bg-gradient-to-r inline-block from-green-400 to-blue-500 bg-clip-text text-transparent">
										3ChangDev
									</div>
								</div>
							</div>
							<div className=' '>
								<button className='rounded-xl w-full px-2'
									onClick={() => {
										setConversations(o => [{ title: null, messages: [] }, ...o])
										setCurrent(0)
										var conversationsBox = document.getElementById("conversationsBox");
										conversationsBox.scrollTop = 0;
									}}>
									<div className=' rounded-lg py-3 text-black shadow-[inset_0_3px_0px_0px_#3b82f6,inset_0_-3px_0px_0px_#3b82f6,inset_3px_0_0px_0px_#3b82f6,inset_-3px_0_0px_0px_#3b82f6] 
									dark:shadow-[inset_0_3px_0px_0px_rgb(124,150,140),inset_0_-3px_0px_0px_rgb(124,150,140),inset_3px_0_0px_0px_rgb(124,150,140),inset_-3px_0_0px_0px_rgb(124,150,140)]'>
										<h1 className="py-2 leading-none font-bold bg-gradient-to-r inline-block from-pink-500 to-yellow-500 dark:from-indigo-300 dark:to-red-300 bg-clip-text text-transparent">
											+ {language.newConversation}
										</h1>
									</div>
								</button>
								<div className=" h-[18rem] lg:h-[20rem] my-4 px-2 overflow-y-scroll no-scrollbar" id="conversationsBox">
									{conversations.map((conversation, i) => (
										<div key={i} className="my-2 first:mt-0 last:mb-0">
											<div className={i == current ?
												"rounded-xl group w-full relative p-1 shadow-inner shadow-blue-500/50 dark:shadow-black" :
												"rounded-xl group w-full relative p-1 shadow-lg shadow-blue-500/20 bg-white dark:bg-zinc-700 dark:shadow-md dark:shadow-indigo-900/30 cursor-pointer "
											}
												onClick={() => setCurrent(i)} >
												<div className='rounded-lg p-3 text-zinc-600 dark:text-white'>
													<ElementMaker className={i == current ?
														"leading-none font-bold inline-block" :
														"leading-none font-bold inline-block"}
														value={conversation.title ? conversation.title : language.noTitle}
														untitled={language.noTitle}
														active = {i == current}
														handleChange={(e) => {
															let con = [...conversations]
															con[i].title = e.target.value
															setConversations(con)
														}}
													/>
													<button className="absolute right-5 inset-y-0"
														onClick={(e) => {
															setCurrent(0)
															if (conversations.length <= 1) {
																setConversations([{ title: language.noTitle, messages: [] }])
																return
															}
															setConversations(o => {
																return o.filter((_, index) => index !== i)
															})
															e.stopPropagation()
														}}>
														<TrashIcon className="fill-zinc-600 dark:fill-white h-5 w-5 hover:fill-red-500 hover:dark:fill-red-500" />
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
						<div className='overflow-hidden  -z-50 h-full w-full absolute top-0 left-0 opacity-5 dark:opacity-10'>
							<CircleIcon className=" absolute blur-3xl -left-10 -top-10 fill-green-400" cx="-5" cy="0" r="20" />
							<CircleIcon className=" absolute blur-3xl -right-10 -bottom-10 fill-blue-500" cx="15" cy="0" r="7" transform="scale(1.5,3.0) rotate(30)" />
							<CircleIcon className=" absolute blur-3xl -left-44 -bottom-44 fill-purple-500" cx="-2" cy="22" r="15" transform="scale(1,0.6) " />
						</div>
					</div>
				</div>
				<div className="w-full relative lg:block" id="messagePanel">
					<Chat onSendMessage={onSendMessage} showModal={showModal} />
				</div>
			</div>
		</globalContext.Provider>
	)
}
