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

Do tego zadania użyłem współrzędnych geograficznych stacji paliw pobranych z serwisu poipoint.pl w formacie csv.
Do poprawienia formatu danych wykorzystałem [skrypt](https://github.com/pbrzozowski/nosql/blob/master/fix_fuel.js)
```sh
time mongoimport -d Trains -c fuel --type csv --file Stacje_Paliw.csv --headerline
```

Przykładowy poprawiony dokument:
```sh
> db.fuel.findOne()
{
	"_id" : ObjectId("5468cadcc5e4ff939974b1b5"),
	"city" : "Velence",
	"loc" : {
		"type" : "Point",
		"coordinates" : [
			18.637587,
			47.244133
		]
	}
}
>
```

Dodajemy geo-indeks do kolekcji:
```sh
> db.fuel.ensureIndex({"loc": "2dsphere"})
```


* 10 najbliższych stacji paliw w promieniu 20km od centrum Gdańska
```sh
> var gdansk = { "type": "Point", "coordinates": [18.65, 54.35] }
> db.fuel.find({ loc: { $near: { $geometry: gdansk }, $maxDistance: 20000 } }).limit(10).toArray()
[
	{
		"_id" : ObjectId("5468cadcc5e4ff939974acf3"),
		"city" : "Gdańsk",
		"loc" : {
			"type" : "Point",
			"coordinates" : [
				18.59567,
				54.3509
			]
		}
	},
	{
		"_id" : ObjectId("5468cadcc5e4ff939974ad4c"),
		"city" : "Gdańsk",
		"loc" : {
			"type" : "Point",
			"coordinates" : [
				18.71147,
				54.3506
			]
		}
	},
	{
		"_id" : ObjectId("5468cadcc5e4ff939974ae4f"),
		"city" : "Gdańsk",
		"loc" : {
			"type" : "Point",
			"coordinates" : [
				18.65841,
				54.391505
			]
		}
	},
	{
		"_id" : ObjectId("5468cadcc5e4ff939974b05e"),
		"city" : "Gdańsk",
		"loc" : {
			"type" : "Point",
			"coordinates" : [
				18.571749,
				54.337487
			]
		}
	},
	{
		"_id" : ObjectId("5468cadcc5e4ff939974ad8f"),
		"city" : "Gdańsk",
		"loc" : {
			"type" : "Point",
			"coordinates" : [
				18.619926,
				54.394374
			]
		}
	},
	{
		"_id" : ObjectId("5468cadcc5e4ff939974ad95"),
		"city" : "Gdańsk",
		"loc" : {
			"type" : "Point",
			"coordinates" : [
				18.621572,
				54.397784
			]
		}
	},
	{
		"_id" : ObjectId("5468cadcc5e4ff939974ad1c"),
		"city" : "Gdańsk",
		"loc" : {
			"type" : "Point",
			"coordinates" : [
				18.59482,
				54.40933
			]
		}
	},
	{
		"_id" : ObjectId("5468cadcc5e4ff939974acf4"),
		"city" : "Gdańsk",
		"loc" : {
			"type" : "Point",
			"coordinates" : [
				18.52591,
				54.35009
			]
		}
	},
	{
		"_id" : ObjectId("5468cadcc5e4ff939974ace9"),
		"city" : "Kowale",
		"loc" : {
			"type" : "Point",
			"coordinates" : [
				18.546702,
				54.304205
			]
		}
	},
	{
		"_id" : ObjectId("5468cadcc5e4ff939974ad10"),
		"city" : "Straszyn",
		"loc" : {
			"type" : "Point",
			"coordinates" : [
				18.59435,
				54.27803
			]
		}
	}
]
```

Przekształcenie do formatu geojson za pomocą [skryptu](https://github.com/pbrzozowski/nosql/blob/master/to_geojson.js)<br>
Mapa: https://github.com/pbrzozowski/nosql/blob/master/1_result.geojson

* Stacje paliw w promieniu 0.8° od Olsztyna
```sh
var olsztyn = { "type": "Point", "coordinates": [20.48, 53.78] }
db.fuel.find({
	loc: {
		$geoWithin: {
			$center: [[olsztyn.coordinates[0], olsztyn.coordinates[1]], 0.80]
		}
	}
}).limit(5).toArray();
```
Mapa: https://github.com/pbrzozowski/nosql/blob/master/2_result.geojson

* 100 stacji paliw na obszarze pomiędzy Gdańskiem, Olsztynem i Poznaniem.
```sh
db.fuel.find({
	loc: {
		$geoWithin: {
			$geometry: {
				"type": "Polygon",
				"coordinates": [[
					[18.65, 54.35],
					[20.48, 53.78],
					[16.93, 52.41],
					[18.65, 54.35]
				]]
			}
		}
	}
}).limit(100).toArray();
```
Mapa: https://github.com/pbrzozowski/nosql/blob/master/3_result.geojson

* Stacje paliw na linii Warszawa-Gdańsk
```sh
var line = {
	"type": "LineString",
	"coordinates": [[20.904929, 52.239413], [19.424150, 54.374859]]
}
db.fuel.find({
	loc: {
		$geoIntersects: {
			$geometry: line
		}
	}
}).limit(100).toArray();
```
Mapa: https://github.com/pbrzozowski/nosql/blob/master/4_result.geojson
