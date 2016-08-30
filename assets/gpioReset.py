#!/usr/bin/env python
import RPi.GPIO as gpio
from time import sleep

gpio.setmode(gpio.BCM)
gpio.setup(4,gpio.OUT)
gpio.output(4,1)
sleep(0.1)
gpio.output(4,0)
gpio.cleanup()