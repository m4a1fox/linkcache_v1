var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

EmployeeProvider = function(host, port) {
    this.db= new Db('node-link-cache', new Server(host, port, {safe: false}, {auto_reconnect: true}, {}), {w: 1});
    this.db.open(function(){});
};

EmployeeProvider.prototype.getCollection= function(callback) {
    this.db.collection('user', function(error, employee_collection) {
        if( error ) callback(error);
        else callback(null, employee_collection);
    });
};

EmployeeProvider.prototype.getLinksCollection= function(callback) {
    this.db.collection('links', function(error, links_collection) {
        if( error ) callback(error);
        else callback(null, links_collection);
    });
};

EmployeeProvider.prototype.findAllLinks = function(user, callback) {
    this.getLinksCollection(function(error, links_collection){
        if( error ) callback(error)
        else {
            links_collection.find(user).sort({date: -1}).toArray(function(error, results) {
                if( error ) callback(error)

                else callback(null, results)
            });
        }
    })
};





//find all employees
EmployeeProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, employee_collection) {
        if( error ) callback(error)
        else {
            employee_collection.find().toArray(function(error, results) {
                if( error ) callback(error)
                else callback(null, results)
            });
        }
    });
};


//find an employee by ID
EmployeeProvider.prototype.findByName = function(param, callback) {

    this.getCollection(function(error, employee_collection) {
        if( error ){
            callback(error)
        } else {
            employee_collection.findOne({name: param.name, pass: param.password}, function(error, result) {
                if( error ){
                    callback(error);
                }
                else {
                    callback(null, result);
                }
            });
        }
    });
};


//save new employee
EmployeeProvider.prototype.save = function(employees, callback) {
    this.getCollection(function(error, employee_collection) {
        if( error ) callback(error)
        else {
            if( typeof(employees.length)=="undefined")
                employees = [employees];

            for( var i =0;i< employees.length;i++ ) {
                employee = employees[i];
                employee.created_at = new Date();
            }

            employee_collection.insert(employees, function() {
                callback(null, employees);
            });
        }
    });
};

EmployeeProvider.prototype.addLinkToDb = function(links, callback){


    this.getLinksCollection(function(error, links_collection){
       if(error) callback(error)
        else{
           if( typeof(links.length)=="undefined")
               links = [links];
           for( var i =0;i< links.length;i++ ) {
               link = links[i];
               link.date = new Date();
           }
           links_collection.insert(links, function(error, res){
               callback(null, links)
           })
       }
    });
};

// update an employee
EmployeeProvider.prototype.update = function(employeeId, employees, callback) {
    this.getCollection(function(error, employee_collection) {
        if( error ) callback(error);
        else {
            employee_collection.update(
                {_id: employee_collection.db.bson_serializer.ObjectID.createFromHexString(employeeId)},
                employees,
                function(error, employees) {
                    if(error) callback(error);
                    else callback(null, employees)
                });
        }
    });
};

//delete employee
EmployeeProvider.prototype.delete = function(employeeId, callback) {
    this.getCollection(function(error, employee_collection) {
        if(error) callback(error);
        else {
            employee_collection.remove(
                {_id: employee_collection.db.bson_serializer.ObjectID.createFromHexString(employeeId)},
                function(error, employee){
                    if(error) callback(error);
                    else callback(null, employee)
                });
        }
    });
};

exports.EmployeeProvider = EmployeeProvider;