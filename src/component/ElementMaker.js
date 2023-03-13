import React, { useState } from "react";

// Creat an ElementMaker component
function ElementMaker(props) {
	const [showInputEle, setShowInputEle] = useState(false);

	if (showInputEle)
		return (
			<input
				className="border-none outline-none bg-transparent underline"
				type="text"
				value={props.value == props.untitled ? "" : props.value}
				placeholder={props.untitled}
				onChange={(e) => props.handleChange(e)}
				onBlur={() => setShowInputEle(false)}
				autoFocus
			/>
		)
	else
		return (
			<div onDoubleClick={() => setShowInputEle(true)} className={ props.active ? "" : "group-hover:font-bold"} >
				{props.value}
			</div>
		)
}

export default ElementMaker;
