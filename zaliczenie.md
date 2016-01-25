###Zadanie 1a MongoDB

#####Import pliku bazy danych Reddit RC_2015-01 do bazy MongoDB wersja 3.0.7

Pobrałam plik bazy **Reddit** ze wszystkimi komentarzami ze stycznia 2015 wielkości 5.5 GB ze strony [archive.org](www.archive.org/download/2015_reddit_comments_corpus/reddit_data/2015/).
Zaimportowałam go do bazy MongoDB (skompresowany) korzystając z poniższej komendy:
```sh
time bunzip2 -c RC_2015-01.bz2 | mongoimport --drop --host 127.0.0.1 -d test -c reddit
```
![import](img/obraz1.png)

* pierwszy przykładowy json z kolekcji (wraz ze wszystkimi rekordami):
```sh
db.reddit.findOne()
{
	"_id" : ObjectId("5657848cc40dd605ebeb4d7d"),
	"score_hidden" : false,
	"name" : "t1_cnas8zv",
	"link_id" : "t3_2qyr1a",
	"body" : "Most of us have some family members like this. *Most* of my family is like this. ",
	"downs" : 0,
	"created_utc" : "1420070400",
	"score" : 14,
	"author" : "YoungModern",
	"distinguished" : null,
	"id" : "cnas8zv",
	"archived" : false,
	"parent_id" : "t3_2qyr1a",
	"subreddit" : "exmormon",
	"author_flair_css_class" : null,
	"author_flair_text" : null,
	"gilded" : 0,
	"retrieved_on" : 1425124282,
	"ups" : 14,
	"controversiality" : 0,
	"subreddit_id" : "t5_2r0gj",
	"edited" : false
} 
```
Historia Procesora:

![procesor](img/obraz2.png)

Procesory były obciążone równomiernie od 25 do 95 procent. Widać, że w trakcie importu kolejne rdzenie przegrzewają się i wyłączają co kilka sekund, a inne rdzenie przejmują pracę. Pamięć była wykorzystywana od 28 do 31 procent. 

Połączyłam się z mongo, przeszłam do bazy testy i wybrałam kolekcję reddit:
```sh
mongo
MongoDB shell version: 3.0.7
connecting to: test
> show dbs
local	0.203125GB
test	37.935546875GB
> use test
switched to db test
> show collections
reddit
system.indexes
```
Policzyłam wszystkie jsony:

![json](img/obraz3.png)

##### Dodałam przykładowe zapytania:

* wyświetlenie wpisów z liczbą polubień ponad 6000 ("ups") - największy wynik (tylko nazwa autora, komentarz, nazwa subreddita i liczba polubień komentarza):
```sh
db.reddit.find({ups: { $gte: 6000}}, {_id:0, author:1, body:1, subreddit:1, ups:1})
{
  "body": "I can answer this one.  For some reason, I attract these people into my life.  [...]  Nobody has it all.  Nobody.",
  "subreddit": "AskReddit",
  "author": "a1988eli",
  "ups": 6597
}
Fetched 3 record(s) in 646239ms
```
* wyświetlenie 5 autorów wpisów nagrodzonych "złotem" siedmio- i ośmiokrotnie (tylko nazwa autora i liczba nagrodzeń):
```sh
db.reddit.find({gilded : {$in: [7, 8]}},{_id:0, author:1, gilded:1}).limit(5)
{
  "author": "Xarasystral",
  "gilded": 7
}
{
  "gilded": 8,
  "author": "coughdropz"
}
{
  "gilded": 7,
  "author": "lalaland40000"
}
{
  "author": "IMoustacheYou",
  "gilded": 7
}
{
  "author": "desmunda1",
  "gilded": 7
}
Fetched 5 record(s) in 453257ms
```
* wyświetlenie 5 pierwszych wpisów nagrodzonego ośmiokrotnie złotem autora "coughdropz" (tylko nazwa autora i komentarz):
```sh
db.reddit.find({author: "coughdropz"}, {_id:0, author:1, body:1}).limit(5)
{
  "body": "Expecting a big game from Nico Suave tonight!"
}
{
  "body": "I got downvoted to hell for calling this guy a joke.  He's going to be demanding a starting position for the Bejing Ducks or some shit if he's not careful."
}
{
  "body": "I backed it up!  Don't judge downvotes from a post you never read.  "
}
{
  "body": "It has very little to do with his skill as an athlete and more to do with his negative basketball IQ, terrible shot selection, and HILARIOUSLY stupid comments to the media.  Get off your high horse, the guy who's shooting 28% from 3 while still jacking them up, talks shit about dread locks while sitting 10 feet from a teammate with dread locks, and gets WAIVED because he's such a fool the Pistons would rather pay him to play for someone else is a JOKE.  Not to mention he then demands a starting role instead of working to rehab his career.  Why do we have to play pretend for the sake of Josh Smith's feelings?  If you hurt your team, get waived, demand a starting role, and promptly shit the bed, you're a joke.\n\n"
}
{
  "body": "He started it.  I have dread locks!"
}
Fetched 5 record(s) in 60668ms
```
Historia procesora podczas wyszukiwania wpisów autora "coughdropz":

![wyszukiwanie](img/obraz4.png)

* wyświetlenie 5 subredditów na literę "m" z pominięciem 3 pierwszych:
```sh
db.reddit.find({subreddit: /^m/}, {_id:0, subreddit:1}).skip(3).limit(5)
{
  "subreddit": "mistyfront"
}
{
  "subreddit": "marvelstudios"
}
{
  "subreddit": "mercedes"
}
{
  "subreddit": "milwaukee"
}
{
  "subreddit": "magicTCG"
}
Fetched 5 record(s) in 3ms
```
* zliczenie wszystkich wpisów w subreddicie "marvelstudios":
```sh
db.reddit.find({subreddit: "marvelstudios"}).count()
27924
```
* wyświetlenie grupowania 5 najbardziej aktywnych subredditów:
```sh
db.reddit.aggregate([ 
{$group:{_id: "$subreddit", count:{$sum: 1}}},
{$sort:{count: -1}},
{$limit: 5}
]);
{
  "result": [
    {
      "_id": "AskReddit",
      "count": 4712795
    },
    {
      "_id": "nfl",
      "count": 932460
    },
    {
      "_id": "funny",
      "count": 930098
    },
    {
      "_id": "leagueoflegends",
      "count": 904297
    },
    {
      "_id": "pics",
      "count": 778942
    }
  ],
  "ok": 1
}
```
![chart](img/chart1.png)

* znajdź ostatni wpis w kolekcji:
```sh
db.reddit.findOne( {$query:{}, $orderby:{$natural:-1}} )
{
	"_id" : ObjectId("56579d9ec40dd605eb210312"),
	"author_flair_text" : "RRRAURGH!",
	"gilded" : 0,
	"score_hidden" : false,
	"id" : "co77gzt",
	"parent_id" : "t1_co6zqmw",
	"distinguished" : null,
	"ups" : 3,
	"downs" : 0,
	"created_utc" : "1422748799",
	"name" : "t1_co77gzt",
	"body" : "You can already shoot through walls without Shred.",
	"author_flair_css_class" : "valkyr-bastet",
	"subreddit_id" : "t5_2urg0",
	"link_id" : "t3_2uazsm",
	"controversiality" : 0,
	"edited" : false,
	"retrieved_on" : 1424281770,
	"author" : "blolfighter",
	"subreddit" : "Warframe",
	"archived" : false,
	"score" : 3
}
```
###Zadanie 1b Postgres

#####Import pliku bazy danych Reddit RC_2015-01 do bazy Postgres wersja 9.4.5

Do zaimportowania rozpakowanego pliku RC_2015-01 użyłam programu pgfutter pobranego z tej strony [github.com/lukasmartinelli](https://github.com/lukasmartinelli/pgfutter). Zaimportowałam plik korzystając z poniższej komendy:
```sh
time ./pgfutter --db postgres --user postgres --pw 123456 json RC_2015-01
```
![import](img/obraz5.png)

Historia Procesora:

![procesor](img/obraz6.png)

Procesory były obciążone równomiernie od 5 do 60 procent. Pamięć była wykorzystywana od 31 do 35 procent.

Policzyłam wszystkie jsony:

![json](img/obraz7.png)

Historia Procesora podczas liczenia:

![json](img/obraz8.png)

##### Dodałam przykładowe zapytania:

* znajdź pierwszy:
```sh
postgres=# select * from import.rc_2015_01 LIMIT 1;
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 {"score_hidden":false,"name":"t1_cnas8zv","link_id":"t3_2qyr1a","body":"Most of us have some family members like this. *Most* of my family is like this. ","downs":0,"created_utc":"1420070400","score":14,"author":"YoungModern","distinguished":null,"id":"cnas8zv","archived":false,"parent_id":"t3_2qyr1a","subreddit":"exmormon","author_flair_css_class":null,"author_flair_text":null,"gilded":0,"retrieved_on":1425124282,"ups":14,"controversiality":0,"subreddit_id":"t5_2r0gj","edited":false}+
 
(1 wiersz)
```
* wyświetlenie 5 subredditów na literę "m" z pominięciem 3 pierwszych:
```sh
SELECT data->>'subreddit' AS subreddit FROM import.rc_2015_01 WHERE data->>'subreddit' like ('m%') LIMIT 5 OFFSET 3;    
----------------
 mistyfront
 marvelstudios
 mercedes
 milwaukee
 magicTCG
(5 wiersze)
```
Czas: natychmiast

##### Porównanie działania MongoDB i PostgreSQL:

|Baza danych 					| MongoDB 		| PostgreSQL 				|
|-----------------------------------------------|-----------------------|---------------------------------------|
|Wersja						|3.0.7			|9.4.5					|
|Czas importu					|1h49m56s		|1h32m22s				|
|Czas zliczenia rekordów			|<1s			|22m30s					|
|Import bazy danych				|jedna komenda		|przy użyciu programu pgfutter		|
|Obciążenie procesora w trakcie importu		|mongoimport: większe (25-95%)	|pgfutter: mniejsze (5-60%)	|
|Łatwość wyszukiwania jsonów			|+ (osobne rekordy)	|- (wszystkie rekordy w jednej linijce)	|

###Zadanie 2 GeoJSON

#####Import pliku orlen.json do bazy MongoDB

Pobrałam plik bazy danych lokalizacji stacji benzynowych Orlen w Polsce orlen.json. Lokalna kopia bazy: [orlen.json](www.github.com/jkowalska/nosql/blob/master/img/orlen.json). Zaimportowałam plik do bazy MongoDB korzystając z poniższej komendy:
```sh
time mongoimport -d orlen -c stacje < orlen.json
```
Czas importowania pliku:
```sh
imported 1245 objects

real	0m0.572s
user	0m0.088s
sys	0m0.088s
```
* przykładowy pierwszy geojson:
```sh
db.stacje.findOne()
{
	"_id" : ObjectId("56587fb9d3d1ab580a563180"),
	"loc" : {
		"type" : "Point",
		"coordinates" : [
			20.021194,
			49.453218
		]
	},
	"name" : "Stacje paliw Orlen",
	"city" : "Nowy Targ"
}
```
[Geojson "Point"](img/test1.geojson "Point")

Dodałam geoindeks do kolekcji stacje:
```sh
db.stacje.ensureIndex({loc : "2dsphere"})
{
	"createdCollectionAutomatically" : false,
	"numIndexesBefore" : 1,
	"numIndexesAfter" : 2,
	"ok" : 1
}
```
##### Dodałam przykładowe zapytania:

Do opracowania zapytań skorzystałam ze strony [geojson.io](www.geojson.io/#map=2/20.1/-0.2).

* znajdź stacje Orlen oddalone od Władysławowa o maksymalnie o 25km:
```sh
db.stacje.find({loc: {$near: {$geometry: {type: "Point", coordinates: [18.405400,54.775920]}, $maxDistance: 25000}}}).skip(1)
{ "_id" : ObjectId("56587fbad3d1ab580a56352d"), "loc" : { "type" : "Point", "coordinates" : [ 18.40589, 54.71592 ] }, "name" : "Stacje paliw Orlen", "city" : "Puck" }
{ "_id" : ObjectId("56587fbad3d1ab580a5634a4"), "loc" : { "type" : "Point", "coordinates" : [ 18.1183, 54.78674 ] }, "name" : "Stacje paliw Orlen", "city" : "Odargowo" }
{ "_id" : ObjectId("56587fbad3d1ab580a563614"), "loc" : { "type" : "Point", "coordinates" : [ 18.27235, 54.60235 ] }, "name" : "Stacje paliw Orlen", "city" : "Wejherowo" }
{ "_id" : ObjectId("56587fbad3d1ab580a563332"), "loc" : { "type" : "Point", "coordinates" : [ 18.37933, 54.57634 ] }, "name" : "Stacje paliw Orlen", "city" : "Rumia" }
{ "_id" : ObjectId("56587fbad3d1ab580a5633fc"), "loc" : { "type" : "Point", "coordinates" : [ 18.18959, 54.61076 ] }, "name" : "Stacje paliw Orlen", "city" : "Wejherowo" }
{ "_id" : ObjectId("56587fbad3d1ab580a563327"), "loc" : { "type" : "Point", "coordinates" : [ 18.42266, 54.56018 ] }, "name" : "Stacje paliw Orlen", "city" : "Rumia" }
```
[Geojson "Point"](img/test2.geojson "Point")

* znajdź stacje w Pucku i najbliższych 3 miastach:
```sh
db.stacje.find({loc: {$near: {$geometry: {type: "Point", coordinates: [18.405890,54.715920]}}}}).limit(3)
{ "_id" : ObjectId("56587fbad3d1ab580a56352d"), "loc" : { "type" : "Point", "coordinates" : [ 18.40589, 54.71592 ] }, "name" : "Stacje paliw Orlen", "city" : "Puck" }
{ "_id" : ObjectId("56587fbad3d1ab580a563490"), "loc" : { "type" : "Point", "coordinates" : [ 18.4054, 54.77592 ] }, "name" : "Stacje paliw Orlen", "city" : "Władysławowo" }
{ "_id" : ObjectId("56587fbad3d1ab580a563614"), "loc" : { "type" : "Point", "coordinates" : [ 18.27235, 54.60235 ] }, "name" : "Stacje paliw Orlen", "city" : "Wejherowo" }
```
[Geojson "Point"](img/test3.geojson "Point")

* znajdź stacje na linii Gdańsk - Lębork:
```sh
db.stacje.find({loc: {$geoIntersects: {$geometry: {type: "LineString", coordinates: [ [18.477135,54.380675], [17.797210,54.551720]]}}}})
{ "_id" : ObjectId("56587fbad3d1ab580a56329a"), "loc" : { "type" : "Point", "coordinates" : [ 18.477135, 54.380675 ] }, "name" : "Stacje paliw Orlen", "city" : "Gdańsk" }
{ "_id" : ObjectId("56587fbad3d1ab580a5633fe"), "loc" : { "type" : "Point", "coordinates" : [ 17.79721, 54.55172 ] }, "name" : "Stacje paliw Orlen", "city" : "Lębork" }
```
[Geojson "LineString"](img/test4.geojson "LineString")

* znajdź stacje w Słupsku i okolicach:
```sh
db.stacje.find({loc: {$geoWithin: {$geometry: {type: "Polygon", coordinates: [[
	    [
              16.93817138671875,
              54.410938637023676
            ],
            [
              16.93817138671875,
              54.51470449573694
            ],
            [
              17.12493896484375,
              54.51470449573694
            ],
            [
              17.12493896484375,
              54.410938637023676
            ],
            [
              16.93817138671875,
              54.410938637023676
            ]
            ]]}}}})
{ "_id" : ObjectId("56587fbad3d1ab580a5632de"), "loc" : { "type" : "Point", "coordinates" : [ 17.04061, 54.46524 ] }, "name" : "Stacje paliw Orlen", "city" : "Słupsk" }
{ "_id" : ObjectId("56587fbad3d1ab580a5635e8"), "loc" : { "type" : "Point", "coordinates" : [ 17.02624, 54.47686 ] }, "name" : "Stacje paliw Orlen", "city" : "Słupsk" }
{ "_id" : ObjectId("56587fbad3d1ab580a5633c0"), "loc" : { "type" : "Point", "coordinates" : [ 16.96817, 54.45112 ] }, "name" : "Stacje paliw Orlen", "city" : "Kobylnica" }
{ "_id" : ObjectId("56587fbad3d1ab580a5632df"), "loc" : { "type" : "Point", "coordinates" : [ 16.99288, 54.45748 ] }, "name" : "Stacje paliw Orlen", "city" : "Słupsk" }
```
[Geojson "Polygon"](img/test5.geojson "Polygon")
