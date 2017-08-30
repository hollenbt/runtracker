var generateReportButton = document.querySelector('#generate');
var begin = document.querySelector('#begin');
var end = document.querySelector('#end');
var report = document.querySelector('tbody');
var runTemplate = document.querySelector('.run-template');

Number.prototype.prependZero = function() {
    if (this < 10 && this >= 0)
        return "0" + String(this);
    return String(this);
}

generateReportButton.addEventListener('click', function() {
    var d = new Date();
    var beginVal = Date.parse(begin.value);
    var endVal = Date.parse(end.value);
    if (!isNaN(beginVal) && !isNaN(endVal) && endVal >= beginVal) {
        beginVal += d.getTimezoneOffset() * 60000;
        endVal += d.getTimezoneOffset() * 60000;

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/report", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        var queryText = "beginString=" + begin.value + "&endString=" + end.value + "&begin=" + beginVal + "&end=" + endVal;
        xhr.send(queryText);

        xhr.addEventListener('load', function() {
            printReport(JSON.parse(xhr.response));
        }, { once: true });
    }
    else alert("Invalid dates entered.");
});

function printReport(results) {
    document.querySelectorAll('tr.run').forEach(function(row) {
        row.parentElement.removeChild(row);
    });

    var total = {
        distance: 0,
        duration: 0
    };

    results.forEach(function(run) {
        var newRun = runTemplate.cloneNode(true);
        newRun.setAttribute('class', 'run');
        newRun.querySelector('.date').textContent = dateString(run);
        newRun.querySelector('.distance').textContent = run.distance;
        newRun.querySelector('.duration').textContent = run.duration;
        newRun.querySelector('.pace').textContent = calcPace(run);
        report.appendChild(newRun);
        total.distance += run.distance;
        total.duration += run.duration;
    });
    
    if (total.distance) {
        var totalStats = runTemplate.cloneNode(true);
        totalStats.setAttribute('class', 'run totals');
        totalStats.querySelector('.date').textContent = "Total";
        totalStats.querySelector('.distance').textContent = total.distance.toFixed(1);
        totalStats.querySelector('.duration').textContent = total.duration;
        totalStats.querySelector('.pace').textContent = calcPace(total);
        report.appendChild(totalStats);
    }
}

function calcPace(run) {
    var rate = run.duration / run.distance; // minutes per mile
    var min = parseInt(rate);
    var sec = Math.round(60 * (rate - min));
    return min + ":" + sec.prependZero();
}

function dateString(run) {
    var s = new Date(run.date).toLocaleString();
    return s.split(',')[0];
}