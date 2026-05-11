from utils import load_dotenv
import network

config = load_dotenv()

def connect_to_wifi():
    sta_if = network.WLAN(network.STA_IF)

    if not sta_if.isconnected():
        print("Connecting to the network...")
        sta_if.active(True)
        sta_if.connect(config.get("WIFI_SSID"), config.get("WIFI_PASS"))

        while not sta_if.isconnected():
            pass

    print("Connected with IP: ", sta_if.ifconfig()[0])
    return sta_if.ifconfig()[0]
