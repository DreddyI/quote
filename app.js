let symbolsData = {};

$(document).ready(function () {
    let socket = new WebSocket("wss://api.exchange.bitcoin.com/api/2/ws");

    socket.onopen = function (e) {
        socket.send('{"method": "getSymbols","params": {}, "id": "getSymbols"}');
    };

    socket.onmessage = function (event) {
        let response = JSON.parse(event.data);
        switch (response.id) {
            case 'getSymbols':
                for (let i in response.result) {
                    let symbol = response.result[i];
                    symbolsData[symbol.id] = {
                        name: `${symbol.baseCurrency} / ${symbol.quoteCurrency}`,
                        //data: symbol,
                    }
                    socket.send(`{"method": "subscribeTicker","params": {"symbol": "${symbol.id}"}, "id": "ticker"}`);
                }
                break;
            case 'ticker':
                //console.log('subscribe');
                break;
            case undefined:
                if (!response.method || response.method !== 'ticker') {
                    console.error('unknown response', response);
                    break;
                }
                let symbolValue = symbolsData[response.params.symbol];
                let isFirst = typeof symbolValue.bid !== 'undefined';
                let columns = ['bid', 'ask', 'high', 'low', 'last'];
                for (let i in columns) {
                    let column = columns[i]
                    if (symbolValue[column] !== response.params[column]) {
                        if (!isFirst) {
                            //@todo set bgcolor red
                        }
                        symbolValue[column] = response.params[column]
                    }
                }
                symbolsData[response.params.symbol] = symbolValue;
                if (isFirst) {
                    $('#symbolDash').DataTable();
                    document.getElementById('symbolDash').append()
                }
        }
    };

    socket.onclose = function (event) {
        if (event.wasClean) {
            alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
            // e.g. server process killed or network down
            // event.code is usually 1006 in this case
            alert('[close] Connection died');
        }
    };

    socket.onerror = function (error) {
        console.error(error.message);
    };
});
