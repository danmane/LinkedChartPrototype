#!/usr/bin/env python3
import json, csv, re

def main():
  cities = []
  with open("cityNames.json", "r") as f:
    cities2csv = json.load(f)
  for (city_name, data_file) in cities2csv.items():
      city = getCityDict(city_name, data_file)
      cities.append(city)
  with open("cityData.json", "w") as f:
    json.dump(cities, f, indent=1)

CACHE_HEADER = None
strip = lambda x: x.strip()
def getDataAndHeader(data_file):
  global CACHE_HEADER
  with open (data_file, "r") as f:
    reader = csv.reader(f)
    h = map(strip, reader.next())
    if CACHE_HEADER == None:
      CACHE_HEADER = h
    else:
      assert(CACHE_HEADER == h)
    data = list(reader)
    return data, h

def str2datefloat(s):
  if re.match("\ *\d+-\d+-\d+\ *", s):
    return s
  else:
    return float(s)

def getCityDict(city_name, data_file):
  data, header = getDataAndHeader(data_file)
  cityDict = {"name": city_name}
  for i in range(len(header)):
    attrName = header[i]
    attrData = [str2datefloat(d[i]) for d in data]
    cityDict[attrName] = attrData
  return cityDict

main()
