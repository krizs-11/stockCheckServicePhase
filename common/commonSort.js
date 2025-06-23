const commonSort = (data, subName, sortName) => {
    if (data.length > 0 && subName != '' && sortName != '') {
        let sortGivenData = [...data]
        console.log("inside of the sort");
        // this sort method used to sort the data in a-z format
        if (sortName == 'ASC' || sortName == 'DESC') {
            console.log("sorted mnsbeee", sortName);
            for (let i = 0; i < sortGivenData.length - 1; i++) {
                let flag = false
                for (let j = 0; j < sortGivenData.length - i - 1; j++) {
                    let sortAlphabetHelper = sortName == 'ASC' ? sortGivenData[j][`${subName}`] > sortGivenData[j + 1][`${subName}`] : sortGivenData[j][`${subName}`] < sortGivenData[j + 1][`${subName}`]
                    if (sortAlphabetHelper) {
                        flag = true
                        let swap = sortGivenData[j]
                        sortGivenData[j] = sortGivenData[j + 1]
                        sortGivenData[j + 1] = swap
                    }
                }
                if (!flag) {
                    break;
                }
            }
            return sortGivenData
        }

        // this sort method used to sort the date in lowest to highest format
        else if (sortName == 'OLD' || sortName == 'NEW') {
            if (sortGivenData.length > 0) {

                for (let i = 0; i < sortGivenData.length - 1; i++) {
                    for (let j = 0; j < sortGivenData.length - i - 1; j++) {
                        console.log("inside of the datatt");
                        // Check if the current item and the next item have stock history
                        if (sortGivenData[j].stockHistory && sortGivenData[j].stockHistory.length > 0 && sortGivenData[j + 1].stockHistory.length > 0) {
                            let storeStockLenJ = sortGivenData[j].stockHistory.length;
                            let storeStockLenJPlus1 = sortGivenData[j + 1].stockHistory.length;

                            // Compare the latest dates in the stock history arrays
                            let dateJ = sortGivenData[j].stockHistory[storeStockLenJ - 1];
                            let dateJPlus1 = sortGivenData[j + 1].stockHistory[storeStockLenJPlus1 - 1];
                            let sortDateHelper = sortName == 'OLD' ? new Date(dateJ.createdAt) > new Date(dateJPlus1.createdAt) : new Date(dateJ.createdAt) < new Date(dateJPlus1.createdAt)

                            if (sortDateHelper) {
                                let swapDates = sortGivenData[j]
                                sortGivenData[j] = sortGivenData[j + 1]
                                sortGivenData[j + 1] = swapDates
                            }

                        }

                        else if (sortGivenData[j]?.createdAt) {
                            let dateJ = sortGivenData[j]?.createdAt;
                            let dateJPlus1 = sortGivenData[j + 1].createdAt;
                            let sortHelper = sortName == 'OLD' ? new Date(dateJ) > new Date(dateJPlus1) : new Date(dateJ) < new Date(dateJPlus1)

                            if (sortHelper) {
                                let swap = sortGivenData[j]
                                sortGivenData[j] = sortGivenData[j + 1]
                                sortGivenData[j + 1] = swap
                            }
                        }

                    }
                }
            }

            return sortGivenData
        }

    }
    return data
}

const commonRange = (data, from, to) => {
    // Handle asynchronous data fetching (if applicable)


    if (data?.length > 0) {
        console.log("Filtering data by date range... outside", new Date(from), new Date(to));
        const queryFilterDate = data.filter((findDate) => {
            const findDateISO = new Date(findDate?.createdAt);
            const findDateISOString = findDateISO.toISOString().split('T')[0];

            const fromDate = new Date(from);
            fromDate.setHours(12, 0, 0, 0);
            const fromISO = fromDate.toISOString().split('T')[0];

            const toDate = new Date(to);
            toDate.setHours(12, 0, 0, 0);
            const toISO = toDate.toISOString().split('T')[0];
            console.log("Filtering data by date range...", fromISO, toISO, findDateISO);
            if ((findDateISOString >= fromISO && findDateISOString <= toISO) && (fromISO != toISO)) {
                return findDate
            }
            else if (fromISO == toISO && findDateISOString == fromISO) {
                return findDate
            }
            // return (findDateISO >= fromISO && findDateISO <= toISO) || (findDateISO == fromISO && findDateISO == toISO);
        });
        console.log("Filtering completed. Returning results.");
        return queryFilterDate;
    }
};


module.exports = { commonSort, commonRange }