import openai
from flask import Flask, request, Response
from flask_cors import CORS
import traceback
import logging
import io, os, json, time
#from pydub import AudioSegment
app = Flask(__name__)
cors = CORS(app)

openai.api_key = os.environ.get('OPENAI_KEY')
os.makedirs("/tmp/", exist_ok = True)

@app.route('/')
def hello_world():
	return "Hello World"

@app.route("/message", methods=["POST", "OPTIONS"])
def chatGPT():
	messages= []
	messages.append(json.loads(r'{"role": "system", "content": "You are a helpful assistant."}'))
	try:
		postJson = request.get_json(force=True)
		print("\n")
		print("POST:")
		print(postJson)
	except Exception as e:
		logging.error(traceback.format_exc())
		return Response(r'{"role": "error", "content": "Bad Request"}', status=400, mimetype='application/json')
	if len(postJson) == 0:
		return Response(r'{"role": "error", "content": "Request body can\'t be empty"}', status=400, mimetype='application/json')
	for x in postJson:
		if x["role"] in ["user", "assistant"]:
			messages.append((x))
	try:
		completion = openai.ChatCompletion.create(model="gpt-3.5-turbo", messages=messages)
		apiResponse = json.dumps(completion['choices'][0]['message'])
		print(apiResponse)
		return apiResponse
	except Exception as e:
		logging.error(traceback.format_exc())
		return Response(r'{"role": "error", "content": "OpenAI API failure"}', status=400, mimetype='application/json')

@app.route("/hear", methods=["POST", "OPTIONS"])
def whisper():
	try:
		file = request.files['file']
		temp_name = "/tmp/" + str(int(time.time()))
		ext = file.filename.split(".")[-1]
		with open(temp_name + "." + ext, "wb") as f:
			f.write(file.read())
		if ext not in ['m4a', 'mp3', 'webm', 'mp4', 'mpga', 'wav', 'mpeg']:
			return Response(r'{"role": "error", "content": "Browser audio captured in unsupported format"}', status=400, mimetype='application/json')
			#sound = AudioSegment.from_file(temp_name + "." + ext)
			#sound.export(temp_name + ".mp3", format="mp3")
			#os.remove(temp_name + "." + ext)
		audio_file = open(temp_name + "." + ext, "rb")
		transcript = openai.Audio.transcribe("whisper-1", audio_file)
		print(transcript)
		audio_file.close()
		os.remove(temp_name + "." + ext)
		return transcript
	except Exception as e:
		logging.error(traceback.format_exc())
		return Response(r'{"role": "error", "content": "OpenAI API failure"}', status=400, mimetype='application/json')

# @app.route("/speak", methods=["POST", "OPTIONS"])
# def text2speech():
# 	if request.method == 'POST':
# 		try:
# 			postJson = request.get_json(force=True)
# 			print("\n")
# 			print("POST:")
# 			print(postJson)
# 			return r'{"url": "http://example.com"}'
# 		except Exception as e:
# 			logging.error(traceback.format_exc())
# 			return Response(r'{"error": "Bad Request"}', status=400, mimetype='application/json')

@app.route("/title", methods=["POST", "OPTIONS"])
def summary():
	if request.method == 'POST':
		try:
			postJson = request.get_json(force=True)
			print("\n")
			print("POST:")
			print(postJson)
			message = "Provide a maximum of 6 words summary of the followng message. Only reply the summary, no chat or other notes are allowed. Reply the summary using the message's language. Message is:"
			message += " \"" + postJson + "\""
			try:
				completion = openai.ChatCompletion.create(
					model="gpt-3.5-turbo",
					messages=[
						{"role": "system", "content": "You are a helpful assistant."},
						{"role": "user", "content": message}
				])
				apiResponse = json.dumps({"title": completion['choices'][0]['message']['content']})
				print(apiResponse)
				return apiResponse
			except Exception as e:
				logging.error(traceback.format_exc())
				return Response(r'{"role": "error", "content": "OpenAI API failure"}', status=400, mimetype='application/json')
		except Exception as e:
			logging.error(traceback.format_exc())
			return Response(r'{"error": "Bad Request"}', status=400, mimetype='application/json')


if __name__ == '__main__':
	app.run(host="0.0.0.0")
