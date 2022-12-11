#!/usr/bin/env python
# coding: UTF-8
import pupil_apriltags as apriltag     # for windows
import cv2
import numpy as np
import sys

img =cv2.imread("./public/image/input.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
# 创建一个apriltag检测器
at_detector = apriltag.Detector(families='tag36h11')  #for windows
# 进行apriltag检测，得到检测到的apriltag的列表
tags = at_detector.detect(gray)
print(tags[0].tag_id)
