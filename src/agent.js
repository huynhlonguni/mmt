const API_ROOT = 'https://mmt-bay.vercel.app';
const mime = require('mime');
const agent = async (url, body, method = 'GET') => {
	const headers = new Headers();
	// if (body) {
	//   // headers.set("Content-Type", "application/json")
	// }
	if (body instanceof Blob) {
		var data = new FormData()
		// let ext = mime.getExtension(body.type)
		// if (body.type.charAt(9) == ';')
		// 	ext = body.type.substring(6,9)
		// else ext = body.type.substring(6,10)
		// console.log(ext)
		data.append('file', body, 'audio.mp3')
	}
	const response = await fetch(`${API_ROOT}${url}`, {
		method,
		headers,
		body: body ? (body instanceof Blob) ? data : JSON.stringify(body) : undefined,
	})
	let result;
	try {
		result = await response.json()
	} catch (error) {
		result = { errors: { [response.status]: [response.statusText] } };
	}

	if (!response.ok) throw result;
	return result
}

function serialize(object) {
	const params = [];

	for (const param in object) {
		if (Object.hasOwnProperty.call(object, param) && object[param] != null) {
			params.push(`${param}=${encodeURIComponent(object[param])}`);
		}
	}

	return params.join('&');
}

const requests = {
	get: (url, query = {}) => {
		const isEmptyQuery = query == null || Object.keys(query).length === 0;
		return agent(isEmptyQuery ? url : `${url}?${serialize(query)}`);
	},
	post: (url, body) => agent(url, body, "POST"),
	put: (url, body) => agent(url, body, 'PUT'),
}
const Message = {
	sendMessage: (message) => requests.post('/message', message),
	sendAudio: (file) => requests.post('/hear', file),
	getTitle: (title) => requests.post('/title', title),
}
export default {
	Message,
}
