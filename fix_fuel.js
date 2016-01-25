var connection = new Mongo();
var db = connection.getDB('Trains');
var fuel = db.fuel.find();

fuel.forEach(function (result) {
	var loc = {
		"type": "Point",
		"coordinates": [result.coo1, result.coo2]
	}
	db.fuel.update({_id: result._id},
		{ $set: { "loc": loc } }
	);
	db.fuel.update({_id: result._id},
		{ $unset: { "coo1": "", "coo2": "", "type": "", "address": "" } }
	);
});
