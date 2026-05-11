# https://www.hackster.io/517188/how-to-build-web-socket-on-raspberry-pi-pico-w-and-make-live-cbafe3
from microdot import Microdot, send_file
from microdot.websocket import with_websocket
from wifi import connect_to_wifi
from sensor import ToFSensor
import _thread
import time

local_ip = connect_to_wifi()
app = Microdot()
tof = ToFSensor()
_thread.start_new_thread(tof.sample_sensor, ())

@app.route('/')
async def index(request):
    return send_file('index.html')

@app.route('/tof-data')
@with_websocket
async def temperature_socket(request, ws):
    while True:
        await ws.send(str(tof.scan_values))
        time.sleep(0.1) # 100ms

app.run(host=local_ip, debug=True)
