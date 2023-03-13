export default function CircleIcon(props) {
	return (
		<svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={props.className}>
			<circle cx={props.cx} cy={props.cy} fillRule="nonzero" r={props.r} transform={props.transform} />
		</svg>
	)
}