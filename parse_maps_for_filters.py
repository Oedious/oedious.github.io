import json, mmap

toc = open('maps/table_of_contents.json')

tocData = json.load(toc)
water = []
hindering = []
blocking = []
locationBonus = []
elevation = []
walls = []
indoor = []
outdoor = []
indoor_outdoor = []
_8x8 = []
_16x16 = []
_16x24 = []
_24x24 = []

for map in tocData['maps']:
    mapFileName = map['file']
    with open(mapFileName) as mapFile:
         s = mmap.mmap(mapFile.fileno(), 0, access=mmap.ACCESS_READ)
         hasWater = s.find(b'water') != -1
         hasHindering = s.find(b'hindering') != -1 or s.find(b'obscuring') != -1
         hasBlocking = s.find(b'blocking') != -1
         hasLocationBonus = s.find(b'CONSOLATION') != -1
         hasElevation = s.find(b'elevation') != -1 or s.find(b'defaultElevation') != -1
         mapJson = json.load(mapFile)
         if 'walls' in mapJson:
             hasWalls = len(mapJson['walls']) != 0
         else:
             hasWalls = False
         if hasWater:
             water.append(map['id'])
         if hasHindering:
             hindering.append(map['id'])
         if hasBlocking:
             blocking.append(map['id'])
         if hasLocationBonus:
             locationBonus.append(map['id'])
         if hasElevation:
             elevation.append(map['id'])
         if hasWalls:
             walls.append(map['id'])
         if mapJson['width'] == 8:
             _8x8.append(map['id'])
         elif mapJson['width'] == 16 and mapJson['height'] == 16:
             _16x16.append(map['id'])
         elif mapJson['width'] == 16 and mapJson['height'] == 24:
             _16x24.append(map['id'])
         elif mapJson['width'] == 24:
             _24x24.append(map['id'])
         if mapJson['type'] == 'indoor':
             indoor.append(map['id'])
         elif mapJson['type'] == 'outdoor':
             outdoor.append(map['id'])
         else:
             indoor_outdoor.append(map['id'])

filterDict = {}
sizesDict = {}
sizesDict['8x8'] = _8x8
sizesDict['16x16'] = _16x16
sizesDict['16x24'] = _16x24
sizesDict['24x24'] = _24x24
filterDict['sizes'] = sizesDict
terrainDict = {}
terrainDict['water'] = water
terrainDict['hindering'] = hindering
terrainDict['blocking'] = blocking
terrainDict['elevation'] = elevation
terrainDict['walls'] = walls
filterDict['terrain'] = terrainDict
filterDict['locationBonus'] = locationBonus
typesDict = {}
typesDict['indoor'] = indoor
typesDict['outdoor'] = outdoor
typesDict['indoorOutdoor'] = indoor_outdoor
filterDict['types'] = typesDict

with open('filters.json', 'w') as fo:
    json.dump(filterDict, fo)
toc.close()
