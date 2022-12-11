#!/usr/bin/env python
# coding: UTF-8
import pupil_apriltags as apriltag     # for windows
import cv2
import numpy as np
import sys

#get image data
img =cv2.imread("./public/image/input.jpg")
#convert rgb image to gray image
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
# create apriltag detector for families tag36h11
at_detector = apriltag.Detector(families='tag36h11')
# detect apriltag in image.
tags = at_detector.detect(gray)
# show detected elemnt
print(tags[0].tag_id)
