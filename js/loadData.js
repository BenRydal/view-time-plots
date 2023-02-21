function loadExampleDataSet() {
    let exampleSet = document.getElementById("examples").value;
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
    }
}

function loadExample(params) {
    const tableHeaders = ['Method', 'TStartVid', 'TEndVid', 'TStartAnalyst', 'TEndAnalyst'];
    processYTVideo(params[1]);
    loadTable(params[0], 'csv', 'header', table => {
        dataValues = []; // clear exisiting data after table loads
        let rows = table.getRows();
        for (let r = 0; r < rows.length; r++) {
            let u = new Unit();
            u.playMethod = table.getString(r, tableHeaders[0]).toLowerCase();
            u.tStartVid = table.getNum(r, tableHeaders[1]);
            u.tEndVid = table.getNum(r, tableHeaders[2]);
            u.tStartAnalyst = table.getNum(r, tableHeaders[3]);
            u.tEndAnalyst = table.getNum(r, tableHeaders[4]);
            dataValues.push(u);
        }
    });
}