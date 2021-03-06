

Dane pobrane z http://www.rita.dot.gov czwartego kwartalu 2014 roku.


| System  | Czas | Wersja Mongo 
| :------- | :---: | :---:|
| Debian | 1m12s| Mongo 3.0.7 |

----------
####Import baz csv


```js
mongoimport -d patryk -c air -type csv --headerline --file On_Time_On_Time_Performance_2014_10.csv
mongoimport -d patryk -c air -type csv --headerline --file On_Time_On_Time_Performance_2014_11.csv
mongoimport -d patryk -c air -type csv --headerline --file On_Time_On_Time_Performance_2014_12.csv
```
Historia Procesora:

![procesor](img/procesor mongo2.jpg)

#### Liczba rekordów


```js
db.air.find().count()

result: 1430248

```
####Przykładowy rekord:

```js
{
"_id" : ObjectId("56abc17b39c39673079c393b"),
	"Year" : 2014,
	"Quarter" : 4,
	"Month" : 10,
	"DayofMonth" : 23,
	"DayOfWeek" : 4,
	"FlightDate" : "2014-10-23",
	"UniqueCarrier" : "DL",
	"AirlineID" : 19790,
	"Carrier" : "DL",
	"TailNum" : "N918DL",
	"FlightNum" : 1954,
	"OriginAirportID" : 11298,
	"OriginAirportSeqID" : 1129803,
	"OriginCityMarketID" : 30194,
	"Origin" : "DFW",
	"OriginCityName" : "Dallas/Fort Worth, TX",
	"OriginState" : "TX",
	"OriginStateFips" : 48,
	"OriginStateName" : "Texas",
	"OriginWac" : 74,
	"DestAirportID" : 10397,
	"DestAirportSeqID" : 1039705,
	"DestCityMarketID" : 30397,
	"Dest" : "ATL",
	"DestCityName" : "Atlanta, GA",
	"DestState" : "GA",
	"DestStateFips" : 13,
	"DestStateName" : "Georgia",
	"DestWac" : 34,
	"CRSDepTime" : 700,
	"DepTime" : 656,
	"DepDelay" : -4,
	"DepDelayMinutes" : 0,
	"DepDel15" : 0,
	"DepartureDelayGroups" : -1,
	"DepTimeBlk" : "0700-0759",
	"TaxiOut" : 15,
	"WheelsOff" : 711,
	"WheelsOn" : 946,
	"TaxiIn" : 13,
	"CRSArrTime" : 1006,
	"ArrTime" : 959,
	"ArrDelay" : -7,
	"ArrDelayMinutes" : 0,
	"ArrDel15" : 0,
	"ArrivalDelayGroups" : -1,
	"ArrTimeBlk" : "1000-1059",
	"Cancelled" : 0,
	"CancellationCode" : "",
	"Diverted" : 0,
	"CRSElapsedTime" : 126,
	"ActualElapsedTime" : 123,
	"AirTime" : 95,
	"Flights" : 1,
	"Distance" : 731,
	"DistanceGroup" : 3,
 }
```
##Agregacje: 

####1. Miesiac w którym wykonano najwicej lotów z okresu ( październik, listopad, grudzień )

Czyźby grudzień ?

#####Java
```js
db.air.aggregate(
    {$group : 
        { _id : {month : "$Month" }, 
        air : { $sum : 1 }}}, 
    { $sort : { air : -1 }}, 
    { $limit : 1 }
)
```
#####Python
```js
import pymongo
import json
from bson.son import SON
from pymongo import MongoClient
client = MongoClient()

db = client['patryk']
collection = db['air']

pipeline = [
    {$group : 
        { _id : {month : "$Month" }, 
        air : { $sum : 1 }}}, 
    { $sort : { air : -1 }}, 
    { $limit : 1 }
]
zapytanie = db.air.aggregate(pipeline)
for doc in zapytanie:
   print(doc)
```


A wlasnie że nie :)
####Odpowiedz :
```js
{
    "result" : [
		{
			"_id" : {
				"month" : 10
			},
			"air" : 491011
		}
	]
}
```
----------

####2. Numer trzech linii lotu, które spedzily najwięcej czasu w powietrzu

#####Java
```js
db.air.aggregate(
    { $group : 
        { _id : {flightNumber : "$FlightNum" },
        airTime : { $sum : "$AirTime" }}}, 
    { $sort : { airTime : -1 }},
    { $limit : 3 }
)
```
#####Python
```js
import pymongo
import json
from bson.son import SON
from pymongo import MongoClient
client = MongoClient()

db = client['patryk']
collection = db['air']

pipeline = [
    { $group : 
        { _id : {flightNumber : "$FlightNum" },
        airTime : { $sum : "$AirTime" }}}, 
    { $sort : { airTime : -1 }},
    { $limit : 3 }
]
zapytanie = db.air.aggregate(pipeline)
for doc in zapytanie:
   print(doc)
```

####Odpowiedz :
```js
{
    "result" : [
		{
			"_id" : {
				"flightNumber" : 15
			},
			"airTime" : 223706
		},
		{
			"_id" : {
				"flightNumber" : 23
			},
			"airTime" : 185170
		},
		{
			"_id" : {
				"flightNumber" : 12
			},
			"airTime" : 175932
		}
	]
```
----------

####3. Trzy samoloty które wykonaly najwicej latów do Atlanty

#####Java
```js
db.air.aggregate(
    {$match:{Dest:"ATL"}},
    {$group : 
        { _id : {TailNum : "$TailNum"}, 
        countofFlights: { $sum : 1 }}}, 
    { $sort : {countofFlights : -1 }}, 
    { $limit : 3 }
)
```
#####Python
```js
import pymongo
import json
from bson.son import SON
from pymongo import MongoClient
client = MongoClient()

db = client['patryk']
collection = db['air']

pipeline = [
    {$match:{Dest:"ATL"}},
    {$group : 
        { _id : {TailNum : "$TailNum"}, 
        countofFlights: { $sum : 1 }}}, 
    { $sort : {countofFlights : -1 }}, 
    { $limit : 3 }
]
zapytanie = db.air.aggregate(pipeline)
for doc in zapytanie:
   print(doc)
```

####Odpowiedz :
```js
{
"result" : [
		{
			"_id" : {
				"TailNum" : "N980EV"
			},
			"countofFlights" : 236
		},
		{
			"_id" : {
				"TailNum" : "N968AT"
			},
			"countofFlights" : 228
		},
		{
			"_id" : {
				"TailNum" : "N914EV"
			},
			"countofFlights" : 228
		}
	]
```
----------

####4. Trzy miasta które byly najczesciej odwiedzane, wedlug liczby ladowan

#####Java
```js
db.air.aggregate(
    {$group: 
        { _id : {city : "$DestCityName" }, 
        totalDelays : { $sum : 1 }}}, 
    { $sort : {totalDelays: -1 }}, 
    {$limit : 3 }
)
```
#####Python
```js
import pymongo
import json
from bson.son import SON
from pymongo import MongoClient
client = MongoClient()

db = client['patryk']
collection = db['air']

pipeline = [
    {$group: 
        { _id : {city : "$DestCityName" }, 
        totalDelays : { $sum : 1 }}}, 
    { $sort : {totalDelays: -1 }}, 
    {$limit : 3 }
]
zapytanie = db.air.aggregate(pipeline)
for doc in zapytanie:
   print(doc)
```

####Odpowiedz :
```js
	"result" : [
		{
			"_id" : {
				"city" : "Chicago, IL"
			},
			"totalDelays" : 95412
		},
		{
			"_id" : {
				"city" : "Atlanta, GA"
			},
			"totalDelays" : 90909
		},
		{
			"_id" : {
				"city" : "Dallas/Fort Worth, TX"
			},
			"totalDelays" : 68252
		}
	]
```
----------
