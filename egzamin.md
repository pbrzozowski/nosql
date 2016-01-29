###Zad 2
Pobrałem dane dotyczące ruchu lotniczego na terenie USA w drugiej połowe 2014 roku http://www.rita.dot.gov

Przykładowe agregacje w javie [TUTAJ](https://github.com/jcimoch/noSQL-labs/blob/master/mongoAgregate.java)

| Machine  | Time | Comment 
| :------- | :---: | :---:|
| Desktop | 19s| Mongo 2.6.5 Standard|
| Desktop | 16s| **Mongo 2.8.0-rc0 !!**|


```js
mongoimport -d test -c air -type csv --headerline --file F:\Pobrane_firefox\On_Time_On_Time_Performance_2014_6.csv
mongoimport -d test -c air -type csv --headerline --file F:\Pobrane_firefox\On_Time_On_Time_Performance_2014_7.csv
mongoimport -d test -c air -type csv --headerline --file F:\Pobrane_firefox\On_Time_On_Time_Performance_2014_9.csv
```
```js
db.air.find().count()

result: 1492986

```
Przykładowy rekord:

```js
{
    "_id" : ObjectId("545fa176280408bab2081e89"),
    "Year" : 2014,
    "Quarter" : 2,
    "Month" : 6,
    "DayofMonth" : 1,
    "DayOfWeek" : 7,
    "FlightDate" : "2014-06-01",
    "UniqueCarrier" : "AA",
    "AirlineID" : 19805,
    "Carrier" : "AA",
    "TailNum" : "N787AA",
    "FlightNum" : 1,
    "OriginAirportID" : 12478,
    "OriginAirportSeqID" : 1247802,
    "OriginCityMarketID" : 31703,
    "Origin" : "JFK",
    "OriginCityName" : "New York, NY",
    "OriginState" : "NY",
    "OriginStateFips" : 36,
    "OriginStateName" : "New York",
    "OriginWac" : 22,
    "DestAirportID" : 12892,
    "DestAirportSeqID" : 1289203,
    "DestCityMarketID" : 32575,
    "Dest" : "LAX",
    "DestCityName" : "Los Angeles, CA",
    "DestState" : "CA",
    "DestStateFips" : 6,
    "DestStateName" : "California",
    "DestWac" : 91,
    "CRSDepTime" : 900,
    "DepTime" : 851,
    "DepDelay" : -9,
    "DepDelayMinutes" : 0,
    "DepDel15" : 0,
    "DepartureDelayGroups" : -1,
    "DepTimeBlk" : "0900-0959",
    "TaxiOut" : 18,
    "WheelsOff" : 909,
    "WheelsOn" : 1133,
    "TaxiIn" : 32,
    "CRSArrTime" : 1210,
    "ArrTime" : 1205,
    "ArrDelay" : -5,
    "ArrDelayMinutes" : 0,
    "ArrDel15" : 0,
    "ArrivalDelayGroups" : -1,
    "ArrTimeBlk" : "1200-1259",
    "Cancelled" : 0,
    "CancellationCode" : "",
    "Diverted" : 0,
    "CRSElapsedTime" : 370,
    "ActualElapsedTime" : 374,
    "AirTime" : 324,
    "Flights" : 1,
    "Distance" : 2475,
    "DistanceGroup" : 10
 }
```
Agregacje: 
```js
db.air.aggregate(
 {$group : 
 { _id : {city : "$DestCityName" }, 
 totalDelays : { $sum : "$DepDel15" } } }, 
 { $sort : {totalDelays: -1 } }, 
 { $limit : 3 } )
```
![alt-text](https://dl.dropboxusercontent.com/u/15067146/wyk1.PNG "agregacja 1")
```js
{
    "result" : [ 
        {
            "_id" : {
                "city" : "Chicago, IL"
            },
            "totalDelays" : 23423
        }, 
        {
            "_id" : {
                "city" : "Atlanta, GA"
            },
            "totalDelays" : 15066
        }, 
        {
            "_id" : {
                "city" : "Dallas/Fort Worth, TX"
            },
            "totalDelays" : 14618
        }
    ],
    "ok" : 1
}
```
Największy czas w powietrzu wedługu numeru lini lotu
```js
db.air.aggregate(
 {$group : 
 { _id : {flightNumbrer : "$FlightNum" }, 
 airTime : { $sum : "$AirTime" } } }, 
 { $sort : {airTime : -1 } }, 
 { $limit : 3 } )
 
```
![alt-text](https://dl.dropboxusercontent.com/u/15067146/wyk2.PNG "agregacja 2")

```js
{
    "result" : [ 
        {
            "_id" : {
                "flightNumbrer" : 15
            },
            "airTime" : 213156
        }, 
        {
            "_id" : {
                "flightNumbrer" : 201
            },
            "airTime" : 183216
        }, 
        {
            "_id" : {
                "flightNumbrer" : 23
            },
            "airTime" : 180092
        }
    ],
    "ok" : 1
}
```
Samolot kóry wykonał najwięcej lotów do Los Angeles
```js
db.air.aggregate(
{$match:{Dest:"LAX"}},
 {$group : 
 { _id : {TailNum : "$TailNum" }, 
 countOfFlights: { $sum : 1 } } }, 
 { $sort : {countOfFlights : -1 } }, 
 { $limit : 3 } )
```
![alt-text](https://dl.dropboxusercontent.com/u/15067146/wyk3.PNG "agregacja 3")

```js
{
    "result" : [ 
        {
            "_id" : {
                "TailNum" : "N492SW"
            },
            "countOfFlights" : 333
        }, 
        {
            "_id" : {
                "TailNum" : "N465SW"
            },
            "countOfFlights" : 327
        }, 
        {
            "_id" : {
                "TailNum" : "N464SW"
            },
            "countOfFlights" : 325
        }
    ],
    "ok" : 1
}

```
