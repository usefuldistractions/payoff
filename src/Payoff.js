(function(environment) {
    if(typeof define === 'function') {
        define('Payoff', Payoff);
    } else {
        environment.Payoff = Payoff;
    }

    return Payoff;

    /**
     * @class Payoff
     * @classdesc Creates instances of payoffs, pre-calculating all details for the passed loan terms.
     * @constructor
     * @param {object} setup - A hash of available setup parameters.
     * @see {@link Payoff#update} for the available properties passed through to the initial loan setup.
     */
    function Payoff(setup) {
        const payments = [ ]; // a list of extra payments
        let terms = { }; // contains the terms of the loan
        let index = 0; // an incremented index, to be assigned to additional payments

        // private function
        const reconcile = () => {
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
    
            let [total, totalInterest, totalPrincipal] = [0, 0, 0];
            let principal = amount;
            let table = [ ];
    
            for(let i = 0; i <= duration; i++) {
                const date = new Date(startYear, startMonth + i, startDay);
                const year = date.getFullYear();
                const yearLabel = year.toString();
                const month = date.getMonth()+1;
                const monthLabel = padZeroes(month, 2);
                const day = date.getDate();
                const dayLabel = padZeroes(day, 2);
                let extraPayment = 0;

                for(let j = 0; j < payments.length; j++) {
                    const payment = payments[j];
                    const paymentYear = payment.year;
                    const paymentMonth = payment.month;
                    const paymentEndYear = payment.endYear;
                    const paymentEndMonth = payment.endMonth;
                    const recurring = payment.recurring;
                    let matches = false;

                    if(paymentYear === year && paymentMonth === month) { // exact match
                        matches = true;
                    } else if(recurring) { // monthly range of extra payments
                        if(year > paymentYear || (year === paymentYear && month >= paymentMonth)) { // range has started
                            if(typeof paymentEndMonth === `number` && typeof paymentEndYear === `number`) { // end date was passed
                                if(year < paymentEndYear || (year === paymentEndYear && month <= paymentEndMonth)) { // range hasn't ended
                                    matches = true;
                                }
                            } else { // no recurring end date set
                                matches = true;
                            }
                        }
                    }

                    if(matches) {
                        extraPayment += payment.amount;
                    }
                }
    
                const interestPaid = roundNumber(principal * monthlyRate, 2);
                let principalPaid = roundNumber(monthlyPayment - interestPaid + extraPayment, 2);
                
                principal = roundNumber(principal - principalPaid, 2);
                if(principal < 0) {
                    principalPaid += principal;
                    principal = 0;
                }

                const paid = interestPaid + principalPaid;

                table.push({
                    paid,
                    year,
                    month,
                    principal,
                    interestPaid,
                    principalPaid,
                    date: `${yearLabel}-${monthLabel}-${dayLabel}`,
                });

                total += paid;
                totalInterest += interestPaid;
                totalPrincipal += principalPaid;

                if(principal <= 0) {
                    break;
                }
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
            this.interestPaid = roundNumber(totalInterest, 2);
            /** 
             * The minimum monthly payment in order to pay off the loan on time.
             * @type {number}
             **/
            this.monthlyPayment = roundNumber(monthlyPayment, 2);
            /**
             * The total amount paid over the course of the loan.
             * @type {number}
             **/
            this.paid = roundNumber(total, 2);
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
            this.principalPaid = roundNumber(totalPrincipal, 2);
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
        };

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
                value: (newTerms) => {
                    if(typeof terms !== `object`) {
                        throw new Error(`setup object required`);
                    }

                    terms = newTerms;
                    return reconcile();
                }
            },

            /**
             * Add a supplemental payment to the loan.
             * @method Payoff#addPayment
             * @param {object} payment - A hash of payment parameters.
             * @param {number} payment.amount - The amount of extra principal being paid
             * @param {number} payment.month - The month of the extra payment
             * @param {number} payment.year - The year of the extra payment
             * @param {boolean} [payment.recurring=false] - Whether it's a single-time or recurring payment
             * @param {number} [payment.endMonth] - The last month of the recurring payment
             * @param {number} [payment.endYear] - The last year of the recurring payment
             */
            addPayment: {
                value: (payment) => {
                    if(typeof payment.amount !== `number`) {
                        throw new Error(`Payoff.addPayment(): No amount specified`);
                    }

                    if(typeof payment.month !== `number`) {
                        throw new Error(`Payoff.addPayment(): No month specified`);
                    }

                    if(typeof payment.year !== `number`) {
                        throw new Error(`Payoff.addPayment(): No year specified`);
                    }

                    payment.id = index++;

                    if(payment.recurring !== true) {
                        payment.recurring = false;
                    }

                    payments.push(payment);
                    return reconcile();
                }
            },

            /**
             * Remove a supplemental payment from the loan.
             * @method Payoff#removePayment
             * @param {object} options - A hash of option parameters
             * @param {number} options.id - The id of the payment to remove
             */
            removePayment: {
                value: (options) => {
                    if(typeof options.id !== `number`) {
                        throw new Error(`Payoff.removePayment(): No id specified`);
                    }
                    
                    for(let i = 0; i < payments.length; i++) {
                        const payment = payments[i];
                        if(options.id === payment.id) {
                            payments.splice(i, 1);
                            break;
                        }
                    }
                    return reconcile();
                }
            },

            /**
             * The list of supplemental payments that have been added to the loan.
             * @readonly
             * @member {array} Payoff.payments
             */
            payments: {
                get: () => {
                    const stringified = JSON.stringify(payments);
                    return JSON.parse(stringified); // clone the array
                }
            }
        });

        return this.update(setup);
    }

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
})(this);