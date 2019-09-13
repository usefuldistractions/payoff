(function() {
    const environment = (this) ? this : window;

    /**
     * @class Payoff
     * @classdesc Creates instances of payoffs, pre-calculating all details for the passed loan terms.
     * @constructor
     * @param {object} setup - A hash of available setup parameters.
     * @see {@link Payoff#update} for the available properties passed through to the initial loan setup.
     */
    function Payoff(setup) {
        Object.defineProperties(this, {
            /**
             * Recalculate the payoff properties and amortization table.
             * @method Payoff#update
             * @param {object} terms - A hash of loan parameters. Used to define/update the basic terms of a loan.
             * @param {number} terms.amount - The total amount being borrowed.
             * @param {integer} terms.duration - The number of months the loan is spread over.
             * @param {number} terms.rate - The annual interest rate of the loan (ex. 0.05 for 5% APR).
             * @param {integer} terms.startMonth - The month the loan begins (indexed 1-12).
             * @param {integer} terms.startYear - The year the loan begins.
             */
            update: {
                value: (terms) => {
                    if(typeof terms !== `object`) {
                        throw new Error(`setup object required`);
                    }
            
                    const {
                        startMonth, // the month the loan starts; NOTE: (month + 1) for first payment date, -1 for JS zero-indexing
                        startYear, // the year the loan starts
                        duration, // total number of months in the loan terms
                        amount, // total amount borrowed
                        rate // the vig (apr)
                    } = terms;
            
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
                        const monthLabel = padZeroes(month, 2);
                        const day = date.getDate();
                        const dayLabel = padZeroes(day, 2);
            
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
            
                    /**
                     * The initial loan amount.
                     * @member payment#amount
                     * @type {number}
                     **/
                    this.amount = roundNumber(amount, 2);
                    /**
                     * The total interest paid over the course of the loan.
                     * @type {number}
                     **/
                    this.interestPaid = totalInterestPaid;
                    /** 
                     * The minimum monthly payment in order to pay off the loan on time.
                     * @type {number}
                     **/
                    this.monthlyPayment = roundNumber(monthlyPayment, 2);
                    /**
                     * The total amount paid over the course of the loan.
                     * @type {number}
                     **/
                    this.paid = totalPaid;
                    /**
                     * The date of the final payment.
                     * @type {string}
                     **/
                    this.payoffDate = lastPayment.date;
                    /**
                     * The month of the final payment.
                     * @type {number}
                     **/
                    this.payoffMonth = lastPayment.month;
                    /**
                     * The year of the final payment.
                     * @type {number}
                     **/
                    this.payoffYear = lastPayment.year;
                    /**
                     * The total principal paid over the course of the loan.
                     * @type {number}
                     **/
                    this.principalPaid = totalPrincipalPaid;
                    /**
                     * The start year of the loan.
                     * @type {number}
                     **/
                    this.startYear = startYear;
                    /**
                     * The start month of the loan.
                     * @type {number}
                     **/
                    this.startMonth = startMonth;
                    /**
                     * The amortization table of each payment.
                     * @type {array}
                     **/
                    this.table = table;
                }
            }
        });

        return this.update(setup);
    }

    if(environment.define !== undefined) {
        environment.define('Payoff', Payoff);
    } else {
        environment.Payoff = Payoff;
    }

    return Payoff;

    /**
     * @function padZeroes
     * @static
     * @param {number} num - The number being padded.
     * @param {integer} minLength - How minimum length of the final number.
     * @return {string} The passed number, prepended with any extra zeroes needed to reach minLength.
     * @example padZeroes(1, 2); // "01"
     * @example padZeroes(15, 2); // "15"
     * @example padZeroes(12, 3); // "012"
     */
    function padZeroes(num, minLength) {
        const string = Math.floor(num).toString();
        const zeroesNeeded = minLength - string.length;
        let prefix = '';

        for(let i = 0; i < zeroesNeeded; i++) {
            prefix += `0`;
        }

        return `${prefix}${string}`;
    }

    /**
     * @function roundNumber
     * @static
     * @param {number} num - The number being padded.
     * @param {integer} minLength - How minimum length of the final number.
     * @return {number} The passed number, rounded to the passed number of places.
     * @example roundNumber(1.1426, 2); // 1.14
     * @example roundNumber(1.1426, 3); // 1.143
     */
    function roundNumber(num, places) {
        const factor = Math.pow(10, places);
        const bigVersion = num * factor;
        return Math.round(bigVersion) / factor;
    }
})();