function loadExampleDataSet() {
    let exampleSet = document.getElementById("data-drop-down-menu").value;
    switch (exampleSet) {
        case "Example 1":
            loadExample(example_1);
            break;
        case "Example 2":
            loadExample(example_2);
            break;
        case "Example 3":
            loadExample(example_3);
            break;
        case "Example 4":
            loadExample(example_4);
            break;
        case "Example 5":
            loadExample(example_5);
            break;
        case "Example 6":
            loadExample(example_6);
            break;
    }
}

function loadExample(params) {
    const tableHeaders = ["Method", "TStartVid", "TEndVid", "TStartAnalyst", "TEndAnalyst"];
    processYTVideo(params[1]);
    loadTable(params[0], "csv", "header", (table) => {
        dataValues = []; // clear exisiting data after table loads
        let rows = table.getRows();
        for (let r = 0; r < rows.length; r++) {
            let u = new Unit();
            u.playMethod = table.getString(r, tableHeaders[0]).toLowerCase();
            u.tStartVid = this.timecodeToSeconds(table.getString(r, tableHeaders[1]));
            u.tEndVid = this.timecodeToSeconds(table.getString(r, tableHeaders[2]));
            u.tStartAnalyst = this.timecodeToSeconds(table.getString(r, tableHeaders[3]));
            u.tEndAnalyst = this.timecodeToSeconds(table.getString(r, tableHeaders[4]));
            dataValues.push(u);
        }
    });
}

function timecodeToSeconds(timecode) {
    // Split the timecode by ':' to extract hours, minutes, and seconds
    const parts = timecode.split(":");

    // Extract hours, minutes, and seconds from the split parts
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);

    // Calculate total seconds
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    return totalSeconds;
}
