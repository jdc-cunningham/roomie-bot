from machine import I2C, Pin
from vl53l5cx import DATA_TARGET_STATUS, DATA_DISTANCE_MM
from vl53l5cx import STATUS_VALID, RESOLUTION_8X8
from vl53l5cx.mp import VL53L5CXMP

class ToFSensor():
  def __init__(self):
     self.tof = self.make_sensor()
     self.scan_values = []

  def make_sensor(self):
    scl_pin, sda_pin, lpn_pin, _ = (1, 0, 12, 13)
    i2c = I2C(0, scl=Pin(scl_pin, Pin.OUT), sda=Pin(sda_pin), freq=1_000_000, timeout=500000)
    return VL53L5CXMP(i2c, lpn=Pin(lpn_pin, Pin.OUT, value=1))

  def sample_sensor(self):
    tof = self.tof
    tof.reset()

    if not tof.is_alive():
        raise ValueError("VL53L5CX not detected")

    tof.init()
    tof.resolution = RESOLUTION_8X8
    grid = 7
    tof.ranging_freq = 2
    tof.start_ranging({DATA_DISTANCE_MM, DATA_TARGET_STATUS})

    while True:
      if tof.check_data_ready():
        results = tof.get_ranging_data()
        distance = results.distance_mm
        self.scan_values = distance # all 64 values in single array
