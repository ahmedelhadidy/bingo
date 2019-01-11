const util = require('util');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));
io.on('connection', function (socket) {
	socket.on('chat message', function (msg) {
		console.log('message: ' + msg);
		io.emit('chat message', msg);
	});
	socket.on('disconnect', function () {
		console.log('user disconnected');
	});
});

http.listen(3000, function () {
	console.log('listening on *:3000');
});

var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/cards/:num', function(req, res) {
    var pool = getNewPool();

    console.log('array at the beginning  = '+ pool);

    var cardsNumRequired = req.params.num;
    var cards=[];
    for(var i=0 ; i<cardsNumRequired;i++){
           var counter=0;
           var card = new Card(3);
           card.init();

           while(counter<15){
              var randomValueIndex = getRandom(pool);
              var val = randomValueIndex+1;
              console.log('try to allocate value of index '+randomValueIndex)
              console.log('try to allocate '+val)
              var isAllocated = card.allocate(val , randomValueIndex , pool);
              console.log('is value '+ val + ' allocated ' +isAllocated+ ' to card \n'+  util.inspect(card, {showHidden: false, depth: null}));
              if(isAllocated){
                counter++;
              }
           }
           cards[i] = card;
    }
   res.json(cards);

});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);



var Column = function (colNum , rowNums) {
	this.values= new Array(rowNums) ;
	this.rowNums = rowNums;
	this.num= colNum;
}
	Column.prototype = {
		haveRoom: function () {
			for (var i = 0; i < this.rowNums; i++) {
				if (!this.values[i]) {
					return true;
				}
			}
			return false;
		},

		getEmptyBoxIndex: function () {
			var emptyBoxsIndex = [] //myArray[Math.floor(Math.random() * myArray.length)];

			for (var i = 0; i < this.rowNums; i++) {
				if (!this.values[i]) {
					emptyBoxsIndex.push(i);
				}
			}

			if(emptyBoxsIndex.length>0){
			   return emptyBoxsIndex[Math.floor(Math.random() * emptyBoxsIndex.length)];
			}

			return null;
		},

		allocate: function (value, index) {
			this.values[index] = value;
		},

		hasValueInBox: function (index) {

			return values[index]
		},

		isValueBelong: function (value) {
		    console.log('is value '+value+' belong to '+this.num);
			if (value <= this.num && value >= (this.num - 9)) {
				return true;
			}else{
			    return false;
			}
		},

		getValueOf: function (index) {
			return this.values[index];
		}
	}

var Card = function (rowNum) {
	this.columns= [];
	this.rowNum = rowNum;
}
    Card.prototype ={

       init: function(){
         for(var i=1 ; i<10 ; i ++){
            var co = new Column(i*10,this.rowNum);
            this.columns[i-1] = co;
         }
       },
       hasRoom: function (rowNum) {
       		var counter = 0;
       		for (var i = 0; i < 9; i++) {
       			col = this.columns[i];
                console.log('column num '+ col.num + ' check row '+rowNum+' '+ util.inspect(col.values , {showHidden: false, depth: null}));
       			if (col.getValueOf(rowNum)) {
       				counter++;
       			}
       		}
       		console.log('found [' +counter+ '] values in row ' + rowNum);
       		if (counter >= 5) {
       			return false;
       		}

       		return true;
       	},

       	allocate: function (value, valueIndex, poolArr) {

       		var co = null;
       		for (var i = 0; i < 9; i++) {
       			var column = this.columns[i];
       			if (column.isValueBelong(value)) {
       			    console.log('value' +value+ ' belong to '+ column.num);
       			    i= 999;
       			     console.log('check is column has room' + util.inspect(column, {showHidden: false, depth: null}) );
       				if (column.haveRoom()) {
                       console.log('column has room ' + util.inspect(column, {showHidden: false, depth: null}) );
       					var index = null;
       					do{
       					   index = column.getEmptyBoxIndex();
                          console.log('column  empty box ='+index);
                          if (index || index ===0) {
                              if (this.hasRoom(index)) {
                                  	column.allocate(value, index);
                                  	poolArr[valueIndex] = null;
                                  	console.log('array after successfull allocation = '+ poolArr);
                                  	return true;
                               }
                           }
       					}while(index);


       				}
       			}
       		}
          return false;
       	}
    }



function getNewPool() {
	var numPool = [];
	var num = 1;
	for (var i = 0; i < 90; i++) {
		numPool[i] = num++;
	}
	return numPool;
}

function getRandom(poolArr) {
    var re ;
    while(!re){
       var random = Math.floor(Math.random() * 90) + 1;
         console.log('####random value' + random)
       	if (poolArr[random - 1]) {
       		re=random - 1
       	}
    }
    return re;

}
