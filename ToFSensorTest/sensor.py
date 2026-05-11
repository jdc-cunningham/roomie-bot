from machine import I2C, Pin
from vl53l5cx.mp import VL53L5CXMP

def make_sensor():
  scl_pin, sda_pin, lpn_pin, _ = (1, 0, 12, 13)
  i2c = I2C(0, scl=Pin(scl_pin, Pin.OUT), sda=Pin(sda_pin), freq=1_000_000, timeout=500000)
  tof = VL53L5CXMP(i2c, lpn=Pin(lpn_pin, Pin.OUT, value=1))
  return tof
