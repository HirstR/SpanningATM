var http = require("http");
var fs = require("fs");

var accounts = JSON.parse(fs.readFileSync("./accounts.json"));
console.log("accounts loaded: " + Object.keys(accounts).length);

var server = http.createServer(handleMessages);
server.listen(5000);
console.log("Server is listening");

function handleMessages(request, response) {
	if (request.method == "POST") {
		request.setEncoding("UTF-8");
		var body = "";
		request.on("data", function(chunk) { body += chunk.toString(); });

		request.on("end", function() {
			var data = JSON.parse(body);

			var pin = "A" + data.pin;
			var menuChoice = data.menuChoice;
			var input = data.input;

			var atMenu = true;
			var atContinue = false;
			var startOver = false;
			var msg1 = "";
			var msg2 = "[any key to continue]"
			
			switch (menuChoice) {
				case '1':
					var bal = accounts[pin];
					msg1 = "BALANCE: $" + bal;
					atContinue = true;
					break;

				case '2':
					var amt = parseInt(input);
					if (amt > 0) {
						var bal = accounts[pin];
						accounts[pin] += amt;
						fs.writeFileSync("./accounts.json", JSON.stringify(accounts));

						msg1 = "DEPOSITED $" + amt;
						atContinue = true;
			
					} else {
						msg1 = "DEPOSIT AMOUNT";
						msg2 = "(in whole $ only)";
						atMenu = false;
					}
					break;

				case '3':
					var amt = parseInt(input);
					if (amt > 0) {
						if (amt % 20 == 0) {
							var bal = accounts[pin];

							if (bal < amt) {
								msg1 = "INSUFFICIENT FUNDS";
							} else {
								accounts[pin] -= amt;
								fs.writeFileSync("./accounts.json", JSON.stringify(accounts));

								msg1 = "WITHDREW $" + amt;
							}

						} else {
							msg1 = "ONLY $20 BILLS HERE";
						}
						atContinue = true;
			
					} else {
						msg1 = "WITHDRAWAL AMOUNT";
						msg2 = "(in multiples of $20)";
						atMenu = false;
					}
					break;

				case '4':
					startOver = true;
					break;

				case '0':
					if (!accounts.hasOwnProperty(pin))
						startOver = true;
					// fall through

				default:
					msg1 = "1] BAL&emsp;&emsp;&emsp;&emsp;3] WTHD";
					msg2 = "2] DEP&emsp;&emsp;&emsp;&emsp;4] DONE";
					break;
			}

			body = {
				atMenu: atMenu,
				atContinue: atContinue,
				startOver: startOver,
				msg1: msg1,
				msg2: msg2
			};

  		response.writeHead(200, {"Content-Type": "application/json"});
  		response.write(JSON.stringify(body));
  		response.end();
		});
  } else {
  	response.writeHead(200, {"Content-Type": "text/html"});
		response.write(fs.readFileSync("ATM_client.html"));
		response.end();
	}
}
