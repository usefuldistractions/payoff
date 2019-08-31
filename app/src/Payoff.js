class Payoff {
    constructor(setup) {
        if(typeof setup !== `object`) {
            throw new Error(`setup object required`);
        }

        const {
            startYear, // the year the loan startsa
            duration, // total number of months in the loan terms
            amount, // total amount borrowed
            rate // the vig (apr)
        } = setup;
        const startMonth = (setup.startMonth - 1);
        const startDay = 1; // hard-code start-day to 1

        const monthlyRate = rate / 12;
        const totalRate = monthlyRate + 1;
        const overallRate = Math.pow(totalRate, duration);

        let monthlyPayment = amount * ((monthlyRate * overallRate) / (overallRate - 1));
        monthlyPayment = roundNumber(monthlyPayment, 2);

        let [totalPrincipalPaid, totalInterestPaid, totalPaid] = [0, 0, 0];
        let principal = amount;
        let table = [ ];

        for(let i = 0; i <= duration; i++) {
            let date = new Date(startYear, startMonth + i, startDay);
            const year = date.getFullYear();
            const yearLabel = year.toString();
            const month = date.getMonth()+1;
            const monthLabel = addZeroes(month, 2);
            const day = date.getDate();
            const dayLabel = addZeroes(day, 2);

            const interestPaid = roundNumber(principal * monthlyRate, 2);
            let principalPaid = roundNumber(monthlyPayment - interestPaid, 2);
            
            principal = roundNumber(principal - principalPaid, 2);
            if(principal < 0) {
                principalPaid += principal;
                principal = 0;
            }

            let payment = principalPaid + interestPaid;

            totalPrincipalPaid = roundNumber(totalPrincipalPaid + principalPaid, 2);
            totalInterestPaid = roundNumber(totalInterestPaid + interestPaid, 2);
            totalPaid = roundNumber(totalPaid + payment, 2);

            table.push({
                year,
                month,
                principal,
                interestPaid,
                principalPaid,
                date: `${yearLabel}-${monthLabel}-${dayLabel}`,
            });
        }

        let lastPayment = table[table.length - 1];

        this.monthlyPayment = roundNumber(monthlyPayment, 2);
        this.amount = roundNumber(amount, 2);
        this.startDate = setup.startDate;
        this.principalPaid = totalPrincipalPaid;
        this.interestPaid = totalInterestPaid;
        this.payoffDate = lastPayment.date;
        this.payoffYear = lastPayment.year;
        this.payoffMonth = lastPayment.month;
        this.paid = totalPaid;
        this.table = table;
    }
}

function addZeroes(num, minLength) {
    const string = Math.round(num).toString();
    const zeroesNeeded = minLength - string.length;
    let prefix = '';

    for(let i = 0; i < zeroesNeeded; i++) {
        prefix += `0`;
    }

    return `${prefix}${string}`;
}

function roundNumber(num, places) {
    const factor = Math.pow(10, places);
    const bigVersion = num * factor;
    const rounded = Math.round(bigVersion) / factor;

    return rounded;
}