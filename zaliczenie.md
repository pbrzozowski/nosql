###Zadanie 1a MongoDB

Zaimportowałem plik bazy **Reddit** ze wszystkimi komentarzami do grudnia 2010r. ze strony [archive.org](www.archive.org/download/2015_reddit_comments_corpus/reddit_data/2010/).
korzystając z poniższej komendy:
```sh
bunzip2 -c RC_2010-12.bz2 | mongoimport --drop --host 127.0.0.1 -d test -c reddit
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

Procesory były obciążone równomiernie od 25 do 95 procent. 
Pamięć była wykorzystywana od 28 do 31 procent. 

* policzyłem wszystkie ekordy:
```sh
> db.reddit.count()
5972642
```

* wyświetlenie [3] wpisów z liczbą polubień ponad 2000, wraz z urywkiem komentarza, liczba polubień oraz nazwą autroa 
```sh
> db.reddit.find({ups: { $gte: 2000}}, {_id:0, author:1, body:1, ups:1}).limit(3)
{ 
"author" : "lps41",
"ups" : 2699,
"body" : "Obama was a sellout when he [backed off on closing Guantanamo] http://www.nytimes.com/2010/06/26/us/politics/26gitmo.html?_r=1&amp;partner=rss&amp;emc=rss). \n\nObama was a sellout when he [...]**Obama has been a sellout since day one.**\n\n*Please respect the amount of work put into this comment by replying to explain why you're downvoting, if you do so*." 
}

{ 
"body" : "We call that \"The Long Troll.\"",
 „ups" : 2126,
 "author" : "AngusMustang" 
}

{ 
"ups" : 2232,
"author" : "barehandhunter", 
"body" : "The answer is yes, although I suspect you underestimate the power and lightening-fast reflexes of a wolf.  […. ] I'll do another post soon on how to properly field dress, skin, and prepare a dog for eating." 
}
```

* zliczenie wszystkich autorów zaczynajacych sie na litere p
```sh
> db.reddit.find({author: /^p/}).count()
143369
```

* wyświetlenie [3] najlepiej ocenianych tematów
```sh
> db.reddit.find({},{_id:0,body:1}).sort({"sorce":-1}).limit(3)
{ "body" : "This is a failure for Google. Shame on you, Google." }
{ "body" : "you made an excellent choice not buying a home in arizona" }
{ "body" : "I cannot believe how much this made me laugh. " }
```
* znajdź ostatni wpis w kolekcji:
```sh
db.reddit.findOne( {$query:{}, $orderby:{$natural:-1}} )
{
	"_id" : ObjectId("56579d9ec40dd605eb210312"),
	"author_flair_text" : "alibaba",
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

Na początku rozpakowałem plik pleceniem
```sh
bunzip2 -d RC_2010-12.bz2
```
Do zaimportowania rozpakowanego pliku RC_2010-12 użyłem programu pgfutter korzystając z poniższej komendy:
```sh
./pgfutter --db postgres --user test --pw test json RC_2010-12
```
![import](img/obraz5.png)

Historia Procesora:

![procesor](img/obraz6.png)

Procesory były obciążone równomiernie od 5 do 60 procent. Pamięć była wykorzystywana od 31 do 35 procent.

* policzyłem wszystkie rekordy:
```sh
select count(*) from import.rc_2010_12;
  count  
---------
 5972642
```

* znajdź pierwszy:
```sh
postgres=# select * from import.rc_2010_12 LIMIT 1;
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 {"score_hidden":false,"name":"t1_cnas8zv","link_id":"t3_2qyr1a","body":"Most of us have some family members like this. *Most* of my family is like this. ","downs":0,"created_utc":"1420070400","score":14,"author":"YoungModern","distinguished":null,"id":"cnas8zv","archived":false,"parent_id":"t3_2qyr1a","subreddit":"exmormon","author_flair_css_class":null,"author_flair_text":null,"gilded":0,"retrieved_on":1425124282,"ups":14,"controversiality":0,"subreddit_id":"t5_2r0gj","edited":false}+
 
(1 wiersz)
```
* zliczenie wszystkich autorów zaczynajacych sie na litere p
```sh
SELECT count(*) FROM import.rc_2010_12 WHERE data->>'author' like ('p%');
 143369
```
* wyswietlenie subreddit zaczynajacych sie na litere i
```sh
SELECT data->>'subreddit' AS subreddit FROM import.rc_2010_12 WHERE data->>'subreddit' LIKE ('i%') LIMIT 10;
   subreddit   
---------------
 iaido
 itookapicture
 iphone
 ireland
 iphone
 itookapicture
 itookapicture
 iphone
 india
 india
 ```
 
##### Porównanie działania MongoDB i PostgreSQL:

|Baza danych 					| MongoDB 		| PostgreSQL 				|
|-----------------------------------------------|-----------------------|---------------------------------------|
|Wersja						|3.0.7			|9.4.5					|
|Czas importu					|+ 09m53s		|- 12m31s + rozpakowaine 4min		|
|Czas zliczenia rekordów			|+ <1s			|- ok 1min				|
|Import bazy danych				|+ jedna komenda	|- przy użyciu programu pgfutter	|
|Obciążenie procesora w trakcie importu		|- mongoimport: większe	|+ pgfutter: mniejsze			|
|Łatwość wyszukiwania jsonów			|+ (osobne rekordy)	|- (wszystkie rekordy w jednej linijce)	|
|Suma plusów					| 4 pozytywy		| 1 pozytyw				|

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
