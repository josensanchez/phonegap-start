// Populate the database 
    //
    function populateDB(tx) {
        tx.executeSql('DROP TABLE IF EXISTS DEMO');
        tx.executeSql('CREATE TABLE IF NOT EXISTS DEMO (id unique, lat, lng)');
        alert("populate");
    }

    // Query the database
    //
    function queryDB(tx) {
        tx.executeSql('SELECT * FROM DEMO', [], querySuccess, errorCB);
    }

    // Query the success callback
    //
    function querySuccess(tx, results) {
          alert(results.rows.length);
          console.log("Returned rows = " + results.rows.length);
          // this will be true since it was a select statement and so rowsAffected was 0
          if (!results.rowsAffected) {
            console.log('No rows affected!');
            return false;
          }
          for (var i=0; i<results.rows.length; i++){
              alert(results.rows.item(i).lat + " " + results.rows.item(i).lng);
          }
          // for an insert statement, this property will return the ID of the last inserted row
          console.log("Last inserted row ID = " + results.insertId);
    }

    // Transaction error callback
    //
    function errorCB(err) {
        console.log("Error processing SQL: "+err.code);
    }

    // Transaction success callback
    //
    function successCB() {
        db.transaction(queryDB, errorCB);
    }
    
    var db = null;
